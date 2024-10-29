import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Stack, Loader, Center, SegmentedControl } from '@mantine/core';
import { Raven } from '@prisma/client'; // Assuming you have the Prisma types available
import { RavenCard } from './raven-card';

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

	const segmentValues: string[] = ['NESTING', 'FLYING', 'RESTING'];
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
			const index: number = filterValues.indexOf(raven.state);
			setFilterBy(raven.state);
			setSegmentItem(filterValues[index]);
		}
	};

	useEffect(() => {
		if (!isLoading && ravens && ravens.length > 0) {
			if (filterBy === 'READY') {
				setViewRavens(ravens.filter((raven: Raven) => raven.state === 'READY'));
			} else if (filterBy === 'ACTIVE') {
				setViewRavens(ravens.filter((raven: Raven) => raven.state === 'ACTIVE'));
			} else if (filterBy === 'CANCELED' || filterBy === 'COMPLETE') {
				setViewRavens(ravens.filter((raven: Raven) => raven.state === 'CANCELED' || raven.state === 'COMPLETE'));
			}
		}
	}, [ravens, isLoading, filterBy]);

	return (
		<Stack w={340}>
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
					{viewRavens.map((raven: Raven) => (
						<RavenCard key={raven.id} raven={raven} onChange={handleRavenChanged} />
					))}
				</>
			)}
		</Stack>
	);
};

export { RavenList };
