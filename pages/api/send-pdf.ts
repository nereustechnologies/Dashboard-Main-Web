// pages/api/send-pdf.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // ⛔ disables default parser for file upload
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Form parse error:', err);
      return res.status(500).json({ message: 'Form parsing failed' });
    }

    console.log('✅ Fields:', fields);
    console.log('✅ Files:', files);

    const { name, email, id } = fields;
const pdfFile = (Array.isArray(files.pdf) ? files.pdf[0] : files.pdf) as File;


    if (!pdfFile || !pdfFile.filepath) {
      console.error('❌ Missing PDF file. Parsed:', pdfFile);
      return res.status(400).json({ message: 'PDF file missing' });
    }

    const pdfBuffer = fs.readFileSync(pdfFile.filepath);

    // 🔥 Send to n8n
    const webhook = 'http://129.154.255.167:5678/webhook/80fcad87-092c-4916-9978-af6b7e9ed626';
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        id,
        base64Pdf: pdfBuffer.toString('base64'),
      }),
    });

    if (!response.ok) {
      console.error('❌ Failed to send to n8n:', await response.text());
      return res.status(500).json({ message: 'Failed to send to n8n' });
    }

    return res.status(200).json({ message: '✅ PDF sent to n8n successfully!' });
  });
}
