import { StreamingTextResponse } from 'ai'
import { ChatResponse, Ollama } from 'ollama';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

function createReadableStream(generator: AsyncGenerator<ChatResponse>): ReadableStream {
  // Create a new ReadableStream using the provided generator
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of generator) {
          // Convert the chunk into bytes and enqueue into the stream
          controller.enqueue(encoder.encode(chunk.message.content));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return stream;
}

export default async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json()

  // Get the last message as input
  const input = messages[messages.length - 1].content;

  // Default to port 3000 if not specified
  const serverPort = "3000"
  const agentId = "4b386bfa-1ab6-0a8d-b9f2-9b2291028b78"

  // Call the local agent server
  let response;
  try {
    response = await fetch(
      `http://localhost:${serverPort}/${agentId}/message`,
      {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input,
          userId: "user",
          userName: "User",
        }),
      } 
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    // Extract the text from the first response
    const responseText = data[0].text;

    return new Response(responseText);
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch from agent server');
  }
  
}
