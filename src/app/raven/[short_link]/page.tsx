'use client';

import { Group, Stack, Text, Box, Center, TextInput, Button, Flex, Paper, ScrollArea } from '@mantine/core';
import Cookies from 'js-cookie';
import { useForm } from '@mantine/form';
import { useChat, Message } from 'ai/react';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import Markdown from 'react-markdown';
import { EmailChallenge } from '@/components/email-challenge';
import { getOpeningPrompt } from '@/utils/prompts';

interface RavenMessage {
	id: string;
	role: 'function' | 'system' | 'user' | 'assistant' | 'data' | 'tool';
	content: {
		role: 'function' | 'system' | 'user' | 'assistant' | 'data' | 'tool';
		text: string;
	};
}
interface RavenRecipient {
	id: string;
	messages: RavenMessage[];
	public_key?: string;
	challenge?: boolean;
	contact?: {
		name: string;
	};
}

function useRecipient(short_link: string, public_key: string, email: string) {
	const fetcher = async (url: string, short_link: string, public_key: string, email: string) => {
		if (short_link.length === 0) {
			return null;
		}
		return fetch(url, {
			headers: new Headers({
				'Content-Type': 'application/json',
			}),
			credentials: 'same-origin',
			method: 'POST',
			body: JSON.stringify({
				public_key,
				email,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				return data;
			})
			.catch((error) => {
				console.error('Error fetching:', error);
			});
	};

	const { data, error, isLoading } = useSWR([`/api/v1/recipient/${short_link}`, short_link, email], ([url, short_link, email]) =>
		fetcher(url, short_link, public_key, email),
	);

	return {
		data: data,
		isLoading,
		isError: error,
	};
}

const updateCookie = (props: { public_key?: string; email?: string }) => {
	const ravenCookie: string | undefined = Cookies.get('ravenCookie');
	const parse_cookie = ravenCookie && ravenCookie.length > 0 ? JSON.parse(ravenCookie as string) : {};
	const new_cookie = {
		...parse_cookie,
		...props,
	};
	Cookies.set('ravenCookie', JSON.stringify(new_cookie), {
		expires: 30,
		sameSite: 'strict',
	});
};

export default function Page({ params }: { params: { short_link: string } }) {
	const { short_link } = params;
	//Cookies.remove('ravenCookie');
	//updateCookie({email: ''});
	const ravenCookie = Cookies.get('ravenCookie');
	let public_key: string = '';
	let cookie_email: string = '';
	if (ravenCookie) {
		const parse_cookie = JSON.parse(ravenCookie);
		if (parse_cookie) {
			if (parse_cookie.public_key) {
				public_key = parse_cookie.public_key;
			}
			if (parse_cookie.email) {
				cookie_email = parse_cookie.email;
			}
		}
	}

	const [email, setEmail] = useState(cookie_email);
	const [isPrivate, setIsPrivate] = useState(false);
	const { data, isLoading } = useRecipient(short_link, public_key, email);
	const [recipient, setRecipient] = useState<RavenRecipient | null>(null);
	const { messages, setInput, append } = useChat();
	const [viewMessages, setViewMessages] = useState<Message[]>([]);

	const getChatBody = (new_recipient: RavenRecipient) => {
		return {
			recipient_id: new_recipient.id,
		};
	};

	const updateMessages = (_msgs: Message[]) => {
		messages.push(..._msgs);
	};

	useEffect(() => {
		if (!isLoading && data) {
			if (data.challenge) {
				setIsPrivate(true);
			} else {
				updateCookie({ public_key: data.public_key });
				const _msgs: Message[] = data.messages.map((m: RavenMessage) => {
					return {
						role: m.content.role,
						content: m.content.text,
						id: m.id,
					} as Message;
				});
				updateMessages(_msgs);
				setRecipient(data);
				setIsPrivate(false);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, isLoading]);

	useEffect(() => {
		if (recipient && messages && append) {
			if (recipient.messages && recipient.messages.length === 1 && messages.length === 1) {
				const name = recipient.contact && recipient.contact.name && recipient.contact.name.length > 0 ? recipient.contact.name : null;
				append(
					{
						role: 'system',
						content: getOpeningPrompt({ recipient: name }),
					},
					{
						body: {
							...getChatBody(recipient),
						},
					},
				);
			} else {
				setViewMessages([...messages]);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [recipient, append]);

	// for the scroll space
	const viewport = useRef<HTMLDivElement>(null);
	const scrollToBottom = () =>
		viewport.current!.scrollTo({
			top: viewport.current!.scrollHeight,
			behavior: 'smooth',
		});

	const form = useForm({
		initialValues: {
			user_response: '',
		},
		validate: {
			user_response: (value) => (value.length >= 1 ? null : 'Let me know what you really think.'),
		},
	});

	const handleSubmitUserChatMessage = (values: { user_response: string }) => {
		const { user_response } = values;
		if (form.validate() && recipient) {
			append(
				{ role: 'user', content: user_response },
				{
					body: {
						...getChatBody(recipient),
					},
				},
			);
			form.setFieldValue('user_response', '');
		}
	};

	const handleChallengeComplete = (e: string) => {
		if (e && e.length > 0) {
			setEmail(e);
			updateCookie({ email: e });
		}
	};

	useEffect(() => {
		if (form.values.user_response.length > 0) {
			setInput(form.values.user_response);
		}
	}, [form.values.user_response, setInput]);

	useEffect(() => {
		if (messages.length > 1) {
			setViewMessages([...messages]);
		}
	}, [messages]);

	useEffect(() => {
		if (viewMessages.length > 1) {
			scrollToBottom();
		}
	}, [viewMessages]);

	return (
		<Group grow>
			<Center>
				<Stack align="stretch">
					<Center>
						<Text size="xl" fw={900} variant="gradient">
							RavenChat
						</Text>
					</Center>
					<Flex h={600} gap="sm" justify="flex-start" align="flex-start">
						<Stack
							w={340}
							style={{
								borderWidth: 1,
								borderColor: 'grey',
								borderStyle: 'solid',
								borderRadius: 15,
							}}
							align="stretch"
							justify="flex-end"
							gap="md"
							h="100%"
							p={10}
							pt={0}
						>
							{isPrivate ? (
								<>
									<EmailChallenge onChallengeComplete={(e: string) => handleChallengeComplete(e)} />
								</>
							) : (
								<>
									<ScrollArea viewportRef={viewport}>
										<Box w="100%" m={0}>
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
										</Box>
									</ScrollArea>
									<Box w="100%" m={0}>
										<form onSubmit={form.onSubmit((values) => handleSubmitUserChatMessage(values))}>
											<TextInput
												size="sm"
												withAsterisk
												label=""
												placeholder=""
												key={form.key('user_response')}
												{...form.getInputProps('user_response')}
											/>
											<Group justify="flex-end" mt="md">
												<Button type="submit">Submit</Button>
											</Group>
										</form>
									</Box>
								</>
							)}
						</Stack>
					</Flex>
				</Stack>
			</Center>
		</Group>
	);
}
