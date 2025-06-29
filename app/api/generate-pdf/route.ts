import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: Request) {
  try {
    const { data } = await request.json();
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Construct URL with data as query parameter
    const dataParam = data ? encodeURIComponent(JSON.stringify(data)) : '';
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/pdf-dashboard/preview-print${dataParam ? `?data=${dataParam}` : ''}`;
    
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });

    await page.emulateMediaType('screen');

    const pdf = await page.pdf({
      printBackground: true,
      width: '631px',
      height: '892px',
      margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' },
    });

    await browser.close();

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="fitness-report.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
