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
    const { messages } = await request.json();

    // Prepare messages array for the API call
    const apiMessages = [
      {
        role: 'system',
        content: STATIC_SYSTEM_MESSAGE,
      },
      ...messages.filter((msg: any) => msg.role !== 'system'),
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: apiMessages,
      model: 'llama3-70b-8192', // Use appropriate model
      temperature: 0.5,
      max_tokens: 2048,
    });

    console.log(apiMessages);

    const responseContent = completion.choices[0]?.message?.content || '';

    // Extract <Response> and <Graph> content
    const responseMatch = responseContent.match(
      /<Response>([\s\S]*?)<\/Response>/
    );
    const graphMatch = responseContent.match(/<Graph>([\s\S]*?)<\/Graph>/);

    const response = responseMatch ? responseMatch[1].trim() : '';
    const graphText = graphMatch ? graphMatch[1].trim() : '';
    const graphLines = graphText
      .split('\n')
      .filter((line) => line.includes('::') && !line.startsWith('//'));

    return NextResponse.json({
      response: responseContent,
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
