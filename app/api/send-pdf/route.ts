export async function POST(req: Request) {
  const formData = await req.formData();

  const file = formData.get('pdf') as File;
  const name = formData.get('name');
  const email = formData.get('email');
  const id = formData.get('id');

  if (!file || !(file instanceof File)) {
    return new Response('Missing PDF file', { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Send to n8n or store somewhere
  const response = await fetch('http://129.154.255.167:5678/webhook/80fcad87-092c-4916-9978-af6b7e9ed626', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id,
      name,
      email,
      base64Pdf: buffer.toString('base64'), 
    }),
  });

  if (!response.ok) {
    return new Response('Failed to send to n8n', { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
