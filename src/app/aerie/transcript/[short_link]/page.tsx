'use client';

import { Group, Stack, Center, Flex } from '@mantine/core';
import { AerieHeader, PageArea } from '@/components/commons';
import { RecipientTranscript } from '@/components/recipient-transcript';

export default function RavenTranscriptPage({ params }: { params: { short_link: string } }) {
	const { short_link } = params;
	return (
		<Group grow>
			<Center>
				<Stack align="stretch">
					<AerieHeader selected_area={PageArea.RavenList} />
					<Flex h={600} gap="sm" justify="flex-start" align="flex-start">
						<RecipientTranscript short_link={short_link} />
					</Flex>
				</Stack>
			</Center>
		</Group>
	);
}
