import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { withOptionalAuth } from '@/middleware/withOptionalAuth';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Static system message with dummy data only
const STATIC_SYSTEM_MESSAGE = `You are a teaching assistant. Keep track of everything the user has learned. Create a flow of topics in a graph network and links (heirarchy, taxonomy) between them that the user wants to study. Be flexible and accurate and simple in your explanations. Keep all output within <Response> and <Graph> tags. Follow the below format in all responses strictly!

User Input consists of : 

<Graph> // current graph information
NODE1::NODE2
NODE3::NODE2
</Graph>

<Query> // user query
Explain the concept of...
</Query>

Output format consists of : 

<Response> //explain the concepts and other stuff
Introduction to the concept
</Response>

<Graph> // give a graph with nodes denoting new concepts and edges denoting links between them.
NODE1::NODE2
NODE3::NODE2
NODE1::NODE3
</Graph>`;

// Handler function for the chat API, now using withOptionalAuth
async function handler(request: NextRequest) {
  try {
    const { messages, graph, query } = await request.json();

    // We can optionally track if this is a guest or authenticated user
    // const isGuest = request.user?.isGuest === true;
    // const userId = request.user?.sub;

    // Optional logging or different behavior based on auth status
    // console.log(isGuest ? 'Guest user chat' : `Authenticated user chat: ${userId}`);

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
      ...messages.filter(
        (msg: { role: string; content: string }) => msg.role !== 'system'
      ),
      userQueryMessage,
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: apiMessages,
      model: 'meta-llama/llama-4-scout-17b-16e-instruct', // Use appropriate model
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

    // Messages are now stored in localStorage via chatStore
    // Removed database save operations since we don't use Prisma for chat messages anymore

    return NextResponse.json({
      response: responseText,
      graph: graphLines,
    });
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
