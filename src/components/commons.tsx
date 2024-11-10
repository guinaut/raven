'use client';

import { ActionIcon, Flex, Center, Text, Anchor, Group } from '@mantine/core';
//import { IoIosArrowBack,  } from "react-icons/io";
import { /*GiNestBirds,*/ GiFruitTree, GiBirdHouse } from 'react-icons/gi';
import { BsGear } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

export enum PageArea {
	None = 'None',
	AuthorSettings = 'author_settings',
	RavenCRUD = 'raven_settings',
	RavenList = 'raven_list',
}

export function ReturnHome(props: { miw: number; selected_area?: PageArea }) {
	const { selected_area = PageArea.None } = props;
	const router = useRouter();
	const handleGoHome = () => {
		router.push('/aerie/new');
	};
	const handleGoSettings = () => {
		router.push('/aerie/settings');
	};
	return (
		<Group {...props} justify="flex-start" w={100} gap={4}>
			<ActionIcon
				size="md"
				onClick={handleGoSettings}
				variant="filled"
				color={selected_area == PageArea.AuthorSettings ? 'yellow' : 'orange'}
				aria-label="Settings"
			>
				<BsGear style={{ width: '70%', height: '70%' }} stroke="1.5" />
			</ActionIcon>
			<ActionIcon
				size="md"
				onClick={handleGoHome}
				variant="filled"
				color={selected_area == PageArea.RavenCRUD ? 'yellow' : 'orange'}
				aria-label="Return Home"
			>
				<GiFruitTree style={{ width: '70%', height: '70%' }} stroke="1.5" />
			</ActionIcon>
		</Group>
	);
}

export function GoToAerie(props: { miw: number; selected_area?: PageArea }) {
	const { selected_area = PageArea.None } = props;
	const router = useRouter();
	const handleGoAerie = () => {
		router.push('/aerie/list');
	};
	return (
		<Group {...props} justify="flex-end" w={100} gap={4}>
			<ActionIcon
				size="md"
				onClick={handleGoAerie}
				variant="filled"
				color={selected_area == PageArea.RavenList ? 'yellow' : 'orange'}
				aria-label="Go to Aerie"
			>
				<GiBirdHouse style={{ width: '70%', height: '70%' }} stroke="1.5" />
			</ActionIcon>
		</Group>
	);
}

export function AerieHeader(props: React.PropsWithChildren<{ selected_area?: PageArea }>) {
	const { selected_area = PageArea.None } = props;
	return (
		<Flex mt="sm" w="100%" {...props}>
			<ReturnHome miw={40} selected_area={selected_area} />
			<Flex w="100%">
				<Center w="100%">
					<Text size="xl" fw={900} variant="gradient">
						RavenChat
					</Text>
				</Center>
			</Flex>
			<GoToAerie miw={40} selected_area={selected_area} />
		</Flex>
	);
}

export function AerieFooter(props: React.PropsWithChildren) {
	const { signOut } = useClerk();

	return (
		<Group grow>
			<Center>
				<Flex mt="sm" w={{ xs: 340, sm: 340, md: 400, lg: 500, xl: 500 }} {...props}>
					<Center w="100%">
						<Text size="sm" fw={900} variant="gradient">
							<Anchor onClick={() => signOut({ redirectUrl: '/' })}>Sign out</Anchor>
						</Text>
						<Text size="sm" fw={900} variant="gradient" ml={20} mr={20}>
							{`•`}
						</Text>
						<Text size="sm" fw={900} variant="gradient">
							{`Ravenchat.io 2024`}
						</Text>
					</Center>
				</Flex>
			</Center>
		</Group>
	);
}
