'use server';

import prisma from '../../../../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
	try {
		// Get the authentication data from Clerk
		const { userId } = getAuth(req);

		// Check if the user is authenticated
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { author_id } = await req.json();
		if (!author_id) {
			return NextResponse.error();
		}
		const contacts = await prisma.contact.findMany({
			where: {
				userId: author_id,
			},
		});
		return NextResponse.json(contacts);
	} catch (error) {
		console.error('Error fetching contacts:', error);
		return NextResponse.error();
	}
}
