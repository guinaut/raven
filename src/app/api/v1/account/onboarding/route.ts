import prisma from '../../../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	try {
		const { name, email } = await req.json();
		if (!name || !email) {
			console.error('Invalid user onboarding - missing data.');
		}
		const user = await prisma.user.create({
			data: {
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
