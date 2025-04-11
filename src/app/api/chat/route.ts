import { NextRequest, NextResponse } from 'next/server';

import Groq from 'groq-sdk';
import { withOptionalAuth } from '@/middleware/withOptionalAuth';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const model_name = 'llama-3.3-70b-versatile';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Create separate rate limiters for authenticated users and guests
// Guest rate limiter: 10 requests per minute
const guestRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true, // Enable analytics so you can track usage in Upstash console
  prefix: 'ratelimit:guest:minute',
});

// Guest daily rate limiter: 100 requests per day
const guestDailyRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '86400 s'), // 24 hours in seconds
  analytics: true,
  prefix: 'ratelimit:guest:daily',
});

// Authenticated user rate limiter: 20 requests per minute
const authUserRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '60 s'),
  analytics: true,
  prefix: 'ratelimit:auth:minute',
});

// Authenticated user daily rate limiter: 500 requests per day
const authUserDailyRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(500, '86400 s'), // 24 hours in seconds
  analytics: true,
  prefix: 'ratelimit:auth:daily',
});

// Static system message with dummy data only
const STATIC_SYSTEM_MESSAGE = `You are a teaching assistant designed to help users learn by building a structured concept graph. 
Track everything the user has learned and organize topics into a dynamic, evolving graph network. 
This graph captures relationships such as hierarchy, taxonomy, or prerequisite links between concepts.

Your responsibilities:
- Explain topics clearly, like a good professor.
- Add newly discussed concepts as nodes in a graph.
- Show connections between concepts using directional edges (e.g., PREREQUISITE::CONCEPT).
- Update and output the graph after each user query.
- Keep all responses strictly within the required <Response> and <Graph> tags.
- Do not give empty responses or any other text outside the tags.
- Do not provide a graph if the content of response is not graph oriented.

Input Format:

<Graph> // current concept graph (nodes and edges)
NODE1::NODE2
NODE3::NODE2
</Graph>

<Query> // the user's question or learning request
Explain the concept of...
</Query>

Output Format:

<Response> // Your explanation goes here
Provide a clear, structured explanation of the concept, starting with an introduction, followed by elaboration, examples, and any important notes.
</Response>

<Graph> // Updated graph with new concepts and their links
NEW_NODE1::EXISTING_NODE
NEW_NODE2::NEW_NODE1
EXISTING_NODE::NEW_NODE2
</Graph>`;

// Handler function for the chat API, now using withOptionalAuth
async function handler(request: NextRequest) {
  try {
    const { messages, graph, query } = await request.json();

    // Determine the identifier for rate limiting
    const user = request.user;

    // Get IP from headers only since ip property is no longer available in NextRequest
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';

    const identifier = user?.sub || `ip-${ip}`;
    const isAuthenticated = user?.sub ? true : false;

    // Select appropriate rate limiters based on authentication status
    const minuteRatelimiter = isAuthenticated
      ? authUserRatelimit
      : guestRatelimit;
    const dailyRatelimiter = isAuthenticated
      ? authUserDailyRatelimit
      : guestDailyRatelimit;

    // Apply minute rate limiting
    const minuteLimit = await minuteRatelimiter.limit(identifier);

    // Apply daily rate limiting
    const dailyLimit = await dailyRatelimiter.limit(identifier);

    // If either rate limit is exceeded, return 429 Too Many Requests
    if (!minuteLimit.success || !dailyLimit.success) {
      // Determine which limit was exceeded for the error message
      const exceededLimit = !minuteLimit.success ? minuteLimit : dailyLimit;
      const timeFrame = !minuteLimit.success ? 'minute' : 'day';

      return NextResponse.json(
        {
          error: `Rate limit exceeded for ${timeFrame}`,
          limit: exceededLimit.limit,
          remaining: exceededLimit.remaining,
          reset: new Date(exceededLimit.reset).toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': exceededLimit.limit.toString(),
            'X-RateLimit-Remaining': exceededLimit.remaining.toString(),
            'X-RateLimit-Reset': exceededLimit.reset.toString(),
          },
        }
      );
    }

    const queryMessage = `<Graph>\n${graph}\n</Graph>\n<Query>${query}</Query>`;

    const userQueryMessage = {
      role: 'user',
      content: queryMessage,
    };

    // Prepare messages array for the API call
    const apiMessages = [
      {
        role: 'system',
        content: STATIC_SYSTEM_MESSAGE,
      },
      ...messages
        .filter(
          (msg: { role: string; content: string }) => msg.role !== 'system'
        )
        .map((msg: { role: string; content: string }) => {
          // Ensure assistant messages are wrapped in <Response> tags if not already
          if (msg.role === 'assistant' && !msg.content.includes('<Response>')) {
            return {
              ...msg,
              content: `<Response>${msg.content}</Response>`,
            };
          }
          return msg;
        }),
      userQueryMessage,
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: apiMessages,
      model: model_name,
      temperature: 0.4,
      max_tokens: 2048,
    });

    const responseContent = completion.choices[0]?.message?.content || '';

    // Extract <Response> and <Graph> content
    const responseMatch = responseContent.match(
      /<Response>([\s\S]*?)<\/Response>/
    );
    const graphMatch = responseContent.match(/<Graph>([\s\S]*?)<\/Graph>/);

    // Parse the response content from the match
    const responseText = responseMatch ? responseMatch[1].trim() : '';
    const graphText = graphMatch ? graphMatch[1].trim() : '';
    const graphLines = graphText
      .split('\n')
      .filter((line) => line.includes('::') && !line.startsWith('//'));

    console.log(responseContent);

    // Messages are now stored in localStorage via chatStore
    // Removed database save operations since we don't use Prisma for chat messages anymore

    // Include rate limit headers in the response
    return NextResponse.json(
      {
        response: responseText,
        graph: graphLines,
      },
      {
        headers: {
          'X-RateLimit-Limit': minuteLimit.limit.toString(),
          'X-RateLimit-Remaining': minuteLimit.remaining.toString(),
          'X-RateLimit-Reset': minuteLimit.reset.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Apply optional authentication middleware to the handler
export const POST = (request: NextRequest) =>
  withOptionalAuth(request, handler);
