// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export default async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json()

  // Get the last message as input
  const input = messages[messages.length - 1].content;
  const url = process.env.AGENT_URL || ""

  // Call the local agent server
  let response;
  try {
    response = await fetch(
      `${url}/trends`,
      {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input,
        }),
      } 
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const platformTrends = data.platformTrends || "";

    return new Response(platformTrends, {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch from agent server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
