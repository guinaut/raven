'use server';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
	try {
		// Get the authentication data from Clerk
		const { userId } = getAuth(req);

		// Check if the user is authenticated
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const ravens = await prisma.raven.findMany({
			where: {
				author: {
					is: {
						external_id: userId,
					},
				},
			},
			include: {
				author: {
					select: { name: true },
				},
				recipients: {
					include: { contact: true },
				},
			},
		});
		return NextResponse.json(ravens);
		//eslint-disable-next-line
	} catch (error) {
		return NextResponse.error();
	}
}
