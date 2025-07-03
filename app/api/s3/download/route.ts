import { NextRequest, NextResponse } from "next/server"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { verifyAuth } from "@/lib/auth"
import { Readable } from "stream"

// Build S3 client – fall back to default region/credential chain if env vars are missing
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || "us-east-1",
  // Only inject explicit credentials when both values are present; otherwise rely on SDK default chain
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
})


// Helper: convert Node.js Readable into Buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Uint8Array[] = []
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

// Helper: parse provided path → bucket & key
function parseS3Path(rawPath: string): { bucket: string; key: string } | null {
  if (!rawPath) return null

  // If full s3:// URI
  if (rawPath.startsWith("s3://")) {
    const withoutScheme = rawPath.slice("s3://".length)
    const firstSlash = withoutScheme.indexOf("/")
    if (firstSlash === -1) return null
    return {
      bucket: withoutScheme.slice(0, firstSlash),
      key: withoutScheme.slice(firstSlash + 1),
    }
  }

  // Otherwise treat as key belonging to default bucket
  const bucket = (process.env.AWS_S3_BUCKET_NAME || "neureusbucketproto") as string
  return { bucket, key: rawPath.replace(/^\/*/, "") }
}

export async function GET(request: NextRequest) {
  try {
    // Optional auth (adjust as needed)
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const rawPath = url.searchParams.get("path")
    if (!rawPath) {
      return NextResponse.json({ error: "Missing 'path' query parameter" }, { status: 400 })
    }

    const parsed = parseS3Path(rawPath)
    if (!parsed) {
      return NextResponse.json({ error: "Invalid S3 path provided" }, { status: 400 })
    }

    const { bucket, key } = parsed

    // Fetch object from S3
    const command = new GetObjectCommand({ Bucket: bucket, Key: key })
    const data = await s3Client.send(command)

    // Convert stream to buffer (suitable for NextResponse)
    const bodyStream = data.Body as Readable
    const buffer = await streamToBuffer(bodyStream)

    const response = new NextResponse(buffer, {
      headers: {
        "Content-Type": data.ContentType || "text/csv",
        "Content-Disposition": `inline; filename=\"${key.split("/").pop()}\"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    })

    return response
  } catch (error) {
    console.error("Error fetching S3 object:", error instanceof Error ? error.stack : error)
    return NextResponse.json({ error: "Failed to fetch requested file" }, { status: 500 })
  }
} 