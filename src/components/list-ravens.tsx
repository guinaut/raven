import { useState, useEffect } from 'react';
import { Stack, Loader, Center, SegmentedControl } from '@mantine/core';
import { Raven } from '@prisma/client'; // Assuming you have the Prisma types available
import { RavenCard } from './raven-card';

const RavenList = () => {
	const [ravens, setRavens] = useState([]);
	const [viewRavens, setViewRavens] = useState([]);

	const [loading, setLoading] = useState(true);

	const options: string[] = ['Ready', 'In Flight', 'Canceled'];
	const [filterBy, setFilterBy] = useState(options[1]);

	useEffect(() => {
		const fetchRavens = async () => {
			try {
				const res = await fetch('/api/v1/account/raven/list');
				const data = await res.json();
				setRavens(data);
			} catch (error) {
				console.error('Error fetching ravens:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchRavens();
	}, []);

	useEffect(() => {
		if (filterBy === 'Ready') {
			setViewRavens(ravens.filter((raven: Raven) => raven.state === 'READY'));
		} else if (filterBy === 'In Flight') {
			setViewRavens(ravens.filter((raven: Raven) => raven.state === 'ACTIVE'));
		} else if (filterBy === 'Canceled') {
			setViewRavens(ravens.filter((raven: Raven) => raven.state === 'CANCELED'));
		}
	}, [ravens, filterBy]);

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

			{loading ? (
				<Center mih={300}>
					<Loader />
				</Center>
			) : (
				<>
					{viewRavens.map((raven: Raven) => (
						<RavenCard key={raven.id} raven={raven} />
					))}
				</>
			)}
		</Stack>
	);
};

export { RavenList };
