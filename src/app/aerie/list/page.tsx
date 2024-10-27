'use client';

import { Group, Stack, Center, Flex } from '@mantine/core';
import { AerieHeader } from '../../../components/commons';
import { RavenList } from '../../../components/list-ravens';

export default function HomePage() {
	return (
		<Group grow>
			<Center>
				<Stack align="stretch">
					<AerieHeader />
					<Flex h={600} gap="sm" justify="flex-start" align="flex-start">
						<RavenList />
					</Flex>
				</Stack>
			</Center>
		</Group>
	);
}
