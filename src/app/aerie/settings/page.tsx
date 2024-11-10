'use client';

import { Group, Stack, Center, Flex } from '@mantine/core';
import { AerieHeader, PageArea } from '@/components/commons';
import { AuthorSettings } from '@/components/author-settings';

export default function HomePage() {
	return (
		<Group grow>
			<Center>
				<Stack align="stretch" pl={20} pr={20}>
					<AerieHeader selected_area={PageArea.AuthorSettings} />
					<Flex gap="sm" justify="flex-start" align="flex-start">
						<AuthorSettings />
					</Flex>
				</Stack>
			</Center>
		</Group>
	);
}
