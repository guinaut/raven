// components/RavenList.tsx
import NextImage from 'next/image';
import { useState, useEffect, MouseEventHandler } from 'react';
import { Card, Text, Group, Image, Button, Stack, ScrollArea } from '@mantine/core';
import { Flip } from '@gfazioli/mantine-flip';
import { useResizeObserver } from '@mantine/hooks';
import { Raven, Recipient } from '@prisma/client'; // Assuming you have the Prisma types available
import ravenReadyImage from '../assets/raven-winter-waiting.png';
import ravenLaunchImage from '../assets/raven-launching.png';
import ravenRetiredImage from '../assets/summer-noraven.png';
import { RavenCardTitleBar } from './raven-card-titlebar';
import { RavenCardLearnings } from './raven-learnings';
import ReactMarkdown from 'react-markdown';
export interface RavenState {
	status: string;
	status_color: string;
	image: typeof ravenReadyImage;
	type: string;
	action_text: string;
	next_action: MouseEventHandler;
}

export interface ExtendedRaven extends Raven {
	recipients?: Recipient[];
}

const copyRaven = async (raven: ExtendedRaven) => {
	const { id } = raven;
	try {
		const res = await fetch('/api/v1/account/raven/copy', {
			headers: new Headers({
				'Content-Type': 'application/json',
			}),
			credentials: 'same-origin',
			method: 'POST',
			body: JSON.stringify({
				ravenId: id,
			}),
		});
		const data = await res.json();
		return data;
	} catch (error) {
		console.error('Error fetching ravens:', error);
	}
};

const saveRaven = async (raven: ExtendedRaven) => {
	const { id, state } = raven;
	try {
		const res = await fetch(`/api/v1/account/raven/${id}`, {
			headers: new Headers({
				'Content-Type': 'application/json',
			}),
			credentials: 'same-origin',
			method: 'POST',
			body: JSON.stringify({
				state,
			}),
		});
		const data = await res.json();
		return data;
	} catch (error) {
		console.error('Error fetching ravens:', error);
	}
};

interface RavenCardProps {
	raven: ExtendedRaven;
	onChange: (props: { raven: Raven }) => void;
}

const RavenCard = (props: RavenCardProps) => {
	const [ref, rect] = useResizeObserver();

	const {
		onChange = () => {
			return null;
		},
	} = props;
	const [raven, setRaven] = useState<ExtendedRaven>(props.raven);
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
					action_text: 'Retire Raven',
					next_action: () => {
						raven.state = 'COMPLETE';
						saveRaven(raven).then((data) => {
							setRaven(data);
							onChange({
								raven: data as Raven,
							});
						});
					},
				});
			} else if (raven.state === 'COMPLETE') {
				setControlState({
					status: 'Finito',
					type: raven.send_type,
					status_color: 'blue',
					image: ravenRetiredImage,
					action_text: 'Send Again',
					next_action: () => {
						copyRaven(raven).then((data) => {
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
		<Group>
			<Flip w={{ xs: 340, sm: 340, md: 400, lg: 500, xl: 500 }} miw={340} h={Math.round(rect.height) + 50}>
				<Card shadow="sm" padding="lg" radius="md" withBorder ref={ref} miw={340} w={{ xs: 340, sm: 340, md: 400, lg: 500, xl: 500 }}>
					<Card.Section>
						<Image component={NextImage} src={controlState.image} fit="cover" height={100} alt={controlState.status} />
					</Card.Section>
					<RavenCardTitleBar raven={raven} controlState={controlState} />
					<Card.Section>
						<Stack justify="space-between" m="sm" mb={0} mt={0}>
							<ScrollArea.Autosize mah={200} mx="auto" w="100%">
								<Text span size="sm" c="dimmed" w="100%">
									<ReactMarkdown>{raven?.directive}</ReactMarkdown>
								</Text>
							</ScrollArea.Autosize>
						</Stack>
					</Card.Section>
					<Card.Section>
						<Group grow>
							<Button fullWidth mt={0} mb={0} radius="md" onClick={controlState.next_action}>
								{controlState.action_text}
							</Button>
							{raven.state !== 'READY' && (
								<Flip.Target>
									<Button fullWidth mt={0} mb={0} color="yellow" radius="md">
										Learnings
									</Button>
								</Flip.Target>
							)}
						</Group>
					</Card.Section>
				</Card>
				<RavenCardLearnings
					w={{ xs: 340, sm: 340, md: 400, lg: 500, xl: 500 }}
					miw={340}
					raven={raven}
					controlState={controlState}
					cardHeight={Math.round(rect.height) + 50}
				/>
			</Flip>
		</Group>
	);
};

export { RavenCard };
