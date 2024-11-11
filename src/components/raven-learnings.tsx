'use client';
import { useEffect, useState } from 'react';
import { Card, Group, Button, Stack, ScrollArea, Text } from '@mantine/core';
import { Flip } from '@gfazioli/mantine-flip';
import useSWR from 'swr';
import ReactMarkdown from 'react-markdown';
import { RavenState, ExtendedRaven } from './raven-card';
import { RavenCardTitleBar } from './raven-card-titlebar';

function useLearnings(url: string, raven_id: string) {
	const fetcher = async (url: string, raven_id: string) => {
		if (!raven_id || raven_id.length === 0) {
			return null;
		}
		return fetch(url, {
			headers: new Headers({
				'Content-Type': 'application/json',
			}),
			credentials: 'same-origin',
			method: 'POST',
			body: JSON.stringify({
				raven_id,
			}),
		})
			.then((res) => res.json())
			.then((data) => {
				return data;
			})
			.catch((error) => {
				console.error('Error fetching:', error);
			});
	};

	const { data, error, isLoading } = useSWR([`/api/v1/account/raven/analysis`, raven_id], ([url, raven_id]) => fetcher(url, raven_id));

	return {
		analysis_data: data,
		isLoading,
		isError: error,
	};
}

interface RavenAnalysis {
	summary: string;
	data: [
		{
			[key: string]: string[];
		},
	];
}

const RavenCardLearnings = (props: { w?: any; miw?: any; raven: ExtendedRaven; controlState: RavenState; cardHeight: number }) => {
	const { raven, controlState, cardHeight, w = 340, miw = 340 } = props;
	const { analysis_data, isLoading } = useLearnings('/api/v1/account/raven/analysis', raven.id);
	const [analysis, setAnalysis] = useState<RavenAnalysis>({
		summary: 'Loading',
		data: [{} as { [key: string]: string[] }],
	});

	useEffect(() => {
		if (!isLoading && analysis_data) {
			setAnalysis(analysis_data);
		}
	}, [analysis_data, isLoading]);

	return (
		<Card shadow="none" padding={0} radius="md" withBorder h={cardHeight}>
			<ScrollArea.Autosize type="auto" h="100%" mx="auto" scrollbars="y">
				<Card shadow="sm" padding="lg" radius="md" w={w} miw={miw}>
					<RavenCardTitleBar raven={raven} controlState={controlState} />
					<Card.Section mih={cardHeight - 88}>
						<Stack justify="space-between" m="sm" gap="md">
							<Text span size="sm" c="dimmed" w="100%" h="100%">
								<ReactMarkdown>{analysis.summary}</ReactMarkdown>
							</Text>
						</Stack>
					</Card.Section>
					<Card.Section>
						<Group grow ml={10} mr={10}>
							<Flip.Target>
								<Button fullWidth mt={0} mb={0} color="yellow" radius="md">
									Close
								</Button>
							</Flip.Target>
						</Group>
					</Card.Section>
				</Card>
			</ScrollArea.Autosize>
		</Card>
	);
};

export { RavenCardLearnings };
