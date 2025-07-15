import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, reportURL } = body;

    if (!clientId || !reportURL) {
      return NextResponse.json({ error: 'Missing clientId or reportURL' }, { status: 400 });
    }
    console.log(clientId);

    // ✅ Check if the client exists
    //clientId is clinet unique id
    const existingClient = await prisma.client.findFirst({
      where: { uniqueId: clientId },
    });

    if (!existingClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    let clientDbId=existingClient.id

    const report = await prisma.fitnessReport.upsert({
      where: { clientId:clientDbId },
      update: {
        reportURL,
        approvedAt: new Date(),
      },
      create: {
        clientId: clientDbId,
        reportURL,
        approvedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('[APPROVE_REPORT_ERROR]', error);
    return NextResponse.json({ error: 'Failed to approve report' }, { status: 500 });
  }
}
