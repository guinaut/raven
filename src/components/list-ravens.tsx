import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { Stack, Loader, Center, SegmentedControl } from '@mantine/core';
import { Raven } from '@prisma/client'; // Assuming you have the Prisma types available
import { RavenCard } from './raven-card';
import { RavenCardEmptyNesting, RavenCardEmptyActive, RavenCardEmptyResting, RavenCardEmptyRetired } from './raven-card-empty';

function useRavens() {
	const fetcher = async (url: string) => {
		return fetch(url, {
			headers: new Headers({
				'Content-Type': 'application/json',
			}),
			credentials: 'same-origin',
			method: 'GET',
		})
			.then((res) => res.json())
			.catch((error) => {
				console.error('Error fetching:', error);
			});
	};

	const { data, error, isLoading, mutate } = useSWR(`/api/v1/account/raven/list`, fetcher);

	return {
		ravens: data,
		isLoading,
		isError: error,
		mutate,
	};
}

const RavenList = () => {
	const { ravens, isLoading, mutate } = useRavens();
	const [viewRavens, setViewRavens] = useState<Raven[]>([]);

	const segmentValues: string[] = ['NESTING', 'FLYING', 'RESTING', 'RETIRED'];
	const filterValues: string[] = ['READY', 'ACTIVE', 'CANCELED', 'COMPLETE'];
	const [filterBy, setFilterBy] = useState(filterValues[0]);
	const [segmentItem, setSegmentItem] = useState(segmentValues[0]);

	const handleFilterChange = (value: string) => {
		const index: number = segmentValues.indexOf(value);
		setFilterBy(filterValues[index]);
		setSegmentItem(value);
	};

	const handleRavenChanged = useCallback(
		(props: { raven: Raven }) => {
			if (props.raven) {
				mutate(); // Refresh data from the server to get the latest state
			}
		},
		[mutate],
	);

	useEffect(() => {
		if (!isLoading && ravens && ravens.length > 0) {
			setViewRavens(ravens.filter((raven: Raven) => raven.state === filterBy));
		}
	}, [ravens, isLoading, filterBy]);

	return (
		<Stack w={{ xs: 340, sm: 340, md: 400, lg: 500, xl: 500 }}>
			<SegmentedControl
				fullWidth
				value={segmentItem}
				onChange={handleFilterChange}
				data={segmentValues}
				size="xs"
				transitionDuration={250}
				transitionTimingFunction="linear"
			/>
			{isLoading ? (
				<Center mih={300}>
					<Loader />
				</Center>
			) : (
				<>
					{viewRavens.length > 0 ? (
						<>
							{viewRavens.map((raven: Raven) => (
								<RavenCard key={raven.id} raven={raven} onChange={handleRavenChanged} />
							))}
						</>
					) : (
						<>
							{filterBy === 'READY' && <RavenCardEmptyNesting />}
							{filterBy === 'ACTIVE' && <RavenCardEmptyActive />}
							{filterBy === 'CANCELED' && <RavenCardEmptyResting />}
							{filterBy === 'COMPLETE' && <RavenCardEmptyRetired />}
						</>
					)}
				</>
			)}
		</Stack>
	);
};

export { RavenList };
