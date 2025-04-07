# ConceptAI: Intelligent Concept Mapping with LLM Integration

An interactive knowledge visualization tool that merges graph-based concept mapping with LLM-powered learning assistance.

![ConceptAI](https://i.imgur.com/4FyIXax.png)

## Overview

ConceptAI helps you build and visualize conceptual knowledge networks while leveraging AI to deepen your understanding. The application combines interactive graph visualization with natural language processing to create a powerful learning tool.

## Key Features

### 📊 Visual Concept Mapping

- **Interactive Graph Visualization**: Build and manipulate knowledge networks using a dynamic, force-directed graph layout
- **Automatic Layout**: Concepts are automatically arranged in a logical, hierarchical structure
- **Light/Dark Mode**: Comfortable viewing in any environment

### 🧠 LLM-Powered Learning

- **AI-Assisted Exploration**: Ask questions about concepts and get intelligent responses
- **Contextual Understanding**: The system understands the relationships between concepts
- **Concept Generation**: Get suggestions for related concepts to expand your knowledge network

### 🔄 Real-time Interaction

- **Dynamic Graph Updates**: See your knowledge network grow in real-time as you learn
- **Bidirectional Learning**: Ask questions about the graph or build the graph through conversations

## Technology Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Graph Visualization**: XYFlow/ReactFlow
- **Language Models**: Groq API Integration
- **Layout Algorithm**: Dagre for hierarchical graph layouts

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (copy `.env.example` to `.env` and add your Groq API key)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Start by asking a question in the chat panel
2. Explore the generated concepts in the graph view
3. Click on nodes to see more information about each concept
4. Continue the conversation to expand your knowledge network

## Future Enhancements

- Export/import of knowledge graphs
- Collaborative concept mapping
- Integration with additional learning resources
- Mobile-optimized interface

## License

[MIT](LICENSE)
