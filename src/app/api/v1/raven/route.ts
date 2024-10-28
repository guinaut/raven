import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import prisma from '../../../../lib/prisma';
import { RavenState, RecipientType, User } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSystemChatPrompt, getRavenPlan } from '../../../../utils/prompts';
import Sqids from 'sqids';
// POST /api/post
// Required fields in body: topic
// Optional fields in body: directive
export async function POST(req: Request) {
	try {
		const { id, state } = await req.json();
		if (!id || !state) {
			return NextResponse.error();
		}
		const raven = await prisma.raven.update({
			where: { id: id },
			data: { state: state as RavenState },
		});
		return NextResponse.json(raven);
	} catch (error) {
		console.log('Error updating raven:', error);
		return NextResponse.error();
	}
}

export async function PUT(req: Request) {
	try {
		const { topic, directive, recipients } = await req.json();
		const author: User | null = await prisma.user.findFirst();
		if (!topic || !directive || !author || !recipients || recipients.length === 0) {
			return NextResponse.error();
		}
		const plan_prompt = getRavenPlan({ directive });
		const plan_details = await generateText({
			model: openai('gpt-4o-mini'),
			system: plan_prompt,
			prompt: 'Provide a list of questions and the metrics that will be used to measure the answers.',
		});
		const system_prompt = getSystemChatPrompt({
			directive,
			author_name: author.name,
			plan: plan_details.text,
		});
		const newRavenTxn = await prisma.$transaction(async (tx) => {
			if (recipients.length === 1 && recipients[0].toUpperCase() === 'PUBLIC') {
				const raven = await tx.raven.create({
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
				const rec_saved = await tx.recipient.create({
					data: {
						ravenId: raven.id,
					},
				});
				const calc_short_link = (link_id: number): string => {
					const sqids = new Sqids({
						minLength: 10,
						alphabet: 'waU04Tzt9fHQrqSVKdpimLGIJOgb5ZEFxnXM1kBN6cuhsAvjW3Co7l2RePyY8D',
					});
					const new_link = sqids.encode([link_id]);
					return new_link;
				};
				await tx.recipient.update({
					data: {
						short_link: calc_short_link(rec_saved.short_link_id),
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
								text: plan_details.text,
							},
							recipientId: rec_saved.id,
						},
					],
				});
				return raven;
			} else {
				const raven = await tx.raven.create({
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
				for (let i = 0; i < recipients.length; i++) {
					const rec_email = recipients[i];

					// Find or create a contact for the recipient's email under the current user
					const contact = await prisma.contact.upsert({
						where: { email: rec_email },
						update: {},
						create: {
							email: rec_email,
							userId: author.id,
						},
					});

					const rec_saved = await tx.recipient.create({
						data: {
							ravenId: raven.id,
							private_email: rec_email,
							contactId: contact.id,
						},
					});
					const calc_short_link = (link_id: number): string => {
						const sqids = new Sqids({
							minLength: 10,
							alphabet: 'waU04Tzt9fHQrqSVKdpimLGIJOgb5ZEFxnXM1kBN6cuhsAvjW3Co7l2RePyY8D',
						});
						const new_link = sqids.encode([link_id]);
						return new_link;
					};
					await tx.recipient.update({
						data: {
							short_link: calc_short_link(rec_saved.short_link_id),
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
									text: plan_details.text,
								},
								recipientId: rec_saved.id,
							},
						],
					});
				}
				return raven;
			}
		});
		return NextResponse.json(newRavenTxn);
	} catch (error) {
		console.log('Error creating raven:', error);
		return NextResponse.error();
	}
}
