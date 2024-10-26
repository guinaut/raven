import prisma from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid'
// POST /api/post
// Required fields in body: topic
// Optional fields in body: directive

export async function POST(req: Request,{params}:{params: {short_link: string}}) {
    try {
        const { short_link } = params;
        let { public_key } = await req.json();

        if (!short_link) {
            return NextResponse.error();
        }
        const where: any = { short_link };
        if (public_key) {
            where.public_key = (public_key.length > 0) ? public_key : null;
        }
        // Fetch the recipient(s) with the given short_link
        const recipient = await prisma.recipient.findFirst({
            where: where,
            include: {
                raven: true,
                messages: true,
            }
        });

        if (!recipient) {
            console.log('Recipient not found:', { short_link, public_key });
            return NextResponse.error();
        }

        //const recipient = recipients.find((recipient) => ((recipient.public_key === public_key) || (recipient.raven.send_type === 'PUBLIC' && recipient.public_key === '')));

        if (!recipient || !recipient.raven || recipient.raven.state !== 'ACTIVE') {
            return NextResponse.error();
        }

        // Check for 'PUBLIC' send_type and empty public_key
        if (recipient.raven.send_type === 'PUBLIC' && (!public_key || public_key.length === 0)) {
            // Generate a new public_key
            const newPublicKey = nanoid();

            // Create a copy of the recipient with the new public_key
            const msgs = recipient.messages.map((msg) => ({
                role: msg.role,
                content: msg.content as any, // Ensure content is of type JsonNull | InputJsonValue
            }));
            const newRecipient = await prisma.recipient.create({
                data: {
                    ravenId: recipient.ravenId,
                    short_link_id: recipient.short_link_id,
                    short_link: recipient.short_link,
                    public_key: newPublicKey,
                    messages: {
                        create: msgs
                    },
                },
                include: {
                    raven: true,
                    messages: true,
                }
            });

            return NextResponse.json(newRecipient);
        }

        // If public_key exists, find the matching recipient with the public_key and short_link
        const existingRecipient = await prisma.recipient.findFirst({
            where: {
                short_link,
                public_key,
            },
            include: {
                raven: true,
                messages: true,
            }
        });

        if (existingRecipient) {
            return NextResponse.json(existingRecipient);
        }

        console.error('Find/Create Recipient for Raven failed:', { short_link, public_key });
        return NextResponse.error();

    } catch (error) {
        console.error('Error processing POST request:', error);
        return NextResponse.error();
    }
}
