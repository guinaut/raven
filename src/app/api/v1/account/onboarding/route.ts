import prisma from '../../../../../lib/prisma';
import { User } from '@prisma/client';
import { NextResponse } from 'next/server';

interface UserData {
	name: string;
	email: string;
}

export const addUser = async (userData: UserData): Promise<User> => {
	const { name, email } = userData;
	if (!name || !email) {
		console.error('Invalid user onboarding - missing data.');
	}
	return await prisma.user.create({
		data: {
			name: name,
			email: email,
		},
	});
};

export async function POST(req: Request) {
	try {
		const { name, email } = await req.json();
		const user = await addUser({ name, email });
		return NextResponse.json(user);
	} catch (error) {
		console.error('Error processing onboarding POST request:', error);
		return NextResponse.error();
	}
}
