'use client';

import { useEffect } from 'react';
import { Group, Stack, Text, TextInput, Button, Card, Image } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Raven, Recipient } from '@prisma/client';
import NextImage from 'next/image';
import ravenLaunchImage from '../assets/beak-to-beak.png';

import { EmailSelector } from './email-selector';
import { EditorInput } from '@/components/rte-input';

import { useRouter } from 'next/navigation';

interface ExtendedRaven extends Raven {
	recipients: Recipient[];
}

const updateRavenFetch = async (props: { raven_id: string; topic: string; directive: string; recipients: string[] }) => {
	const { raven_id, topic, directive, recipients } = props;
	try {
		const res = await fetch('/api/v1/account/raven', {
			headers: new Headers({
				'Content-Type': 'application/json',
			}),
			credentials: 'same-origin',
			method: 'POST',
			body: JSON.stringify({
				id: raven_id,
				state: 'READY',
				topic,
				directive,
				recipients,
			}),
		});
		const data = await res.json();
		return data;
	} catch (error) {
		console.error('Error fetching ravens:', error);
	}
};

const UpdateRaven = (props: { raven: ExtendedRaven }) => {
	const router = useRouter();

	const { raven } = props;
	const { directive = '' } = raven || {};
	const directiveForm = useForm({
		initialValues: {
			topic: '',
			directive: '',
			recipients: [] as string[],
		},

		validate: {
			topic: (value) => (value.length > 1 ? null : 'Sqwak! What is this about?'),
			directive: (value) => (value.length > 10 ? null : 'Sqwak! Need detail to ask question!'),
			recipients: (value) => (value.length >= 1 ? null : 'Sqwak! Who am I talking to?!'),
		},
	});

	const handleUpdateRaven = () => {
		const { topic, directive, recipients } = directiveForm.values;
		const { hasErrors = true } = directiveForm.validate();
		if (!hasErrors) {
			updateRavenFetch({ raven_id: raven.id, topic, directive, recipients }).then((data: Raven) => {
				if (data) {
					directiveForm.reset();
					router.push('/aerie/list');
				}
			});
		}
	};

	const handleCancelUpdate = () => {
		directiveForm.reset();
		router.push('/aerie/list');
	};

	useEffect(() => {
		if (raven) {
			directiveForm.setValues({
				topic: raven.topic,
				directive: raven.directive,
			});

			if (raven.send_type === 'PUBLIC') {
				// recipients list should have ['Public'] if it is public
				directiveForm.setValues({
					recipients: ['Public'],
				});
			} else {
				const emails = raven.recipients.map((recipient) => recipient.private_email);
				const full_emails = emails.length > 0 ? emails.filter((email) => email !== null) : ['Public'];
				directiveForm.setValues({
					recipients: full_emails,
				});
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [raven]);

	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder w={{ xs: 340, sm: 340, md: 400, lg: 500, xl: 500 }}>
			<Card.Section>
				<Image component={NextImage} src={ravenLaunchImage} height={200} alt="Preparing to send a Raven" />
			</Card.Section>
			<Card.Section p="lg">
				<form>
					<Stack align="stretch" justify="flex-start" gap="md">
						<TextInput withAsterisk label="Topic:" placeholder="What is this about?" {...directiveForm.getInputProps('topic')} />
						<EmailSelector {...directiveForm.getInputProps('recipients')} />
						<EditorInput label="What message shall I carry?" startingValue={directive} {...directiveForm.getInputProps('directive')} />
						<Text size="xs" c="grey.5">
							If you are super <b>controlling</b> and want to ask questions in a certain order and think you know the best variables, you can do the
							following:
							<br /> {`1. What is your favorite {{color}}?`}
							<br /> {`2. What is your favorite {{animal}}?`}
							<br />
							<br />
							Fair warning. I&apos;m a Raven and we do things our way. Sqwak!
						</Text>
						<Group justify="center" mt="md">
							<Button onClick={() => handleUpdateRaven()} color="yellow">
								Those are my new instructions.
							</Button>
							<Button variant="outline" onClick={() => handleCancelUpdate()} color="orange">
								Cancel
							</Button>
						</Group>
					</Stack>
				</form>
			</Card.Section>
		</Card>
	);
};

export { UpdateRaven };
