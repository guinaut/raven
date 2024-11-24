import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import prisma from '@/lib/prisma';
import { getAnalysisPrompt } from '@/utils/prompts';
import { Message, Recipient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';

const RavenAnalysisSchema = z.object({
	summary: z.string().describe('The summary analysis aggregating all of the participants.'),
	details: z.array(
		z.object({
			id: z.string().describe('Unique identifier for the participant.'),
			values: z.array(
				z.object({
					metric: z.string().describe('The name of the metric property.'),
					value: z.string().describe('The provided value of summary of such metric.'),
				}),
			),
		}),
	),
	aggregate: z.array(
		z.object({
			metric: z.string().describe('The name of the metric property.'),
			value: z.string().describe('An aggregated summary answer across all the participants.'),
		}),
	),
});

interface RavenMessage extends Message {
	content: {
		text: string;
		role: string;
	};
}

export async function POST(req: NextRequest) {
	try {
		// Get the authentication data from Clerk
		const { userId } = getAuth(req);

		// Check if the user is authenticated
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { raven_id } = await req.json();
		if (!raven_id) {
			return NextResponse.error();
		}
		const raven = await prisma.raven.findFirst({
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
					include: {
						messages: true,
					},
				},
			},
		});
		console.log('Analysis for Raven');
		if (raven) {
			let msg_list_content: string = ``;
			let total_messages: number = 0;
			for (let i = 0; i < raven.recipients.length; i++) {
				const recipient: Recipient = raven.recipients[i] as Recipient;
				if (recipient.public_key && recipient.public_key.length > 0) {
					msg_list_content += `
RECICIPENT ${i}: ${raven.send_type === 'PRIVATE' ? recipient.private_email : recipient.public_key}`;
					for (let j = 0; j < raven.recipients[i].messages.length; j++) {
						total_messages++;
						const msg: RavenMessage = raven.recipients[i].messages[j] as RavenMessage;
						if (j === 0) {
							msg_list_content += `
    PLAN:
    ${msg.content.text}
    `;
						} else {
							msg_list_content += `
    ${msg.role}: ${msg.content.text}
                    `;
						}
					}
				}
			}
			console.log('CONTENT', msg_list_content);
			if (total_messages > raven.total_messages) {
				const { object } = await generateObject({
					model: openai('gpt-4o-mini'),
					schema: RavenAnalysisSchema,
					system: getAnalysisPrompt({ directive: raven.directive, plan: raven.plan }),
					prompt: msg_list_content,
				});

				if (object) {
					await prisma.raven.update({
						data: {
							total_messages,
							analysis: object,
						},
						where: {
							id: raven_id,
						},
					});
					return NextResponse.json(object);
				}
			} else {
				return NextResponse.json(raven.analysis);
			}
			//console.log(JSON.stringify(object, null, 2));
		}

		return NextResponse.json({
			summary: 'Not enough information for an analysis.',
		});
	} catch (error) {
		console.log('Error updating raven:', error);
		return NextResponse.error();
	}
}
