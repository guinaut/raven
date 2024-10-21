import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const coreMessages = convertToCoreMessages(messages);
  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages: coreMessages,
    /*async onFinish({ text, toolCalls, toolResults, }) {
      // implement your own storage logic:
      //await saveChat({ text, toolCalls, toolResults });
      console.log(JSON.stringify({ text, toolCalls, toolResults }, null, 2));
    },*/
  });

  return result.toDataStreamResponse();
}