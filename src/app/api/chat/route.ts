import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Static system message with dummy data only
const STATIC_SYSTEM_MESSAGE = `You are a teaching assistant. Keep track of everything the user has learned. Create a flow of topics in a graph network and links (heirarchy, taxonomy) between them that the user wants to study. Be flexible and accurate and simple in your explanations. Keep all output within <Response> and <Graph> tags. Follow the below format in all responses strictly!

User Input consists of : 

<Graph> // current graph information
NODE1::NODE2
NODE3::NODE2
</Graph>

Output format consists of : 

<Response> //explain the concepts and other stuff
Introduction to the concept
</Response>

<Graph> // give a graph with nodes denoting new concepts and edges denoting links between them.
NODE1::NODE2
NODE3::NODE2
NODE1::NODE3
</Graph>`;

export async function POST(request: NextRequest) {
  try {
    const { messages, graph, query } = await request.json();

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

    console.log(apiMessages);

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
