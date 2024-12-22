import { StreamingTextResponse } from 'ai'

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

function createReadableStream(responseText: string): ReadableStream {
  // Create a new ReadableStream that simulates streaming with word-by-word delay
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const words = responseText.split(/\s+/);
      
      let index = 0;
      
      const streamWords = () => {
        if (index < words.length) {
          // Encode and enqueue the next word with a space
          const wordToEnqueue = words[index] + (index < words.length - 1 ? ' ' : '');
          controller.enqueue(encoder.encode(wordToEnqueue));
          index++;

          // Schedule the next word with a slight delay
          setTimeout(streamWords, 50 + Math.random() * 100);
        } else {
          // Close the stream when all words are sent
          controller.close();
        }
      };

      // Start streaming words
      streamWords();
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
      `${url}/${agentId}/trends`,
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

    // Extract the trendsResponse text
    const responseText = data.trendsResponse || '';

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
