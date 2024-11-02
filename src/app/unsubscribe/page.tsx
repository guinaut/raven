'use client';

import { useEffect, useState } from 'react';
import { Group, Stack, Text, TextInput, Center, Button, Card, Image } from '@mantine/core';
import { useForm } from '@mantine/form';
import NextImage from 'next/image';
import ravenFriendlyImage from '../../assets/raven-friendly-wideview.png';
import { unsubscribeAction } from './_actions';

export default function OnboardingComponent() {
	const [error, setError] = useState('');
	const [message_result, setMessageResult] = useState('');
	const unsubscribeForm = useForm({
		initialValues: {
			email: '',
		},

		validate: {
			email: (value) => (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value) !== true ? null : 'Please enter a valid email.'),
		},
	});

	const handleUnsubscribe = (event: React.FormEvent<HTMLFormElement> | null) => {
		if (event) {
			event.preventDefault();
		}
		const { hasErrors = true } = unsubscribeForm.validate();
		if (!hasErrors) {
			const { email } = unsubscribeForm.values;
			unsubscribeAction(email)
				.then((data) => {
					if (data && data.message) {
						setMessageResult(data.message);
					}
				})
				.catch(() => {
					setError('Please review your email and try again.');
				});
		}
	};
	useEffect(() => {
		console.log(error);
	}, [error]);
	return (
		<Group grow mt={24}>
			<Center>
				<Card shadow="sm" padding="lg" radius="md" withBorder w={340} h={360}>
					<Card.Section>
						<Image component={NextImage} src={ravenFriendlyImage} height={150} alt="Regal raven listening to your instructions." />
					</Card.Section>
					<Card.Section>
						<form onSubmit={handleUnsubscribe}>
							<Stack align="stretch" justify="flex-start" mt={15} gap="md" p={10}>
								{message_result && (
									<Text size="sm" c="red.6">
										{message_result} {error}
									</Text>
								)}
								<TextInput withAsterisk label="Email to Unsubscribe:" placeholder="Your email?" {...unsubscribeForm.getInputProps('email')} />
							</Stack>
						</form>
					</Card.Section>
					<Card.Section>
						<Stack align="stretch" justify="flex-end" mt={20} gap="md">
							<Button
								onClick={() => {
									handleUnsubscribe(null);
								}}
								fullWidth
								color="yellow"
								mt="md"
								radius="md"
							>
								{`Unsubscribe`}
							</Button>
						</Stack>
					</Card.Section>
				</Card>
			</Center>
		</Group>
	);
}
