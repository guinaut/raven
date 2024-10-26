import { ActionIcon, Box, Flex, Center, Text } from '@mantine/core';
//import { IoIosArrowBack,  } from "react-icons/io";
import { GiNestBirds, GiFruitTree } from "react-icons/gi";
import { useRouter } from 'next/navigation';

export function ReturnHome(props:any) {const router = useRouter();
    const handleGoHome = () => {
      router.push('/aerie/new');
    }
  return (
    <Box {...props}>
        <ActionIcon size="md" onClick={handleGoHome} variant="filled" color="orange" aria-label="Return Home">
        <GiFruitTree style={{ width: '70%', height: '70%' }} stroke="1.5" />
        </ActionIcon>
    </Box>
  );
}

export function GoToAerie(props:any) {const router = useRouter();
    const handleGoAerie = () => {
      router.push('/aerie/list');
    }
  return (
    <Box {...props}>
        <ActionIcon size="md" onClick={handleGoAerie} variant="filled" color="orange" aria-label="Go to Aerie">
        <GiNestBirds style={{ width: '70%', height: '70%' }} stroke="1.5" />
        </ActionIcon>
    </Box>
  );
}

export function AerieHeader(props:any) {
    return (
        <Flex mt="sm" w="100%" {...props} >
            <ReturnHome miw={40}/>
            <Flex w="100%">
                <Center w="100%" mr={40}>
                <Text size="xl" fw={900} variant="gradient">
                    RavenChat
                </Text>
                </Center>
            </Flex>
            <GoToAerie miw={40}/>
        </Flex>
    )
}