// components/RavenList.tsx
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { MouseEventHandler } from 'react';
import { Card, Text, Group, Image, Button, Stack, ScrollArea } from '@mantine/core';
import noravenSummerImage from '../assets/summer-noraven.png';
import noravenAutumnImage from '../assets/autumn-noraven.png';

export interface RavenState {
	status: string;
	status_color: string;
	image: typeof noravenSummerImage;
	type: string;
	action_text: string;
	next_action: MouseEventHandler;
}

const RavenCardEmptyNesting = () => {
	const router = useRouter();

	const controlState: RavenState = {
		status: 'Loading',
		status_color: 'gray.3',
		type: 'PUBLIC',
		image: noravenSummerImage,
		action_text: 'Loading',
		next_action: () => {
			router.push('/aerie/new');
		},
	};

	return (
		<Group>
			<Card shadow="sm" padding="lg" radius="md" withBorder w={340}>
				<Card.Section>
					<Image component={NextImage} src={controlState.image} height={100} style={{ opacity: '0.25' }} alt={controlState.status} />
				</Card.Section>

				<Card.Section>
					<Group m="sm" p={0} gap={5} grow preventGrowOverflow>
						<Group grow>
							<Text fw={500}>{`Looks like an empty nest.`}</Text>
						</Group>
					</Group>
				</Card.Section>
				<Card.Section>
					<Stack justify="space-between" m="sm">
						<ScrollArea.Autosize mah={200} mx="auto">
							<Text size="sm" c="dimmed">
								{`Train a raven to send a message.`}
							</Text>
						</ScrollArea.Autosize>
					</Stack>
				</Card.Section>
				<Card.Section>
					<Group grow>
						<Button color="yellow" fullWidth mt="md" radius="md" onClick={controlState.next_action}>
							Train a Raven
						</Button>
					</Group>
				</Card.Section>
			</Card>
		</Group>
	);
};

const RavenCardEmptyResting = () => {
	const router = useRouter();

	const controlState: RavenState = {
		status: 'Loading',
		status_color: 'gray.3',
		type: 'PUBLIC',
		image: noravenAutumnImage,
		action_text: 'Loading',
		next_action: () => {
			router.push('/aerie/new');
		},
	};

	return (
		<Group>
			<Card shadow="sm" padding="lg" radius="md" withBorder w={340}>
				<Card.Section>
					<Image component={NextImage} src={controlState.image} height={100} style={{ opacity: '0.25' }} alt={controlState.status} />
				</Card.Section>

				<Card.Section>
					<Group m="sm" p={0} gap={5} grow preventGrowOverflow>
						<Group grow>
							<Text fw={500}>{``}</Text>
						</Group>
					</Group>
				</Card.Section>
				<Card.Section>
					<Stack justify="space-between" m="sm">
						<ScrollArea.Autosize mah={200} mx="auto">
							<Text size="sm" c="dimmed">
								{`All the Ravens are busy or nesting.`}
							</Text>
						</ScrollArea.Autosize>
					</Stack>
				</Card.Section>
				<Card.Section>
					<Group grow></Group>
				</Card.Section>
			</Card>
		</Group>
	);
};

const RavenCardEmptyActive = () => {
	const router = useRouter();

	const controlState: RavenState = {
		status: 'Loading',
		status_color: 'gray.3',
		type: 'PUBLIC',
		image: noravenAutumnImage,
		action_text: 'Loading',
		next_action: () => {
			router.push('/aerie/new');
		},
	};

	return (
		<Group>
			<Card shadow="sm" padding="lg" radius="md" withBorder w={340}>
				<Card.Section>
					<Image component={NextImage} src={controlState.image} height={100} style={{ opacity: '0.25' }} alt={controlState.status} />
				</Card.Section>

				<Card.Section>
					<Group m="sm" p={0} gap={5} grow preventGrowOverflow>
						<Group grow>
							<Text fw={500}>{`No active Ravens?!`}</Text>
						</Group>
					</Group>
				</Card.Section>
				<Card.Section>
					<Stack justify="space-between" m="sm">
						<ScrollArea.Autosize mah={200} mx="auto">
							<Text size="sm" c="dimmed">
								{`Ravens want to fly. Let's Go!`}
							</Text>
						</ScrollArea.Autosize>
					</Stack>
				</Card.Section>
				<Card.Section>
					<Group grow>
						<Button color="yellow" fullWidth mt="md" radius="md" onClick={controlState.next_action}>
							Train a Raven
						</Button>
					</Group>
				</Card.Section>
			</Card>
		</Group>
	);
};

const RavenCardEmptyRetired = () => {
	const router = useRouter();

	const controlState: RavenState = {
		status: 'Loading',
		status_color: 'gray.3',
		type: 'PUBLIC',
		image: noravenAutumnImage,
		action_text: 'Loading',
		next_action: () => {
			router.push('/aerie/new');
		},
	};

	return (
		<Group>
			<Card shadow="sm" padding="lg" radius="md" withBorder w={340}>
				<Card.Section>
					<Image component={NextImage} src={controlState.image} height={100} style={{ opacity: '0.25' }} alt={controlState.status} />
				</Card.Section>

				<Card.Section>
					<Group m="sm" p={0} gap={5} grow preventGrowOverflow>
						<Group grow>
							<Text fw={500}>{``}</Text>
						</Group>
					</Group>
				</Card.Section>
				<Card.Section>
					<Stack justify="space-between" m="sm">
						<ScrollArea.Autosize mah={200} mx="auto">
							<Text size="sm" c="dimmed">
								{`Get busy so your Ravens can enjoy their golden years.`}
							</Text>
						</ScrollArea.Autosize>
					</Stack>
				</Card.Section>
				<Card.Section>
					<Group grow></Group>
				</Card.Section>
			</Card>
		</Group>
	);
};

export { RavenCardEmptyNesting, RavenCardEmptyActive, RavenCardEmptyResting, RavenCardEmptyRetired };
