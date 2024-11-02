'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { completeOnboarding } from './_actions';
import NextImage from 'next/image';
import { Card, Text, Group, Image, Button, Stack, ScrollArea, Center, List, ThemeIcon, rem } from '@mantine/core';
import { Flip } from '@gfazioli/mantine-flip';
import ravenFriendlyImage from '../../assets/raven-friendly-wideview.png';
import ravenLaunchImage from '../../assets/raven-launching.png';
import { FaHeartCircleCheck, FaPeopleArrows } from 'react-icons/fa6';
import { GrCircleQuestion } from 'react-icons/gr';
import { GiRaven } from 'react-icons/gi';

export default function OnboardingComponent() {
	const [error, setError] = useState('');
	const { user } = useUser();
	const router = useRouter();

	const handleGetStarted = async () => {
		if (user) {
			const res = await completeOnboarding({
				name: user.fullName,
				email: user.emailAddresses[0].emailAddress,
			});
			if (res?.message) {
				// Reloads the user's data from Clerk's API
				await user?.reload();
				router.push('/aerie/new');
			}
			if (res?.error) {
				setError(res?.error);
			}
		}
	};
	useEffect(() => {
		console.log(error);
	}, [error]);
	return (
		<Group grow mt={24}>
			<Center>
				<Flip w={340} h={500}>
					<Card shadow="sm" padding="lg" radius="md" withBorder w={340} h={380}>
						<Card.Section>
							<Image component={NextImage} src={ravenFriendlyImage} height={150} alt="Regal raven listening to your instructions." />
						</Card.Section>
						<Card.Section>
							<Stack justify="space-between" m="sm" h={150}>
								<ScrollArea.Autosize mah={150} mx="auto">
									<Text size="sm" c="dimmed">
										{`Train your Raven (coming soon).`}
									</Text>
									<List
										spacing="md"
										size="sm"
										center
										mt="lg"
										w={300}
										icon={
											<ThemeIcon color="orange" size={24} radius="xl">
												<FaHeartCircleCheck style={{ width: rem(16), height: rem(16) }} />
											</ThemeIcon>
										}
									>
										<List.Item c="dimmed">{`What times of the day do you like to work/play?`}</List.Item>
										<List.Item c="dimmed">{`What kind of foods do you like.`}</List.Item>
										<List.Item c="dimmed">{`Anything else that will help the Raven answer questions.`}</List.Item>
									</List>
								</ScrollArea.Autosize>
							</Stack>
						</Card.Section>
						<Card.Section>
							<Group grow>
								<Flip.Target>
									<Button fullWidth color="yellow" mt="md" radius="md">
										{`Get Ready`}
									</Button>
								</Flip.Target>
							</Group>
						</Card.Section>
					</Card>
					<Card shadow="sm" padding="lg" radius="md" withBorder w={340} h={380}>
						<Card.Section>
							<Image component={NextImage} src={ravenLaunchImage} height={150} alt="Regal raven taking flight to deliver your message." />
						</Card.Section>
						<Card.Section>
							<Stack justify="space-between" m="sm" h={150}>
								<ScrollArea.Autosize mah={150} mx="auto">
									<Text size="sm" c="dimmed">
										{`Now, let's send a Raven!`}
									</Text>
									<List spacing="md" size="sm" center mt="lg" w={300}>
										<List.Item
											c="dimmed"
											icon={
												<ThemeIcon color="orange" size={24} radius="xl">
													<GrCircleQuestion style={{ width: rem(16), height: rem(16) }} />
												</ThemeIcon>
											}
										>
											{`Give directions for what you want to do.`}
										</List.Item>
										<List.Item
											c="dimmed"
											icon={
												<ThemeIcon color="orange" size={24} radius="xl">
													<FaPeopleArrows style={{ width: rem(16), height: rem(16) }} />
												</ThemeIcon>
											}
										>
											{`Pick the people you want to connect with.`}
										</List.Item>
										<List.Item
											c="dimmed"
											icon={
												<ThemeIcon color="orange" size={24} radius="xl">
													<GiRaven style={{ width: rem(16), height: rem(16) }} />
												</ThemeIcon>
											}
										>
											{`Send your first Raven.`}
										</List.Item>
									</List>
								</ScrollArea.Autosize>
							</Stack>
						</Card.Section>
						<Card.Section>
							<Group grow>
								<Button fullWidth color="yellow" mt="md" radius="md" onClick={handleGetStarted}>
									{`Let's Send a Raven!`}
								</Button>
							</Group>
						</Card.Section>
					</Card>
				</Flip>
			</Center>
		</Group>
	);
}
