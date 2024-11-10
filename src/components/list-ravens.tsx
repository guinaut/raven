import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Stack, Loader, Center, SegmentedControl } from '@mantine/core';
import { Raven } from '@prisma/client'; // Assuming you have the Prisma types available
import { RavenCard } from './raven-card';
import { RavenCardEmptyNesting, RavenCardEmptyActive, RavenCardEmptyResting, RavenCardEmptyRetired } from './raven-card-empty';
/*
  READY
  ACTIVE
  COMPLETE
  CANCELED
*/

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
			.then((data) => {
				return data;
			})
			.catch((error) => {
				console.error('Error fetching:', error);
			});
	};

	const { data, error, isLoading } = useSWR([`/api/v1/account/raven/list`], ([url]) => fetcher(url));

	return {
		ravens: data,
		isLoading,
		isError: error,
	};
}

const RavenList = () => {
	const { ravens, isLoading } = useRavens();
	const [viewRavens, setViewRavens] = useState<Raven[]>([]);

	const segmentValues: string[] = ['NESTING', 'FLYING', 'RESTING', 'RETIRED'];
	const filterValues: string[] = ['READY', 'ACTIVE', 'CANCELED', 'COMPLETE'];
	const [filterBy, setFilterBy] = useState(filterValues[0]); // READY, ACTIVE, CANCELED, COMPLETE
	const [segmentItem, setSegmentItem] = useState(segmentValues[0]);

	const handleFilterChange = (value: string) => {
		const index: number = segmentValues.indexOf(value);
		setFilterBy(filterValues[index]);
		setSegmentItem(value);
	};

	const handleRavenChanged = (props: { raven: Raven }) => {
		const { raven } = props;
		if (raven) {
			//const index: number = filterValues.indexOf(raven.state);
			setFilterBy(raven.state);
			setSegmentItem(segmentValues[filterValues.indexOf(raven.state)]);
		}
	};

	const handleRefreshRavens = (props: { raven: Raven }) => {
		const { raven } = props;
		if (raven) {
			ravens.push(raven); // hacky way to refresh the list
			setFilterBy(raven.state);
			setSegmentItem(segmentValues[filterValues.indexOf(raven.state)]);
		}
	};

	useEffect(() => {
		if (!isLoading && ravens && ravens.length > 0) {
			if (filterBy === 'READY') {
				setViewRavens(ravens.filter((raven: Raven) => raven.state === 'READY'));
			} else if (filterBy === 'ACTIVE') {
				setViewRavens(ravens.filter((raven: Raven) => raven.state === 'ACTIVE'));
			} else if (filterBy === 'CANCELED') {
				setViewRavens(ravens.filter((raven: Raven) => raven.state === 'CANCELED'));
			} else if (filterBy === 'COMPLETE') {
				setViewRavens(ravens.filter((raven: Raven) => raven.state === 'COMPLETE'));
			}
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
								<RavenCard key={raven.id} raven={raven} onChange={handleRavenChanged} onRefreshRavens={handleRefreshRavens} />
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
