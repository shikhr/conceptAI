'use client';

import { useState } from 'react';
import ChatPanel from '@/components/ChatPanel';
import GraphPanel from '@/components/GraphPanel';

export default function Home() {
  // State to manage chat history and graph data
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [graphData, setGraphData] = useState<string[]>([]);

  // Function to handle new messages
  const handleSendMessage = async (message: string) => {
    // Add user message to chat history
    const newChatHistory = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(newChatHistory);

    try {
      // Prepare the current graph data for the API request
      const currentGraph = graphData.join('\n');

      // Call API with the current graph and user query
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newChatHistory,
          graph: currentGraph,
          query: message,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      // Update chat history with assistant's response
      setChatHistory([
        ...newChatHistory,
        { role: 'assistant', content: data.response },
      ]);

      // Update graph data
      if (data.graph && data.graph.length > 0) {
        setGraphData(data.graph);
      }
    } catch (error) {
      console.error('Error:', error);
      setChatHistory([
        ...newChatHistory,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.',
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Left panel - Chat */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full p-4 overflow-auto border-r border-gray-300">
        <ChatPanel messages={chatHistory} onSendMessage={handleSendMessage} />
      </div>

      {/* Right panel - Graph */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full p-4 overflow-auto">
        <GraphPanel graphData={graphData} />
      </div>
    </div>
  );
}
