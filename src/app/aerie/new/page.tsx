'use client';

import { Group, Stack, Center, Flex } from '@mantine/core';
import { AerieHeader, PageArea } from '@/components/commons';
import { CreateRaven } from '@/components/create-raven';

export default function NewRaven() {
	return (
		<Group grow>
			<Center>
				<Stack align="stretch" pl={20} pr={20}>
					<AerieHeader selected_area={PageArea.RavenCRUD} />
					<Flex gap="sm" justify="flex-start" align="flex-start">
						<CreateRaven />
					</Flex>
				</Stack>
			</Center>
		</Group>
	);
}
