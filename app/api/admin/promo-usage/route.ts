import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const promoCodeDetails = await prisma.promoCode.findMany({
      where: { isActive: true },
      include: {
        BookingPromo: {
          include: {
            Booking: {
              include: {
                client: true,
                timeSlot: {
                  include: {
                    slotDate: {
                      include: {
                        location: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const header = [
      'Promo Code',
      'Client Name',
      'Email',
      'WhatsApp',
      'Session Date',
      'Start Time',
      'Location',
      'Payment Status',
    ];

    const rows = promoCodeDetails.flatMap((promo) =>
      promo.BookingPromo.map((bp) => {
        const booking = bp.Booking;
        const client = booking.client;
        const timeSlot = booking.timeSlot;
        const location = timeSlot?.slotDate?.location;

        return [
          promo.code,
          client.fullName,
          client.email,
          client.whatsapp,
          timeSlot?.slotDate?.date.toISOString().split('T')[0],
          new Date(timeSlot.startTime).toLocaleTimeString(),
          location?.name,
          booking.paymentStatus,
        ];
      })
    );

    const csvContent =
      header.join(',') +
      '\n' +
      rows.map((row) => row.map((val) => `"${val}"`).join(',')).join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="promo-code-usage.csv"',
      },
    });
  } catch (error) {
    console.error('[PROMO_USAGE_ERROR]', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
