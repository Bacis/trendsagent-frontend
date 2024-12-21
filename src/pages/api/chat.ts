import { StreamingTextResponse } from 'ai'
import { ChatResponse, Ollama } from 'ollama';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

const ollama = new Ollama({ host: process.env.NGROK_OLLAMA_URL || ''
 })

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
  try {
    const { messages } = await req.json();
    // get last message
    const lastMessage = messages[messages.length - 1];

    // extract youtube url from last message
    const youtubeUrl = lastMessage.content.match(/(https:\/\/www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]+)/g);
    let textData = '';

    // remove youtube url from last message
    if (youtubeUrl && youtubeUrl.length > 0) {
      lastMessage.content = lastMessage.content.replace(youtubeUrl[0], '');

      // make post request to remote endpoint with videoUrl
      const apiResponse = await fetch('https://api.trendsagent.ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apiKey': '',
        },
        body: JSON.stringify({ videoUrl: youtubeUrl[0] })
      });

      const [data] = await apiResponse.json();
      const { text } = data;
      textData = text;
    }

    // Extract the `messages` from the body of the request
    const response = await ollama.chat({
      model: 'llama3',
      messages: [
        {
          role: 'user',
          content: lastMessage.content + " " + textData,
        },
      ],
      stream: true,
    });

    // Create a new ReadableStream using the provided generator
    const stream = createReadableStream(response);

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
