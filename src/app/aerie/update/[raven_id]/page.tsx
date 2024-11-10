'use client';

import useSWR from 'swr';
import { Group, Center, Stack, Flex } from '@mantine/core';
import { AerieHeader, PageArea } from '@/components/commons';
import { UpdateRaven } from '@/components/update-raven';

function useRaven(raven_id: string) {
	const fetcher = async (url: string, raven_id: string) => {
		if (!raven_id || raven_id.length === 0) {
			return null;
		}
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
	const { data, error, isLoading } = useSWR([`/api/v1/account/raven/${raven_id}`, raven_id], ([url, raven_id]) => fetcher(url, raven_id));

	return {
		raven: data,
		isLoading,
		isError: error,
	};
}

export default function Page({ params }: { params: { raven_id: string } }) {
	const { raven_id } = params;
	const { raven } = useRaven(raven_id);
	return (
		<Group grow>
			<Center>
				<Stack align="stretch" pl={20} pr={20}>
					<AerieHeader selected_area={PageArea.RavenCRUD} />
					<Flex gap="sm" justify="flex-start" align="flex-start">
						<UpdateRaven raven={raven} />
					</Flex>
				</Stack>
			</Center>
		</Group>
	);
}
