'use server';

import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { RavenState, RecipientType, Raven, Recipient, Contact, User } from '@prisma/client';
import { RavenEmailData, sendRavenEmails } from './_actions';
import { Prisma } from '@prisma/client';
// POST /api/post
// Required fields in body: topic
// Optional fields in body: directive

export type PrismaTransactionalClient = Prisma.TransactionClient;

export interface ExtendedRecipient extends Recipient {
	contact?: Contact;
}
export interface ExtendedRaven extends Raven {
	recipients?: ExtendedRecipient;
}

export async function GET(req: NextRequest, { params }: { params: { raven_id: string } }) {
	try {
		// Get the authentication data from Clerk
		const { userId } = getAuth(req);

		// Check if the user is authenticated
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { raven_id } = params;
		if (raven_id && raven_id.length > 0) {
			const raven = await prisma.raven.findUnique({
				where: {
					id: raven_id,
					author: {
						is: {
							external_id: userId,
						},
					},
				},
				include: {
					recipients: {
						include: { contact: true },
					},
				},
			});
			return NextResponse.json(raven);
		}
		return NextResponse.error();
	} catch (error) {
		console.error('Error fetching ravens:', error);
		return NextResponse.error();
	}
}

export async function POST(req: NextRequest, { params }: { params: { raven_id: string } }) {
	try {
		// Get the authentication data from Clerk
		const { userId } = getAuth(req);

		// Check if the user is authenticated
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { raven_id } = params;
		const { state } = await req.json();
		if (!raven_id || !state) {
			return NextResponse.json({ error: 'Update raven failed.' }, { status: 500 });
		}

		const author: User | null = await prisma.user.findUnique({ where: { external_id: userId } });
		if (!author) {
			return NextResponse.json({ error: 'Update request failed' }, { status: 500 });
		}

		const raven = await prisma.$transaction(async (tx) => {
			const final_raven = await tx.raven.update({
				where: {
					id: raven_id,
					author: {
						is: {
							external_id: userId,
						},
					},
				},
				include: {
					recipients: {
						include: { contact: true },
					},
				},
				data: {
					state: state as RavenState,
				},
			});
			return final_raven;
		});

		const raven_recipients = raven.recipients;
		if (raven_recipients && raven_recipients.length > 0) {
			if (raven.state === 'ACTIVE' && raven.send_type === RecipientType.PRIVATE) {
				const emailData: RavenEmailData[] = [];
				const author_name = author.name ? author.name : 'Raven Keeper';
				for (let i = 0; i < raven_recipients.length; i++) {
					const r = raven_recipients[i];
					if (!r.contact || !r.contact.email || !r.short_link || r.contact.unsubscribed === true) {
						continue;
					}
					const email = r.contact.email ? r.contact.email : '';
					const name = r.contact.name ? r.contact.name : 'there';
					const subject = `A new Raven has arrived! ${raven.topic ? raven.topic : ''}`;
					const url = `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/raven/${r.short_link}`;
					emailData.push({ subject, author: author_name, email, name, url });
				}
				await sendRavenEmails(emailData);
			}
		}

		return NextResponse.json(raven);
	} catch (error) {
		console.log('Error updating raven:', error);
		return NextResponse.error();
	}
}
