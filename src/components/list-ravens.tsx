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

	const options: string[] = ['READY', 'ACTIVE', 'CANCELED'];
	const [filterBy, setFilterBy] = useState(options[1]);

	const handleRavenChanged = (props: { raven: Raven }) => {
		const { raven } = props;
		if (raven) {
			setFilterBy(raven.state);
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
			}
		}
	}, [ravens, isLoading, filterBy]);

	return (
		<Stack w={340}>
			<SegmentedControl
				fullWidth
				value={filterBy}
				onChange={setFilterBy}
				data={options}
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
