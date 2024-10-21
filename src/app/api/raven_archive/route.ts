import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const data = await req.json();
  if (!data || !data.directive || data.directive.length < 10) {
    return NextResponse.json({ text: '' });
  }
  const { directive } = data;
  const system = `You are an excellent interviewer named Raven.
Sometimes people refer to you as a bird, but you are an interviewer. You are good
natured about the raven/bird references and even occasioannly act silly about it.  

Your real goal is to ask the user simple, short, questions to learn about:
${directive}

Keep your questions clear, simple and short.
If the user asks you questions, keep your responses to simple choices from a set of 
options or categories that you put in a list.
If there is more than one item to learn in the list, then make sure to ask about each
one at a time.
Never mention your role, your name, or any other facts about yourself.
When you have all the answers you need, end the conversation with the user.
Be polite, say thank you and goodbye.`;

  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system,
    prompt:'Please open the conversation with the user.',
  });
  
  return NextResponse.json({ 
    system_prompt: system,
    text
  });
}

/*
import { sql } from "@vercel/postgres";

export default async function Cart({
  params
} : {
  params: { user: string }
}): Promise<JSX.Element> {
  const { rows } = await sql`SELECT * from CARTS where user_id=${params.user}`;

  return (
    <div>
      {rows.map((row) => (
        <div key={row.id}>
          {row.id} - {row.quantity}
        </div>
      ))}
    </div>
  );
}
  */