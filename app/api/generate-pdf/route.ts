import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Helper function to find local Chrome executable
function getLocalChromePath() {
  const os = require('os');
  const fs = require('fs');
  
  const platform = os.platform();
  let chromePaths: string[] = [];
  
  if (platform === 'win32') {
    chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    ];
  } else if (platform === 'darwin') {
    chromePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ];
  } else {
    chromePaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium',
    ];
  }
  
  for (const path of chromePaths) {
    if (path && fs.existsSync(path)) {
      return path;
    }
  }
  
  return null;
}

export async function POST(request: Request) {
  try {
    const { data } = await request.json();
    
    // Check if we're in a Vercel environment
    const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
    
    let launchOptions;
    
    if (isProduction) {
      // Vercel production configuration
      launchOptions = {
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: true,
      };
    } else {
      // Local development configuration
      const localChromePath = getLocalChromePath();
      if (!localChromePath) {
        throw new Error('Chrome executable not found. Please install Google Chrome.');
      }
      
      launchOptions = {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
        executablePath: localChromePath,
        headless: true,
      };
    }
    
    const browser = await puppeteer.launch(launchOptions);

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
