'use client';

import { Group, Stack, Text, Center, Flex, Button } from '@mantine/core';

import { useRouter } from 'next/navigation';

export default function HomePage() {
	const router = useRouter();

	const handleNewRaven = () => {
		router.push('/aerie/new');
	};

	const handleAerie = () => {
		router.push('/aerie/list');
	};

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
						<Button variant="filled" color="orange" onClick={handleNewRaven}>
							Hatch a Raven
						</Button>
						<Button variant="filled" color="yellow" onClick={handleAerie}>
							Visit the Aerie
						</Button>
					</Flex>
				</Stack>
			</Center>
		</Group>
	);
}
