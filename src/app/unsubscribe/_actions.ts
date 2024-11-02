'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
// POST /api/post
// Required fields in body: topic
// Optional fields in body: directive

export type PrismaTransactionalClient = Prisma.TransactionClient;

export const unsubscribeAction = async (email: string): Promise<{ message: string }> => {
	try {
		if (!email) {
			return { message: 'Invalid email provided' };
		}

		await prisma.contact.updateMany({
			where: {
				email: email,
			},
			data: {
				unsubscribed: true,
			},
		});
		return { message: 'You have been unsubscribed' };
	} catch (error) {
		console.error(error);
		return { message: 'Please review your email and try again.' };
	}
};
