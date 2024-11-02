import prisma from '../../../../../../lib/prisma';
import { RavenState } from '@prisma/client';
import { calc_short_link } from '../_actions';
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
// POST /api/post
// Required fields in body: topic
// Optional fields in body: directive

export async function POST(req: NextRequest) {
	try {
		// Get the authentication data from Clerk
		const { userId } = getAuth(req);

		// Check if the user is authenticated
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get the Raven ID from the request
		const { ravenId } = await req.json();

		// Find the existing Raven to copy
		const originalRaven = await prisma.raven.findUnique({
			where: {
				id: ravenId,
				author: {
					is: {
						external_id: userId,
					},
				},
			},
			include: { recipients: true },
		});

		// If no Raven is found, return an error
		if (!originalRaven) {
			return NextResponse.error();
		}

		// Extract necessary details from the original Raven
		const { topic, directive, guidance, plan, authorId, send_type, recipients } = originalRaven;

		// Start a new transaction to copy the Raven and associated data
		const copiedRavenTxn = await prisma.$transaction(async (tx) => {
			// Create a new Raven entry with the copied details
			const copiedRaven = await tx.raven.create({
				data: {
					topic,
					directive,
					guidance,
					plan,
					state: RavenState.READY,
					authorId,
					send_type,
				},
			});

			// Loop over each recipient and copy their details for the new Raven
			for (const recipient of recipients) {
				const newRecipient = await tx.recipient.create({
					data: {
						ravenId: copiedRaven.id,
						contactId: recipient.contactId,
						private_email: recipient.private_email,
					},
				});

				// Update the new recipient with a unique short link
				await tx.recipient.update({
					data: {
						short_link: await calc_short_link(newRecipient.short_link_id),
					},
					where: {
						id: newRecipient.id,
					},
				});

				// Create new messages for each recipient based on the original Raven's plan
				await tx.message.createMany({
					data: [
						{
							role: 'system',
							content: {
								role: 'system',
								text: plan,
							},
							recipientId: newRecipient.id,
						},
					],
				});
			}

			return copiedRaven;
		});

		// Return the copied Raven transaction as a JSON response
		return NextResponse.json(copiedRavenTxn);
	} catch (error) {
		console.log('Error copying raven:', error);
		return NextResponse.error();
	}
}
