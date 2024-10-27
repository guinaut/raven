'use client';

//import { useEffect, useState } from "react";
import {
	Group,
	Stack,
	Text,
	TextInput,
	Textarea,
	Button,
	Card,
	Image,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Raven } from '@prisma/client';
import NextImage from 'next/image';
import ravenLaunchImage from '../assets/raven-friendly-wideview.png';

import { EmailSelector } from './email-selector';

const createRavenFetch = async (props: {
	topic: string;
	directive: string;
	recipients: string[];
}) => {
	const { topic, directive, recipients } = props;
	try {
		const res = await fetch('/api/v1/raven', {
			headers: new Headers({
				'Content-Type': 'application/json',
			}),
			credentials: 'same-origin',
			method: 'PUT',
			body: JSON.stringify({
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

const CreateRaven = () => {
	//const [ userId, setUserId ] = useState<string | undefined>();
	const directiveForm = useForm({
		initialValues: {
			topic: '',
			directive: '',
			recipients: [],
		},

		validate: {
			topic: (value) => (value.length > 1 ? null : 'Sqwak! What is this about?'),
			directive: (value) =>
				value.length > 10 ? null : 'Sqwak! Need detail to ask question!',
			recipients: (value) =>
				value.length > 0 ? null : 'Sqwak! Who am I talking to?!',
		},
	});

	const saveRaven = () => {
		const { topic, directive, recipients } = directiveForm.values;
		const { hasErrors = true } = directiveForm.validate();
		if (!hasErrors) {
			createRavenFetch({ topic, directive, recipients }).then((data: Raven) => {
				if (data) {
					directiveForm.reset();
				}
			});
		}
	};

	const sendRaven = () => {
		saveRaven();
	};

	/*
    useEffect(() => {
        setUserId('user1');
    }, []);
*/
	return (
		<Card
			shadow="sm"
			padding="lg"
			radius="md"
			withBorder
			w={{ xs: 340, sm: 340, md: 400, lg: 500, xl: 500 }}
		>
			<Card.Section>
				<Image
					component={NextImage}
					src={ravenLaunchImage}
					height={200}
					alt="Preparing to send a Raven"
				/>
			</Card.Section>
			<Card.Section p="lg">
				<form>
					<Stack align="stretch" justify="flex-start" gap="md">
						<TextInput
							withAsterisk
							label="Topic:"
							placeholder="What is this about?"
							{...directiveForm.getInputProps('topic')}
						/>
						<EmailSelector {...directiveForm.getInputProps('recipients')} />
						<Textarea
							size="sm"
							withAsterisk
							label="What message shall I carry?"
							placeholder="What would you like your Raven to ask?"
							resize="vertical"
							autosize
							minRows={5}
							{...directiveForm.getInputProps('directive')}
						/>
						<Text size="xs" c="grey.5">
							If you are super <b>controlling</b> and want to ask questions
							in a certain order and think you know the best variables, you
							can do the following:
							<br /> {`1. What is your favorite {{color}}?`}
							<br /> {`2. What is your favorite {{animal}}?`}
							<br />
							<br />
							Fair warning. I&apos;m a Raven and we do things our way.
							Sqwak!
						</Text>
						<Group justify="center" mt="md">
							<Button onClick={() => saveRaven()} color="yellow">
								Add to the Aerie
							</Button>
							<Button onClick={() => sendRaven()}>Send me!</Button>
						</Group>
					</Stack>
				</form>
			</Card.Section>
		</Card>
	);
};

export { CreateRaven };
