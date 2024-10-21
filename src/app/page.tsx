'use client';

import { 
  Group, 
  Stack,
  Text,
  Center,
  Flex,
} from "@mantine/core";

import { CreateRaven } from '../components/create-raven';
import { RavenList } from '../components/list-ravens';

export default function HomePage() {

  return (
    <Group grow>
      <Center>
        <Stack align="stretch">
          <Center>
              <Text size="xl" fw={900} variant="gradient">
                  RavenChat
              </Text>
          </Center>
          <Flex h={600} gap="sm" justify="flex-start" align="flex-start">
            <CreateRaven />
            <RavenList />
          </Flex>
        </Stack>
      </Center>
    </Group>
  );
}