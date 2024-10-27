import { NextResponse } from 'next/server';
export async function GET() {
	try {
		/*
      const account = await prisma.raven.findMany({
          include: {
            author: {
              select: { name: true },
            },
            recipients: true,
          },
        });
        */
		return NextResponse.json({});
	} catch (error) {
		console.error('Error fetching ravens:', error);
		return NextResponse.error();
	}
}
