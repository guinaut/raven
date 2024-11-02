'use client';

import { ActionIcon, Box, Flex, Center, Text, Anchor, Group } from '@mantine/core';
//import { IoIosArrowBack,  } from "react-icons/io";
import { /*GiNestBirds,*/ GiFruitTree, GiBirdHouse } from 'react-icons/gi';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

export function ReturnHome(props: { miw: number }) {
	const router = useRouter();
	const handleGoHome = () => {
		router.push('/aerie/new');
	};
	return (
		<Box {...props}>
			<ActionIcon size="md" onClick={handleGoHome} variant="filled" color="orange" aria-label="Return Home">
				<GiFruitTree style={{ width: '70%', height: '70%' }} stroke="1.5" />
			</ActionIcon>
		</Box>
	);
}

export function GoToAerie(props: { miw: number }) {
	const router = useRouter();
	const handleGoAerie = () => {
		router.push('/aerie/list');
	};
	return (
		<Box {...props}>
			<ActionIcon size="md" onClick={handleGoAerie} variant="filled" color="orange" aria-label="Go to Aerie">
				<GiBirdHouse style={{ width: '70%', height: '70%' }} stroke="1.5" />
			</ActionIcon>
		</Box>
	);
}

export function AerieHeader(props: React.PropsWithChildren) {
	return (
		<Flex mt="sm" w="100%" {...props}>
			<ReturnHome miw={40} />
			<Flex w="100%">
				<Center w="100%">
					<Text size="xl" fw={900} variant="gradient">
						RavenChat
					</Text>
				</Center>
			</Flex>
			<GoToAerie miw={40} />
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
