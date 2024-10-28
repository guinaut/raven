// components/RavenList.tsx
import NextImage from 'next/image';
import { useState, useEffect, MouseEventHandler } from 'react';
import { Card, Text, Group, Image, Badge, Button, Stack, Collapse, Tooltip, ActionIcon, Anchor, CopyButton } from '@mantine/core';
import { MdPublic } from 'react-icons/md';
import { BsPersonHeart } from 'react-icons/bs';
import { useDisclosure } from '@mantine/hooks';
import { Raven, Recipient } from '@prisma/client'; // Assuming you have the Prisma types available

import ravenReadyImage from '../assets/raven-resting.png';
import ravenLaunchImage from '../assets/raven-launching.png';

interface RavenState {
	status: string;
	status_color: string;
	image: typeof ravenReadyImage;
	type: string;
	action_text: string;
	next_action: MouseEventHandler;
}

const saveRaven = async (raven: Raven) => {
	const { id, state } = raven;
	try {
		const res = await fetch('/api/v1/raven', {
			headers: new Headers({
				'Content-Type': 'application/json',
			}),
			credentials: 'same-origin',
			method: 'POST',
			body: JSON.stringify({
				id,
				state,
			}),
		});
		const data = await res.json();
		return data;
	} catch (error) {
		console.error('Error fetching ravens:', error);
	}
};

interface ExtendedRaven extends Raven {
	recipients?: Recipient[];
}

const RavenCard = (props: { raven: ExtendedRaven; onChange: (props: { raven: Raven }) => void }) => {
	const baseURL: string = 'http://localhost:3000'; // Change this to your actual base URL
	const {
		onChange = () => {
			return null;
		},
	} = props;
	const [raven, setRaven] = useState<ExtendedRaven>(props.raven);
	const [shortlink, setShortLink] = useState<string | null>(null);
	const [opened, { toggle }] = useDisclosure(false);
	const [controlState, setControlState] = useState<RavenState>({
		status: 'Loading',
		status_color: 'gray.3',
		type: 'PUBLIC',
		image: ravenReadyImage,
		action_text: 'Loading',
		next_action: () => {
			console.log('Loading');
		},
	});

	useEffect(() => {
		if (raven) {
			if (raven.send_type.toUpperCase() === 'PUBLIC') {
				if (raven.recipients && raven.recipients.length > 0) {
					setShortLink(raven.recipients[0].short_link);
				}
			}
			if (raven.state === 'READY') {
				setControlState({
					status: 'Ready',
					type: raven.send_type,
					status_color: 'gray.6',
					image: ravenReadyImage,
					action_text: 'Send Raven',
					next_action: () => {
						raven.state = 'ACTIVE';
						saveRaven(raven).then((data) => {
							setRaven(data);
							onChange({
								raven: data as Raven,
							});
						});
					},
				});
			} else if (raven.state === 'ACTIVE') {
				setControlState({
					status: 'Sent',
					type: raven.send_type,
					status_color: 'green',
					image: ravenLaunchImage,
					action_text: 'Recall Raven',
					next_action: () => {
						raven.state = 'CANCELED';
						saveRaven(raven).then((data) => {
							setRaven(data);
							onChange({
								raven: data as Raven,
							});
						});
					},
				});
			} else if (raven.state === 'CANCELED') {
				setControlState({
					status: 'Quiet',
					type: raven.send_type,
					status_color: 'red',
					image: ravenLaunchImage,
					action_text: 'Ready Raven',
					next_action: () => {
						raven.state = 'READY';
						saveRaven(raven).then((data) => {
							setRaven(data);
							onChange({
								raven: data as Raven,
							});
						});
					},
				});
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [raven]);

	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder w={340}>
			<Card.Section>
				<Image component={NextImage} src={controlState.image} height={100} alt={controlState.status} />
			</Card.Section>
			<Card.Section>
				<Group m="sm" p={0} gap={5} grow preventGrowOverflow>
					<Group grow>
						<Text fw={500}>{raven.topic}</Text>
					</Group>
					{controlState.type === 'PRIVATE' ? (
						<>
							<Tooltip label="Private Raven">
								<Badge
									color="yellow"
									pt={0}
									maw={50}
									m={0}
									p={0}
									leftSection={
										<ActionIcon size="md" variant="transparent" color="white" aria-label="Private Raven" m={0} p={0} onClick={toggle}>
											<BsPersonHeart style={{ width: '70%', height: '70%' }} stroke="1.5" />
										</ActionIcon>
									}
								>
									<Text fw={900} size="sm" m={0} p={0}>
										{raven.recipients ? raven.recipients.length : 0}
									</Text>
								</Badge>
							</Tooltip>
						</>
					) : (
						<>
							<Badge color="yellow" pt={0} maw={30} m={0} p={0}>
								<CopyButton value={`${baseURL}/raven/${shortlink}`} timeout={2000}>
									{({ copied, copy }) => (
										<Tooltip label={copied ? 'Copied' : 'Copy Raven Link'} withArrow position="right">
											<ActionIcon size="md" variant="transparent" color="white" aria-label="Public Raven" onClick={copy}>
												<MdPublic
													style={{
														width: '70%',
														height: '70%',
													}}
													stroke="1.5"
												/>
											</ActionIcon>
										</Tooltip>
									)}
								</CopyButton>
							</Badge>
						</>
					)}
					<Badge maw={65} pt={2} color={controlState.status_color}>
						{controlState.status}
					</Badge>
				</Group>
				{controlState.type === 'PRIVATE' && raven && raven.recipients && raven.recipients.length > 0 && (
					<Collapse in={opened}>
						<Stack gap="xs" p={0} m="sm">
							{raven.recipients &&
								raven.recipients.map((r) => (
									<Group key={`recipient-${r.id}`}>
										<Text size="xs" ta="right">
											{(r.private_email as string).split('@')[0]}
										</Text>
										<Text size="xs" ta="left" fw={900}>
											<Anchor href={`${baseURL}/raven/${r.short_link}`} target="_raven" underline="hover">
												{`https://ravenchat.io/raven/${r.short_link}`}
											</Anchor>
										</Text>
									</Group>
								))}
						</Stack>
					</Collapse>
				)}
				{shortlink && (
					<Stack justify="space-between" m="sm">
						<Text size="sm" c="dimmed">
							{raven.directive}
						</Text>
					</Stack>
				)}
				<Stack justify="space-between" m="sm">
					<Text size="sm" c="dimmed">
						{raven.directive}
					</Text>
				</Stack>

				<Button fullWidth mt="md" radius="md" onClick={controlState.next_action}>
					{controlState.action_text}
				</Button>
			</Card.Section>
		</Card>
	);
};

export { RavenCard };
