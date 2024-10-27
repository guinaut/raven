'use client';

import { Stack, TextInput, Button, Text } from '@mantine/core';
import { useForm } from '@mantine/form';

const EmailChallenge = (props: { onChallengeComplete: (email: string) => void }) => {
	const { onChallengeComplete } = props;
	const emailForm = useForm({
		initialValues: {
			email: '',
		},

		validate: {
			email: (value) =>
				value && /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
					? null
					: 'Sqwak! You sure?',
		},
	});

	const validateChallenge = () => {
		const { email } = emailForm.values;
		const { hasErrors = true } = emailForm.validate();
		if (!hasErrors) {
			// looks valid, move forward with callback
			if (onChallengeComplete) {
				onChallengeComplete(email);
			}
		}
	};

	return (
		<>
			<form onSubmit={emailForm.onSubmit(() => validateChallenge())}>
				<Stack align="stretch" justify="center" mih={550} m="md" gap="md">
					<Text fw={800}>{`I'm a secret agent Raven!`}</Text>
					<TextInput
						withAsterisk
						label=" What is your email?"
						placeholder="my_secret@email.com"
						{...emailForm.getInputProps('email')}
					/>
					<Button onClick={() => validateChallenge()} color="yellow">
						{`That's me!`}
					</Button>
				</Stack>
			</form>
		</>
	);
};

export { EmailChallenge };
