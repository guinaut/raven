'use server';

import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { User } from '@prisma/client';
import { Prisma } from '@prisma/client';
// POST /api/post
// Required fields in body: topic
// Optional fields in body: directive

export type PrismaTransactionalClient = Prisma.TransactionClient;

export async function GET(req: NextRequest, { params }: { params: { author_id: string } }) {
	try {
		// Get the authentication data from Clerk
		const { userId } = getAuth(req);

		// Check if the user is authenticated
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { author_id } = params;
		if (author_id && author_id.length > 0) {
			const author = await prisma.user.findUnique({
				where: {
					external_id: author_id,
				},
			});
			return NextResponse.json(author);
		}
		return NextResponse.error();
	} catch (error) {
		console.error('Error fetching authors:', error);
		return NextResponse.error();
	}
}

export async function POST(req: NextRequest, { params }: { params: { author_id: string } }) {
	try {
		// Get the authentication data from Clerk
		const { userId } = getAuth(req);

		// Check if the user is authenticated
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { author_id } = params;
		const { name, about = '' } = await req.json();
		if (!author_id || !name) {
			return NextResponse.json({ error: 'Update author failed.' }, { status: 500 });
		}

		const author: User | null = await prisma.user.findUnique({ where: { external_id: userId } });
		if (!author) {
			return NextResponse.json({ error: 'Update request failed' }, { status: 500 });
		}

		const result_author = await prisma.$transaction(async (tx) => {
			const final_author = await tx.user.update({
				where: {
					id: author.id,
				},
				data: {
					name,
					about,
				},
			});
			return final_author;
		});

		return NextResponse.json(result_author);
	} catch (error) {
		console.log('Error updating author:', error);
		return NextResponse.error();
	}
}
