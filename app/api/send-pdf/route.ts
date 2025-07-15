// /app/api/send-pdf/route.ts
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const n8nRes = await fetch('http://129.154.255.167:5678/webhook/d67d7b2f-bc72-48e6-bc5c-337e576ece53', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!n8nRes.ok) {
      console.error(await n8nRes.text());
      return new Response('Failed to send to n8n', { status: 500 });
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Proxy error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
