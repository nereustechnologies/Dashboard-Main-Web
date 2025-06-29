import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { data } = await request.json();
    
    // Construct URL with data as query parameter for the preview-print page
    const dataParam = data ? encodeURIComponent(JSON.stringify(data)) : '';
    const previewUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/pdf-dashboard/preview-print${dataParam ? `?data=${dataParam}` : ''}`;
    
    // Return the preview URL instead of generating PDF
    return NextResponse.json({
      success: true,
      previewUrl: previewUrl
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating preview URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview URL' },
      { status: 500 }
    );
  }
}
