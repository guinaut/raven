import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import prisma from '../../../../../lib/prisma';
import { RavenState, RecipientType, Raven, Recipient, Contact, User } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getSystemChatPrompt, getRavenPlan } from '@/utils/prompts';
import { calc_short_link } from './_actions';
import { Prisma } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';
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

async function createPublicRecipients(tx: PrismaTransactionalClient, raven: Raven) {
	const rec_saved = await tx.recipient.create({
		data: {
			ravenId: raven.id,
		},
	});

	await tx.recipient.update({
		data: {
			short_link: await calc_short_link(rec_saved.short_link_id),
		},
		where: {
			id: rec_saved.id,
		},
	});
	await tx.message.createMany({
		data: [
			{
				role: 'system',
				content: {
					role: 'system',
					text: raven.plan,
				},
				recipientId: rec_saved.id,
			},
		],
	});
}

async function createPrivateRecipients(tx: PrismaTransactionalClient, author_id: string, raven: Raven, recipients: string[]) {
	for (let i = 0; i < recipients.length; i++) {
		const rec_email = recipients[i];

		// Find or create a contact for the recipient's email under the current user
		const contact = await prisma.contact.upsert({
			where: { email: rec_email },
			update: {},
			create: {
				email: rec_email,
				userId: author_id,
			},
		});

		const rec_saved = await tx.recipient.create({
			data: {
				ravenId: raven.id,
				private_email: rec_email,
				contactId: contact.id,
			},
		});
		await tx.recipient.update({
			data: {
				short_link: await calc_short_link(rec_saved.short_link_id),
			},
			where: {
				id: rec_saved.id,
			},
		});
		await tx.message.createMany({
			data: [
				{
					role: 'system',
					content: {
						role: 'system',
						text: raven.plan,
					},
					recipientId: rec_saved.id,
				},
			],
		});
	}
}

export async function POST(req: NextRequest) {
	try {
		// Get the authentication data from Clerk
		const { userId } = getAuth(req);

		// Check if the user is authenticated
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id, state, topic, directive, recipients } = await req.json();

		if (!id || !state) {
			return NextResponse.json({ error: 'Update raven failed.' }, { status: 500 });
		}

		const author: User | null = await prisma.user.findUnique({ where: { external_id: userId } });
		if (!author) {
			return NextResponse.json({ error: 'Update request failed' }, { status: 500 });
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const raven_data: any = {};
		if (state && state.length > 0) {
			raven_data.state = state as RavenState;
		}
		if (topic && directive && recipients) {
			raven_data.topic = topic;
			//raven_data.recipients = recipients;
			raven_data.directive = directive;

			const plan_prompt = getRavenPlan({ topic: topic, directive, author_name: author.name, author_about: author.about });

			const plan_details = await generateText({
				model: openai('gpt-4o-mini'),
				system: plan_prompt,
				prompt: `Provide a list of questions and the metrics that will be used to measure the answers.`,
			});
			raven_data.plan = plan_details.text;
			if (recipients && recipients.length === 1 && recipients[0].toUpperCase() === 'PUBLIC') {
				raven_data.send_type = RecipientType.PUBLIC;
			} else {
				raven_data.send_type = RecipientType.PRIVATE;
			}
		}

		const raven = await prisma.$transaction(async (tx) => {
			const tx_raven = await tx.raven.update({
				where: { id: id },
				data: {
					...raven_data,
				},
			});
			await tx.recipient.deleteMany({
				where: {
					ravenId: id,
				},
			});

			if (tx_raven.send_type === RecipientType.PUBLIC) {
				await createPublicRecipients(tx, tx_raven);
			} else {
				await createPrivateRecipients(tx, author.id, tx_raven, recipients);
			}

			const final_raven = await tx.raven.findUnique({
				where: { id: id },
				include: { recipients: true },
			});
			return final_raven;
		});
		return NextResponse.json(raven);
	} catch (error) {
		console.log('Error updating raven:', error);
		return NextResponse.error();
	}
}

export async function PUT(req: NextRequest) {
	try {
		// Get the authentication data from Clerk
		const { userId } = getAuth(req);

		// Check if the user is authenticated
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { topic, directive, recipients } = await req.json();

		const author: User | null = await prisma.user.findUnique({ where: { external_id: userId } });

		if (!topic || !directive || !author || !recipients || recipients.length === 0) {
			return NextResponse.error();
		}
		const plan_prompt = getRavenPlan({ topic: topic, directive, author_name: author.name, author_about: author.about });

		const plan_details = await generateText({
			model: openai('gpt-4o-mini'),
			system: plan_prompt,
			prompt: 'Provide a list of questions and the metrics that will be used to measure the answers.',
		});
		const system_prompt = getSystemChatPrompt({
			topic,
			directive,
			author_name: author.name,
			plan: plan_details.text,
		});
		const newRavenTxn = await prisma.$transaction(async (tx) => {
			if (recipients.length === 1 && recipients[0].toUpperCase() === 'PUBLIC') {
				const tx_raven = await tx.raven.create({
					data: {
						authorId: author.id,
						topic,
						directive,
						guidance: system_prompt,
						plan: plan_details.text,
						state: 'READY' as RavenState,
						send_type: RecipientType.PUBLIC,
					},
				});
				await createPublicRecipients(tx, tx_raven);
				return tx_raven;
			} else {
				const tx_raven = await tx.raven.create({
					data: {
						authorId: author.id,
						topic,
						directive,
						guidance: system_prompt,
						plan: plan_details.text,
						state: 'READY' as RavenState,
						send_type: RecipientType.PRIVATE,
					},
				});
				await createPrivateRecipients(tx, author.id, tx_raven, recipients);
				return tx_raven;
			}
		});
		return NextResponse.json(newRavenTxn);
	} catch (error) {
		console.log('Error creating raven:', error);
		return NextResponse.error();
	}
}
