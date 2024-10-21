import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import prisma from '../../../../lib/prisma';
import { RavenState, User } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSystemChatPrompt, getRavenPlan } from '../../../../utils/prompts';
import Sqids from 'sqids';
// POST /api/post
// Required fields in body: topic
// Optional fields in body: directive
export async function POST(req: Request) {
    try {
        const { id, state, short_link_id } = await req.json();
        if (!id || !state) {
            return NextResponse.error();
        }
        const calc_short_link = (link_id: number): string => {
            const sqids = new Sqids({
                minLength: 10,
                alphabet: 'waU04Tzt9fHQrqSVKdpimLGIJOgb5ZEFxnXM1kBN6cuhsAvjW3Co7l2RePyY8D',
            })
            const new_link = sqids.encode([link_id]) // "86Rf07"
            //const numbers = sqids.decode(id) // [1, 2, 3]
            return new_link;
        };
        const short_link: string = (state !== 'ACTIVE') ? '' : calc_short_link(short_link_id);
        
        const raven = await prisma.raven.update({
            where: { id: id },
            data: { state: state as RavenState, short_link, },
        });
        return NextResponse.json(raven);
    } catch (error) {
        console.log('Error updating raven:', error);
        return NextResponse.error();
    }
}

export async function PUT(req: Request) {
    try {
        const { topic, directive } = await req.json();

        const author: User = {
            id: "cm2htyn220000wv1pz90mlxvt",
            name: "Matt"
        } as User;
        if (!topic || !directive || !author) {
            return NextResponse.error();
        }
        const raven_plan = getRavenPlan({ directive });
        const { text } = await generateText({
            model: openai('gpt-4o-mini'),
            system: raven_plan,
            prompt:'Provide a list of questions and the metrics that will be used to measure the answers.',
        });
        console.log('plan', text);

        const system_prompt = getSystemChatPrompt({ directive, author_name: author.name, plan: text });
        const raven = await prisma.raven.create({
            data: {
                authorId: author.id,
                topic, 
                directive,
                system_prompt, 
                state: 'READY' 
            },
        });
        return NextResponse.json(raven);
    } catch (error) {
        console.log('Error creating raven:', error);
        return NextResponse.error();
    }
}
