import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      where: {
        FitnessReport: {
          some: {
            approvedAt: {
              not: null,
            },
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        whatsapp: true,
        uniqueId: true,
        FitnessReport: {
          where: {
            approvedAt: {
              not: null,
            },
          },
          select: {
            reportURL: true,
            approvedAt: true,
          },
          take: 1,
        },
      },
    });

    const formattedClients = clients.map(client => ({
      ...client,
      fitnessReport: client.FitnessReport[0] || null,
    }));

    return NextResponse.json({ clients: formattedClients });
  } catch (err) {
    console.error('[ERROR_FETCHING_APPROVED_REPORTS]', err);
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 });
  }
}
