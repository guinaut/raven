import prisma from '../../../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
	try {
		const { userId } = await req.json();
		if (!userId) {
			return NextResponse.error();
		}
		const contacts = await prisma.contact.findMany({
			where: {
				userId,
			},
		});
		return NextResponse.json(contacts);
	} catch (error) {
		console.error('Error fetching contacts:', error);
		return NextResponse.error();
	}
}
