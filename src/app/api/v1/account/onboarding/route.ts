'use server';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
	try {
		// Get the authentication data from Clerk
		const { userId } = getAuth(req);
		const { name, email } = await req.json();
		if (!name || !email || !userId) {
			console.error('Invalid user onboarding - missing data.');
		}
		const user = await prisma.user.create({
			data: {
				external_id: userId as string,
				name: name,
				email: email,
			},
		});
		return NextResponse.json(user);
	} catch (error) {
		console.error('Error processing onboarding POST request:', error);
		return NextResponse.error();
	}
}
