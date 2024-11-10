'use server';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { Recipient, Message, Prisma } from '@prisma/client';
// POST /api/post
// Required fields in body: topic
// Optional fields in body: directive

interface ExtendedRecipient extends Recipient {
	messages?: Message[];
}

const getRecipientByShortLink = async (props: { recipients: Recipient[]; public_key: string; email: string }): Promise<Recipient> => {
	const { recipients, public_key, email } = props;
	const existing_recipient = recipients.find((recipient) => recipient.public_key === public_key);
	if (existing_recipient) {
		return existing_recipient;
	}
	const usePublicKey = public_key && public_key.length > 0 ? public_key : nanoid();
	const public_key_recipient = recipients.find((recipient) => recipient.public_key === usePublicKey);
	if (public_key_recipient) {
		// if the public_key is not empty, then the two public_keys must match
		// IF YES  return the recipient
		return public_key_recipient;
	}

	// if the public_key and recipient.public_key are empty,
	// THEN update with a new public_key and return the new recipient

	// if the public_key is not empty, then the two public_keys must match
	// IF NO then make a new recipient with the passed in public_key
	const template_recipient: ExtendedRecipient = recipients[0];
	const msg = template_recipient.messages ? template_recipient.messages[0] : null;
	if (!msg) {
		throw new Error('No initial system message found from the template recipient');
	}
	const new_recipient = await prisma.recipient.create({
		data: {
			ravenId: template_recipient.ravenId,
			short_link_id: template_recipient.short_link_id,
			short_link: template_recipient.short_link,
			public_key: usePublicKey,
			private_email: email && email.length > 0 ? email : null,
			contactId: template_recipient.contactId,
			messages: {
				create: [
					{
						role: msg.role,
						content: msg.content as Prisma.InputJsonValue,
					},
				],
			},
		},
		include: {
			raven: true,
			messages: true,
			contact: true,
		},
	});
	//console.log(JSON.stringify(new_recipient, null, 2));
	return new_recipient;
};

export async function POST(req: Request, { params }: { params: { short_link: string } }) {
	try {
		const { short_link } = params;
		const { public_key, email } = await req.json();
		//const newPublicKey = public_key && public_key.length > 0 ? public_key : nanoid();
		const newPublicKey = nanoid();

		if (!short_link) {
			return NextResponse.error();
		}

		// Fetch the recipient(s) with the given short_link
		const recipients = await prisma.recipient.findMany({
			where: {
				short_link,
			},
			include: {
				raven: true,
				messages: true,
				contact: true,
			},
		});
		// quick check on the two most common scenarios
		if ((!email || email.length === 0) && public_key && public_key.length > 0 && recipients.length > 0) {
			const public_key_recipient = recipients.find((recipient) => recipient.public_key === public_key);
			if (public_key_recipient) {
				return NextResponse.json(public_key_recipient);
			}
		} else if (email && email.length > 0 && public_key && public_key.length > 0 && recipients.length > 0) {
			const email_key_recipient = recipients.find((recipient) => recipient.public_key === public_key && recipient.private_email === email);
			if (email_key_recipient) {
				return NextResponse.json(email_key_recipient);
			}
		}

		if (recipients && recipients.length > 0) {
			// if the Raven is Private and the email is not empty, then it must match the recipient.private_email

			// if the Raven is Private and the email is empty, then return a challenge to provide an email
			if ((!email || email.length === 0) && recipients[0].raven.send_type === 'PRIVATE') {
				return NextResponse.json({
					challenge: 'EMAIL',
					message: `I'm a private Raven.  Please provide your email address to receive the message.`,
				});
			} else if (email && email.length > 0 && recipients[0].raven.send_type === 'PRIVATE') {
				const email_recipient = recipients.find((r) => r.private_email === email);
				if (!email_recipient) {
					return NextResponse.json({
						challenge: 'EMAIL',
						message: `That doesn't seem right. I'm very quiet and private.`,
					});
				} else {
					//if public_key is empty but the email matches, then update the recipient with the public_key
					if ((!email_recipient.public_key || email_recipient.public_key === '') && email_recipient.private_email === email) {
						const send_email_recipient = await prisma.recipient.update({
							where: { id: email_recipient.id },
							data: {
								public_key: newPublicKey,
							},
							include: {
								raven: true,
								messages: true,
								contact: true,
							},
						});
						return NextResponse.json(send_email_recipient);
					} else {
						// call standard logic for public_key
						return NextResponse.json(
							await getRecipientByShortLink({
								recipients: recipients,
								public_key,
								email,
							}),
						);
					}
				}
			} else if (recipients[0].raven.send_type === 'PUBLIC') {
				// call standard logic for public_key
				return NextResponse.json(
					await getRecipientByShortLink({
						recipients: recipients,
						public_key,
						email,
					}),
				);
			}
		}
		return NextResponse.error();
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		return NextResponse.error();
	}
}
