import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import prisma from '../../../../../../lib/prisma';
import { Message, Recipient } from '@prisma/client';
import { NextResponse } from 'next/server';
// POST /api/post
// Required fields in body: topic
// Optional fields in body: directive

interface RavenMessage extends Message {
	content: {
		text: string;
		role: string;
	};
}

export async function POST(req: Request) {
	try {
		const { raven_id } = await req.json();
		if (!raven_id) {
			return NextResponse.error();
		}
		const raven = await prisma.raven.findFirst({
			where: { id: raven_id },
			include: {
				recipients: {
					include: {
						messages: true,
					},
				},
			},
		});
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

			if (total_messages > raven.total_messages) {
				const { object } = await generateObject({
					model: openai('gpt-4o-mini'),
					output: 'no-schema',
					system: `You are a data analyst that is reviewing a conversation based on an interview plan and topic.
Provide a structured json result using the variables identified in the plan attached based on the conversations provided.
The result should be a "data" collection where each variable is an array of all answers provided.
Last, include a variable called "summary" that provides a summary of all the answers.
The format should be:
interface RavenAnalysis {
	summary: string;
	data: {
		[key: string]: string[];
	};
}

DIRECTIVE:
    ${raven.directive}

PLAN:
    ${raven.plan}
            `,
					prompt: msg_list_content,
				});
				if (object) {
					console.log('Running new analysis');
					await prisma.raven.update({
						data: {
							total_messages,
							analysis: object,
						},
						where: {
							id: raven_id,
						},
					});
					console.log(JSON.stringify(object, null, 2));
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
