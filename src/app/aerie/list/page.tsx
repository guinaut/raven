'use client';

import { Group, Stack, Center, Flex } from '@mantine/core';
import { AerieHeader, PageArea } from '@/components/commons';
import { RavenList } from '@/components/list-ravens';
export default function RavenListPage() {
	return (
		<Group grow>
			<Center>
				<Stack align="stretch">
					<AerieHeader selected_area={PageArea.RavenList} />
					<Flex mih={600} gap="sm" justify="flex-start" align="flex-start">
						<RavenList />
					</Flex>
				</Stack>
			</Center>
		</Group>
	);
}
