import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const customerId = formData.get('customerId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'No customerId provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory and customer subdirectory if they don't exist
    const uploadDir = join(process.cwd(), 'uploads');
    const customerDir = join(uploadDir, customerId);

    // Ensure the customer directory exists
    // Use fs.mkdir with recursive: true
    const fs = await import('fs/promises');
    await fs.mkdir(customerDir, { recursive: true });

    // Write the file to the customer directory
    await writeFile(join(customerDir, file.name), buffer);

    return NextResponse.json(
      { message: 'File uploaded successfully', filename: file.name, customerId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}
