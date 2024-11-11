'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Group, Stack, Text, TextInput, Button, Card, Image } from '@mantine/core';
import { useForm } from '@mantine/form';
import { User } from '@prisma/client';
import NextImage from 'next/image';
import useSWR from 'swr';
import ravenLaunchImage from '../assets/raven-taking-flight-wide.png';
import { EditorInput } from '@/components/rte-input';

function useAuthor(author_id?: string) {
	const fetcher = async (url: string, author_id?: string) => {
		if (!author_id || author_id.length === 0) {
			return null;
		}
		return fetch(url, {
			headers: new Headers({
				'Content-Type': 'application/json',
			}),
			credentials: 'same-origin',
			method: 'GET',
		})
			.then((res) => res.json())
			.then((data) => {
				return data;
			})
			.catch((error) => {
				console.error('Error fetching:', error);
			});
	};
	const { data, error, isLoading } = useSWR([`/api/v1/account/author/${author_id}`, author_id], ([url, author_id]) => fetcher(url, author_id));

	return {
		author: data,
		isLoading,
		isError: error,
	};
}
const updateAuthorFetch = async (props: { author_id: string; name: string; about: string }) => {
	const { author_id, name, about } = props;
	try {
		const res = await fetch(`/api/v1/account/author/${author_id}`, {
			headers: new Headers({
				'Content-Type': 'application/json',
			}),
			credentials: 'same-origin',
			method: 'POST',
			body: JSON.stringify({
				id: author_id,
				name,
				about,
			}),
		});
		const data = await res.json();
		return data;
	} catch (error) {
		console.error('Error fetching ravens:', error);
	}
};

const AuthorSettings = () => {
	const { user } = useUser();
	const { author, isLoading, isError } = useAuthor(user?.id);
	const { about = '' } = author || {};
	const authorForm = useForm({
		initialValues: {
			name: '',
			about: '',
		},

		validate: {
			name: (value) => (value && value.length > 1 ? null : `It helps the Raven and your friend's to know who you are!`),
			about: (value) => (!value || (value && value.length > 15) ? null : `If you want to provide some background, make sure it is detailed!`),
		},
	});

	useEffect(() => {
		if (author && !isLoading && !isError) {
			const { name, about } = author;
			authorForm.setValues({
				name: name,
				about: about,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [author, isLoading, isError]);

	const saveAuthorData = () => {
		const { name, about } = authorForm.values;
		const { hasErrors = true } = authorForm.validate();
		if (!hasErrors) {
			updateAuthorFetch({ author_id: user?.id as string, name, about }).then((data: User) => {
				if (data) {
					authorForm.setValues({
						name: data.name as string,
						about: data.about as string,
					});
				}
			});
		}
	};

	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder w={{ xs: 340, sm: 340, md: 400, lg: 500, xl: 500 }}>
			<Card.Section>
				<Image component={NextImage} src={ravenLaunchImage} height={200} alt="Preparing to send a Raven" />
			</Card.Section>
			<Card.Section p="lg">
				<form>
					<Stack align="stretch" justify="flex-start" gap="md">
						<TextInput withAsterisk label="Name:" placeholder="How your Raven will refernce you" {...authorForm.getInputProps('name')} />

						<EditorInput label="General training for your Raven" startingValue={about} {...authorForm.getInputProps('about')} />

						<Text size="xs" c="grey.5">
							Material that you are willing to share will help the Raven be more personalized. <br />
							But you should be aware that anything you write here could be shared by the Raven.
						</Text>
						<Group justify="center" mt="md">
							<Button onClick={() => saveAuthorData()} color="yellow">
								Save my information
							</Button>
						</Group>
					</Stack>
				</form>
			</Card.Section>
		</Card>
	);
};

export { AuthorSettings };
