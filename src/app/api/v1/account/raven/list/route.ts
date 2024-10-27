import prisma from '../../../../../../lib/prisma';
import { NextResponse } from 'next/server';
export async function GET() {
	try {
		const ravens = await prisma.raven.findMany({
			include: {
				author: {
					select: { name: true },
				},
				recipients: true,
			},
		});
		return NextResponse.json(ravens);
	} catch (error) {
		console.error('Error fetching ravens:', error);
		return NextResponse.error();
	}
}
