'use client';

import { Group, Stack, Text, Card, Image, Paper } from '@mantine/core';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Markdown from 'react-markdown';
import NextImage from 'next/image';
import ravenLaunchImage from '../assets/beak-to-beak.png';

interface RavenMessage {
	id: string;
	role: 'function' | 'system' | 'user' | 'assistant' | 'data' | 'tool';
	content: {
		role: 'function' | 'system' | 'user' | 'assistant' | 'data' | 'tool';
		text: string;
	};
}
interface ViewMessage {
	id: string;
	role: 'function' | 'system' | 'user' | 'assistant' | 'data' | 'tool';
	content: string;
}

function useRecipient(short_link: string) {
	const fetcher = async (url: string, short_link: string) => {
		if (short_link.length === 0) {
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

	const { data, error, isLoading } = useSWR([`/api/v1/account/recipient/${short_link}`, short_link], ([url, short_link]) => fetcher(url, short_link));

	return {
		recipient: data,
		isLoading,
		isError: error,
	};
}

const RecipientTranscript = ({ short_link }: { short_link: string }) => {
	const { recipient, isLoading } = useRecipient(short_link);
	const [viewMessages, setViewMessages] = useState<ViewMessage[]>([]);

	useEffect(() => {
		if (recipient && !isLoading && recipient.messages && recipient.messages.length > 0) {
			const _viewMessages = recipient.messages.map((m: RavenMessage) => {
				return {
					role: m.content.role,
					content: m.content.text,
					id: m.id,
				};
			});
			setViewMessages(_viewMessages);
		}
	}, [recipient, isLoading]);
	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder w={{ xs: 340, sm: 340, md: 400, lg: 500, xl: 500 }}>
			<Card.Section>
				<Image component={NextImage} src={ravenLaunchImage} height={200} alt="Preparing to send a Raven" />
			</Card.Section>
			{recipient && recipient.private_email && recipient.private_email.length > 0 ? (
				<Card.Section bg="gray.9">
					<Group m="sm" p={0} gap={5} grow preventGrowOverflow>
						<Group grow>
							<Text fw={500}>{recipient.private_email}</Text>
						</Group>
					</Group>
				</Card.Section>
			) : (
				<>
					{recipient && recipient.public_key && recipient.public_key.length > 0 ? (
						<Card.Section bg="gray.9">
							<Group m="sm" p={0} gap={5} grow preventGrowOverflow>
								<Group grow>
									<Text fw={500}>Public Message: {recipient.public_key}</Text>
								</Group>
							</Group>
						</Card.Section>
					) : (
						<Card.Section bg="gray.9">
							<Group m="sm" p={0} gap={5} grow preventGrowOverflow>
								<Group grow>
									<Text fw={500}>Loading messages...</Text>
								</Group>
							</Group>
						</Card.Section>
					)}
				</>
			)}
			<Card.Section p="lg">
				{viewMessages.map((m: { role: string; content: string; id: string }, index) => (
					<Stack key={`stack-${m.id}-${index}`} p={0} m={0}>
						{m && m.content && (
							<>
								{m.role === 'user' && (
									<Group justify="flex-end" pt={5}>
										<Paper w="90%" shadow="xs" radius="md" withBorder p="xs" bg="blue.8">
											<Text size="sm"> {m.content}</Text>
										</Paper>
									</Group>
								)}

								{m.role === 'assistant' && (
									<Group justify="flex-start" pt={5} m={0}>
										<Paper w="90%" shadow="xs" radius="md" withBorder p="xs" bg="green.8" m={0}>
											<Text size="sm" component="span">
												<Markdown>{m.content}</Markdown>
											</Text>
										</Paper>
									</Group>
								)}
							</>
						)}
					</Stack>
				))}
			</Card.Section>
		</Card>
	);
};

export { RecipientTranscript };
