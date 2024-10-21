import prisma from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';
// POST /api/post
// Required fields in body: topic
// Optional fields in body: directive

export async function GET(req: Request,{params}:{params: {short_link: string}}) {
    try {
        const { short_link } = params;
        if (!short_link || short_link.length === 0) {
            return NextResponse.error();
        }
        const raven = await prisma.raven.findFirst({
            where: { 
                short_link
            },
            include: {
                messages: true
            }
        });
        return NextResponse.json(raven);
    } catch (error) {
        console.log('Error creating raven:', error);
        return NextResponse.error();
    }
}