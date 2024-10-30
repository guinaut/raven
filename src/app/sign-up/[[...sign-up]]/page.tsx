import { SignUp } from '@clerk/nextjs';
import { Center, Flex, Group, Stack } from '@mantine/core';
export default function Page() {
	return (
		<Group grow>
			<Center>
				<Stack align="stretch">
					<Flex h={600} gap="sm" justify="flex-start" align="flex-start">
						<SignUp />
					</Flex>
				</Stack>
			</Center>
		</Group>
	);
}
