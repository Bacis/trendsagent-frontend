import { StreamingTextResponse } from 'ai'

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

function createReadableStream(responseText: string): ReadableStream {
  // Create a new ReadableStream from the response text
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      try {
        // Encode and enqueue the entire response text
        controller.enqueue(encoder.encode(responseText));
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

  const agentId = process.env.AGENT_ID || ""
  const url = process.env.AGENT_URL || ""

  // Call the local agent server
  let response;
  try {
    response = await fetch(
      `${url}/${agentId}/message`,
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

    // Safely handle the response data
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid response from agent server');
    }

    // Extract the text from the first response, ensuring it exists
    const responseText = data[0]?.text || '';

    // Create a readable stream from the response text
    const stream = createReadableStream(responseText);
    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch from agent server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
