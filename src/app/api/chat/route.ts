import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';
import prisma from '../../../lib/prisma';

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

export async function POST(req: Request) {
	const { messages, recipient_id } = await req.json();
	if (messages && messages.length > 50) {
		return new Response('Message limit exceeded');
	}
	const coreMessages = convertToCoreMessages(messages);
	const result = await streamText({
		model: openai('gpt-4o-mini'),
		messages: coreMessages,
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
