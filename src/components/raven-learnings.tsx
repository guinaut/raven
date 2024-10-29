'use client';
import { Card, Group, Button, Stack, ScrollArea, Text } from '@mantine/core';
import { Flip } from '@gfazioli/mantine-flip';
import useSWR from 'swr';
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
	data: {
		[key: string]: string[];
	};
}

const RavenCardLearnings = (props: { raven: ExtendedRaven; controlState: RavenState; cardHeight: number }) => {
	const { raven, controlState, cardHeight } = props;
	const { analysis_data, isLoading } = useLearnings('/api/v1/account/raven/analysis', raven.id);
	const [analysis, setAnalysis] = useState<RavenAnalysis>({
		summary: 'Loading',
		data: {},
	});

	/*

						<Grid w={320} p="md">
							{Object.keys(analysis.data).map((key) => {
								return (
									<Grid.Col maw={150} span={6} key={key} m={0} p={0}>
										<Stack m={0} p={0} gap={0} justify="center" mt="md">
											<DonutChart size={80} thickness={14} data={dataDonutConverter(analysis.data, key)} />
											<Text size="sm" ta="center">
												{key}
											</Text>
										</Stack>
									</Grid.Col>
								);
							})}
						</Grid>
	const dataDonutConverter = (data: any, finding: string) => {
		const finding_data: string[] = data[finding];
		const d_data: { name: string; value: number; color: string }[] = finding_data.map((d: string, index: number) => {
			return {
				name: d,
				value: Math.round(100 / finding_data.length),
				color: 'blue.' + (index + 3),
			};
		});
		return d_data;
	};
	*/

	useEffect(() => {
		if (!isLoading && analysis_data) {
			setAnalysis(analysis_data);
		}
	}, [analysis_data, isLoading]);

	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder w={340} h={cardHeight}>
			<RavenCardTitleBar raven={raven} controlState={controlState} />
			<Card.Section h="100%">
				<ScrollArea.Autosize mah={150} mx="auto" scrollbars="y" offsetScrollbars>
					<Stack justify="space-between" m="sm" gap="md">
						<Text size="sm" c="dimmed">
							{analysis.summary}
						</Text>
					</Stack>
				</ScrollArea.Autosize>
			</Card.Section>
			<Card.Section>
				<Group grow>
					<Flip.Target>
						<Button fullWidth color="yellow" mt="md" radius="md">
							Close
						</Button>
					</Flip.Target>
				</Group>
			</Card.Section>
		</Card>
	);
};

export { RavenCardLearnings };
