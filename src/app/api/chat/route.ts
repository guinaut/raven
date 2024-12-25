import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText, generateText, generateObject, tool } from 'ai'; //generateObject
import prisma from '../../../lib/prisma';
import { z } from 'zod';
import * as mathjs from 'mathjs';
import { getWrapUpPrompt } from '@/utils/prompts';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface ChatMessage {
	role: string;
	content: { role: string; text: string };
	recipientId: string;
}

async function saveChat(msgs: ChatMessage[]) {
	try {
		await prisma.$transaction(async (tx) => {
			await tx.message.createMany({
				data: [...msgs],
			});
		});
	} catch (error) {
		console.error('Error saving chat:', error);
	}
}

async function saveFindings(recipient_id: string, findings: any) {
	try {
		await prisma.$transaction(async (tx) => {
			// occaionally the findings come in as pieces.  So first we need to merge them.
			const current_recipient = await tx.recipient.findFirst({
				where: {
					id: recipient_id,
				},
				select: {
					findings: true,
				},
			});
			// merge the findings
			const orig_findings = current_recipient ? (current_recipient.findings as object) : {};
			const new_findings = { ...orig_findings, ...findings };
			await tx.recipient.update({
				data: {
					findings: new_findings,
				},
				where: {
					id: recipient_id,
				},
				select: {
					id: true,
					contact: true,
					findings: true,
				},
			});
		});
	} catch (error) {
		console.error('Error saving findings:', error);
	}
}

async function saveChatMetrics(recipient_id: string, summary: string, plan_metrics: string) {
	try {
		const metrics = await generateMetricsObject(summary, plan_metrics);
		if (metrics) {
			saveFindings(recipient_id, metrics);
			return {
				message: 'Success. Metrics saved.',
			};
		}
		return {
			message: 'ERROR: Format Error. Try again with a JSON object',
		};
	} catch (error) {
		return {
			message: 'Error: Not enough information',
			error: error,
		};
	}
}

async function getAllFindingsForRaven(plan_metrics_names: string, recipient_id: string) {
	try {
		const data = await prisma.$transaction(async (tx) => {
			const recipient = await tx.recipient.findFirst({
				where: {
					id: recipient_id,
				},
			});
			if (recipient) {
				return await tx.recipient.findMany({
					where: {
						ravenId: recipient.ravenId,
						id: {
							not: recipient_id,
						},
						findings: {
							not: undefined,
						},
					},
					select: {
						findings: true,
						contact: true,
						private_email: true,
					},
				});
			}
			return [];
		});
		return data;
	} catch (error) {
		return {
			message: 'Error: Not enough information',
			error: error,
		};
	}
}

async function wrapUp(creator_name: string, findings: string) {
	try {
		const wrapup_prompt = getWrapUpPrompt({ author_name: creator_name });
		const wrapup_summary = await generateText({
			model: openai('gpt-4o-mini'),
			system: wrapup_prompt,
			prompt: findings,
		});
		return wrapup_summary;
	} catch (error) {
		console.error('Error getting chat metrics:', error);
	}
}

async function generateMetricsObject(summary: string, metrics: string) {
	try {
		const metrics_obj = await generateObject({
			model: openai('gpt-4o-mini'),
			system: "Convert metrics from the user's input into a JSON object.",
			prompt: metrics,
			output: 'no-schema',
		});
		return metrics_obj.object;
	} catch (error) {
		console.error('Error getting chat metrics:', error);
	}
}

export async function POST(req: Request) {
	const { messages, recipient_id } = await req.json();

	if (messages && messages.length > 50) {
		return new Response('Message limit exceeded');
	}
	const coreMessages = convertToCoreMessages(messages);
	const result = await streamText({
		model: openai('gpt-4o-mini'),
		experimental_toolCallStreaming: true,
		experimental_telemetry: { isEnabled: true },
		messages: coreMessages,
		maxSteps: 5,
		tools: {
			calculate: tool({
				description:
					'A tool for evaluating mathematical expressions. ' + 'Example expressions: ' + "'1.2 * (2 + 4.5)', '12.7 cm to inch', 'sin(45 deg) ^ 2'.",
				parameters: z.object({ expression: z.string() }),
				execute: async ({ expression }) => {
					return mathjs.evaluate(expression);
				},
			}),
			save_metrics: tool({
				description:
					'When the user has answered ALL of the required metrics, condense the chat into a metrics block per the plan guidance and save it. Do not ask for permission. Just do it.',
				parameters: z.object({
					summary: z.string(),
					plan_metrics: z.string(),
				}),
				execute: async ({ summary, plan_metrics }) => {
					const result = await saveChatMetrics(recipient_id, summary, plan_metrics);
					return result;
				},
			}),
			get_metric_overview: tool({
				description:
					'If the user asks for an overview of all recipients metrics across the survey, then provide a summary of all metrics. IMPORTANT: If the findings includes names, do not use them.',
				parameters: z.object({
					plan_metrics_names: z.string(),
				}),
				execute: async ({ plan_metrics_names }) => {
					return await getAllFindingsForRaven(plan_metrics_names, recipient_id);
				},
			}),
			wrap_up: tool({
				description:
					'After the user has provided all of the important information and the metrics have been collected, then wrap up the conversation',
				parameters: z.object({ creator_name: z.string(), findings: z.string() }),
				execute: async ({ creator_name, findings }) => {
					return await wrapUp(creator_name, findings);
				},
			}),
		},
		onFinish: async ({ text }) => {
			const last_msg = coreMessages[coreMessages.length - 1];
			const persistMessages: ChatMessage[] = [
				{
					role: last_msg.role,
					content: {
						role: last_msg.role,
						text: last_msg.content as string,
					},
					recipientId: recipient_id,
				},
				{
					role: 'assistant',
					content: {
						role: 'assistant',
						text: text,
					},
					recipientId: recipient_id,
				},
			];
			await saveChat(persistMessages);
		},
	});
	return result.toDataStreamResponse();
}
