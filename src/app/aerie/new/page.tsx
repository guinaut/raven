'use client';

import { Group, Stack, Center, Flex } from '@mantine/core';
import { AerieHeader } from '../../../components/commons';
import { CreateRaven } from '../../../components/create-raven';

export default function NewRaven() {
	return (
		<Group grow>
			<Center>
				<Stack align="stretch">
					<AerieHeader />
					<Flex gap="sm" justify="flex-start" align="flex-start">
						<CreateRaven />
					</Flex>
				</Stack>
			</Center>
		</Group>
	);
}
