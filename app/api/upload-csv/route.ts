import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import prisma from "@/lib/prisma";

// Log the configuration (without sensitive data)
console.log("S3 Configuration:", {
  region: process.env.NAWS_S3_REGION,
  bucket: process.env.NAWS_S3_BUCKET_NAME,
  hasAccessKey: !!process.env.NAWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.NAWS_SECRET_ACCESS_KEY,
});

const s3Client = new S3Client({
  region: process.env.NAWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.NAWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NAWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // This can help with some DNS resolution issues
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, testId, fileName, fileType, csvContent } = body;


    if (!customerId || !testId || !fileName || !fileType || !csvContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    if (!process.env.NAWS_S3_BUCKET_NAME) {
      console.error("S3 bucket name is not configured.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }


    const exerciseName = fileName.split("/")[0];
    const actualFileName = fileName.split("/").slice(1).join("/");

    if (!exerciseName || !actualFileName) {
      return NextResponse.json(
        { error: "Invalid fileName format. Expected 'exerciseName/fileName.csv'"},
        { status: 400 },
      );
    }

    console.log("ferrefrffr" ,csvContent)

    const exercise = await prisma.exercise.findFirst({
      where: { name: exerciseName, testId: testId },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: `Exercise '${exerciseName}' not found for test '${testId}'.` },
        { status: 404 },
      );
    }

    const s3Key = `${customerId}/${testId}/${fileName}`;
    console.log("Attempting to upload to S3:", {
      bucket: process.env.NAWS_S3_BUCKET_NAME,
      key: s3Key,
      region: process.env.NAWS_S3_REGION,
    });

    const params = {
      Bucket: process.env.NAWS_S3_BUCKET_NAME,
      Key: s3Key,
      Body: csvContent,
      ContentType: "text/csv",
    };

    try {
      await s3Client.send(new PutObjectCommand(params));
      console.log("Successfully uploaded to S3:", s3Key);
    } catch (s3Error) {
      console.error("Detailed S3 Error:", {
        error: s3Error,
        message: s3Error instanceof Error ? s3Error.message : "Unknown error",
        stack: s3Error instanceof Error ? s3Error.stack : undefined,
        config: {
          region: process.env.NAWS_S3_REGION,
          bucket: process.env.NAWS_S3_BUCKET_NAME,
          endpoint: `https://${process.env.NAWS_S3_BUCKET_NAME}.s3.${process.env.NAWS_S3_REGION}.amazonaws.com`,
        },
      });
      throw s3Error;
    }

    await prisma.exerciseAssetFile.create({
      data: {
        exerciseId: exercise.id,
        fileName: actualFileName,
        fileType: fileType,
        s3PathRaw: s3Key,
      },
    });

    return NextResponse.json({ message: "File uploaded successfully to S3", s3Key }, { status: 200 });

  } catch (error) {
    console.error("Error uploading to S3:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ 
      error: "Failed to upload file to S3", 
      details: errorMessage,
      config: {
        region: process.env.NAWS_S3_REGION,
        bucket: process.env.NAWS_S3_BUCKET_NAME,
        endpoint: `https://${process.env.NAWS_S3_BUCKET_NAME}.s3.${process.env.NAWS_S3_REGION}.amazonaws.com`,
      }
    }, { status: 500 });
  }
} 