'use server';
import { Resend, CreateEmailOptions } from 'resend';
import { NewRavenEmail } from '@/email_templates/new-raven-email';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY);

export interface RavenEmailData {
	subject: string;
	author: string;
	email: string;
	name?: string;
	url: string;
}

export const sendRavenEmails = async (emails: RavenEmailData[]) => {
	try {
		const DEV_MODE = process.env.NEXT_PUBLIC_RUN_MODE;
		if (DEV_MODE && DEV_MODE !== 'DEV') {
			const emailData: CreateEmailOptions[] = emails.map((e) => ({
				from: 'Raven <calling@ravenchat.io>',
				to: [e.email],
				subject: e.subject,
				react: NewRavenEmail({ author: e.author, name: e.name ? e.name : 'there', short_link: e.url }),
			}));
			await emailData.forEach(async (e) => {
				await resend.emails.send(e);
			});
		} else {
			console.log(`DEV_MODE DON'T SEND EMAIL:`, DEV_MODE);
		}
	} catch (error) {
		console.error('Error sending emails:', error);
	}
	return {};
};
