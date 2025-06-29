import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { data } = await request.json();
    
    // Get the base URL more reliably for Vercel deployment
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                   'http://localhost:3000';
    
    // Construct URL with data as query parameter for the preview-print page
    const dataParam = data ? encodeURIComponent(JSON.stringify(data)) : '';
    
    // Check if URL would be too long (common issue on Vercel)
    const basePreviewUrl = `${baseUrl}/pdf-dashboard/preview-print`;
    const fullUrl = `${basePreviewUrl}?data=${dataParam}`;
    
    if (fullUrl.length > 8000) {
      console.warn('URL too long, data size:', dataParam.length);
      // For large data, just return the base URL and let the client handle the data
      return NextResponse.json({
        success: true,
        previewUrl: basePreviewUrl,
        data: data, // Include data in response for client-side handling
        isLargeData: true
      }, { status: 200 });
    }
    
    const previewUrl = `${basePreviewUrl}${dataParam ? `?data=${dataParam}` : ''}`;
    
    // Return the preview URL instead of generating PDF
    return NextResponse.json({
      success: true,
      previewUrl: previewUrl,
      isLargeData: false
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating preview URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview URL' },
      { status: 500 }
    );
  }
}
