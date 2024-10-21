import prisma from '../../../../../../lib/prisma';
import { NextResponse } from 'next/server';
export async function GET() {
    try {
      const ravens = await prisma.raven.findMany({
          include: {
            author: {
              select: { name: true },
            },
          },
        });
      return NextResponse.json(ravens);
    } catch (error) {
      console.error('Error fetching ravens:', error);
      return NextResponse.error();
    }
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