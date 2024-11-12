'use server';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
// POST /api/post
// Required fields in body: topic
// Optional fields in body: directive

export async function GET(req: NextRequest, { params }: { params: { short_link: string } }) {
	try {
		// Get the authentication data from Clerk
		const { userId } = getAuth(req);

		// Check if the user is authenticated
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { short_link } = params;
		if (short_link && short_link.length > 0) {
			const recipient = await prisma.recipient.findFirst({
				where: {
					short_link: short_link as string,
					raven: {
						author: {
							external_id: userId,
						},
					},
				},
				include: {
					messages: true,
					contact: true,
				},
			});
			return NextResponse.json(recipient);
		}
		return NextResponse.error();
	} catch (error) {
		console.error('Error fetching ravens:', error);
		return NextResponse.error();
	}
}
