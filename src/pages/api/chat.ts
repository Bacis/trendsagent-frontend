// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export default async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json()

  // Get the last message as input
  const input = messages[messages.length - 1].content;
  const url = process.env.AGENT_URL || ""

  // Add timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

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
        signal: controller.signal, // Add abort signal
      } 
    );

    clearTimeout(timeoutId); // Clear timeout if request succeeds

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    const platformTrends = data.platformTrends || [];
    const responseText = platformTrends.map((trend: any) => 
      `**${trend.platform}**:\n\n\n\n${trend.trendsResponse}\n\n\n\n---`
    ).join('\n\n\n\n');

    return new Response(responseText, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });

  } catch (error) {
    clearTimeout(timeoutId); // Clear timeout if request fails
    console.error('Error:', error);
    
    // Specific error message for timeout
    if (error instanceof Error && 'name' in error && error.name === 'AbortError') {
      return new Response(JSON.stringify({ error: 'Request timed out' }), {
        status: 504,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to fetch from agent server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
