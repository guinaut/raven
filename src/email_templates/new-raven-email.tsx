import { Body, Container, Head, Heading, Html, Link, Text } from '@react-email/components';
import * as React from 'react';

interface NewRavenEmailProps {
	author: string;
	name: string;
	short_link: string;
}

//const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';

const main = {
	backgroundColor: '#ffffff',
	fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
};

const container = {
	backgroundColor: '#ffffff',
	border: '1px solid #eee',
	borderRadius: '5px',
	boxShadow: '0 5px 10px rgba(20,50,70,.2)',
	marginTop: '20px',
	maxWidth: '360px',
	margin: '0 auto',
	padding: '68px 0 130px',
};

const tertiary = {
	color: '#0a85ea',
	fontSize: '11px',
	fontWeight: 700,
	fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
	height: '16px',
	letterSpacing: '0',
	lineHeight: '16px',
	margin: '16px 8px 8px 8px',
	textTransform: 'uppercase' as const,
	textAlign: 'center' as const,
};

const secondary = {
	color: '#000',
	display: 'inline-block',
	fontFamily: 'HelveticaNeue-Medium,Helvetica,Arial,sans-serif',
	fontSize: '20px',
	fontWeight: 500,
	lineHeight: '24px',
	marginBottom: '0',
	marginTop: '0',
	textAlign: 'center' as const,
};

const paragraph = {
	color: '#444',
	fontSize: '15px',
	fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
	letterSpacing: '0',
	lineHeight: '23px',
	padding: '0 40px',
	margin: '0',
	textAlign: 'center' as const,
};

const link = {
	color: '#444',
	textDecoration: 'underline',
};

const footer = {
	color: '#000',
	fontSize: '12px',
	fontWeight: 800,
	letterSpacing: '0',
	lineHeight: '23px',
	margin: '0',
	marginTop: '20px',
	fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
	textAlign: 'center' as const,
	textTransform: 'uppercase' as const,
};

export const NewRavenEmail = ({ author, name, short_link }: NewRavenEmailProps) => (
	<Html>
		<Head />
		<Body style={main}>
			<Container style={container}>
				<center>
					<Text style={secondary}>Hi {name}</Text>
					<br />
					<Heading style={tertiary}>You have a Raven from {author}</Heading>
					<br />
					<Text style={paragraph}>
						<Link href={short_link} style={link}>
							{short_link}
						</Link>
					</Text>
				</center>
			</Container>
			<center>
				<Text style={footer}>Securely powered by RavenChat.io</Text>
				<Text style={footer}>
					<Link href="{baseUrl}/unsubscribe" style={link}>
						Unsubscribe
					</Link>
				</Text>
			</center>
		</Body>
	</Html>
);

export default NewRavenEmail;
