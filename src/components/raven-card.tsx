// components/RavenList.tsx
import NextImage from 'next/image';
import { useState, useEffect, MouseEventHandler } from 'react';
import { Card, Text, Group, Image, Badge, Button, } from '@mantine/core';
import { Raven } from '@prisma/client';  // Assuming you have the Prisma types available

import ravenReadyImage from '../assets/raven-resting.png';
import ravenLaunchImage from '../assets/raven-launching.png';

/*
  READY
  ACTIVE
  COMPLETE
  CANCELED
*/

interface RavenState {
    status: string;
    status_color: string;
    image: typeof ravenReadyImage;
    action_text: string;
    next_action: MouseEventHandler;
}

const saveRaven = async (raven: Raven) => {
    const { id, state, short_link_id } = raven;
    try {
        const res = await fetch('/api/v1/raven', {
            headers: new Headers({
                'Content-Type': 'application/json',
            }),
            credentials: 'same-origin',
            method: 'POST',
            body: JSON.stringify({
                id, state, short_link_id,
            }),
        });
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Error fetching ravens:', error);
    }
};


const RavenCard = (props: { raven: Raven }) => {
    const [ raven, setRaven ] = useState<Raven>(props.raven);
    const [ controlState, setControlState ] = useState<RavenState>({
        status: 'Loading',
        status_color: 'gray.3',
        image: ravenReadyImage,
        action_text: 'Loading',
        next_action: () => {
            console.log('Loading');
        },
    });

    useEffect(() => {
        if (raven) {
            if (raven.state === 'READY') {
                setControlState({
                    status: 'Ready',
                    status_color: 'gray.6',
                    image: ravenReadyImage,
                    action_text: 'Send Raven',
                    next_action: () => {
                        raven.state = 'ACTIVE';
                        saveRaven(raven)
                        .then((data) => {
                            setRaven(data);
                            return data;
                        });
                    }
                });
            } else if (raven.state === 'ACTIVE') {
                setControlState({
                    status: 'Sent',
                    status_color: 'green',
                    image: ravenLaunchImage,
                    action_text: 'Recall Raven',
                    next_action: () => {
                        raven.state = 'CANCELED';
                        saveRaven(raven)
                        .then((data) => {
                            setRaven(data);
                            return data;
                        });
                    }
                });
            } else if (raven.state === 'CANCELED') {
                setControlState({
                    status: 'Recalled',
                    status_color: 'red',
                    image: ravenLaunchImage,
                    action_text: 'Ready Raven',
                    next_action: () => {
                        raven.state = 'READY';
                        saveRaven(raven)
                        .then((data) => {
                            setRaven(data);
                            return data;
                        });
                    }
                });
            }
        }
    }, [raven]);

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder w={340}>
            <Card.Section>
                <Image
                    component={NextImage} 
                    src={controlState.image}
                    height={100}
                    alt={controlState.status}
                />
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
                <Text fw={500}>{raven.topic}</Text>
                <Badge color={controlState.status_color}>{controlState.status}</Badge>
            </Group>
            {raven.short_link && (
            <Group justify="space-between" mt="md" mb="xs">
                <Text fw={500} size="xs" >{`https://ravenchat.io/${raven.short_link}`}</Text>
            </Group>)}

            <Text size="sm" c="dimmed">
                {raven.directive}
            </Text>

            <Button fullWidth mt="md" radius="md" onClick={controlState.next_action}>
                {controlState.action_text}
            </Button>
        </Card>
    );
};

export { RavenCard };