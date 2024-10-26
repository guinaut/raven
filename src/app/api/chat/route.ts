import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';
import prisma from '../../../lib/prisma';
import { RavenState, User, Message } from '@prisma/client';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

async function saveChat(msgs: any[], recipient_id: string) {
  try {
    const newRavenTxn = await prisma.$transaction(async (tx) => {
      await tx.message.createMany({
        data: [
          ...msgs
        ]
      });
    });

  } catch (error) {
    console.error('Error saving chat:', error);
  }
}

export async function POST(req: Request) {
  const { messages, recipient_id } = await req.json();
  const coreMessages = convertToCoreMessages(messages);
  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages: coreMessages,
    async onFinish({text}) {
      const last_msg = coreMessages[coreMessages.length-1];
      const persistMessages = [
        {
          role: last_msg.role,
          content: {
            role: last_msg.role,
            text: last_msg.content,
          },
          recipientId: recipient_id,
        },
        {
          role: "assistant",
          content: {
            role: "assistant",
            text: text,
          },
          recipientId: recipient_id,
        }
      ];
      await saveChat(persistMessages, recipient_id);
    },
  });
  

  return result.toDataStreamResponse();
}