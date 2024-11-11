import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Text, Group, Badge, Stack, Collapse, Tooltip, ActionIcon, Anchor, CopyButton, Modal } from '@mantine/core';
import { MdPublic } from 'react-icons/md';
import { BsPersonHeart, BsGear } from 'react-icons/bs';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Raven, Recipient, Contact } from '@prisma/client'; // Assuming you have the Prisma types available
import Markdown from 'react-markdown';
import { RavenState, ExtendedRaven } from './raven-card';

interface ExtendedRecipient extends Recipient {
	contact: Contact;
}

const RavenStateBadge = (props: { controlState: RavenState; raven: Raven }) => {
	const [opened, { open, close }] = useDisclosure(false);
	const isMobile = useMediaQuery('(max-width: 50em)');
	const { controlState, raven } = props;
	return (
		<>
			<Modal
				opened={opened}
				onClose={close}
				title={`This is the Raven's Plan`}
				fullScreen={isMobile}
				transitionProps={{ transition: 'fade', duration: 200 }}
			>
				<Markdown>{raven.plan}</Markdown>
			</Modal>

			<Badge maw={65} pt={2} color={controlState.status_color} onClick={open}>
				{controlState.status}
			</Badge>
		</>
	);
};

const RavenCardTitleBar = (props: { raven: ExtendedRaven; controlState: RavenState }) => {
	const baseURL: string = `${process.env.NEXT_PUBLIC_RAVENCHAT_AERIE_URL}`; // Change this to your actual base URL
	const router = useRouter();
	const { raven, controlState } = props;
	const [shortlink, setShortLink] = useState<string | null>(null);
	const [opened, { toggle }] = useDisclosure(false);

	const handleEditRaven = () => {
		router.push(`/aerie/update/${raven.id}`);
	};

	useEffect(() => {
		if (raven) {
			if (raven.send_type.toUpperCase() === 'PUBLIC') {
				if (raven.recipients && raven.recipients.length > 0) {
					setShortLink(raven.recipients[0].short_link);
				}
			}
		}
	}, [raven]);

	return (
		<Card.Section bg="gray.9">
			<Group m="sm" p={0} gap={5} grow preventGrowOverflow>
				<Group grow>
					<Text fw={500}>{raven.topic}</Text>
				</Group>
				{controlState.type === 'PRIVATE' ? (
					<>
						<Tooltip label="Private Raven">
							<Badge
								color="yellow"
								pt={0}
								maw={50}
								m={0}
								p={0}
								leftSection={
									<ActionIcon size="md" variant="transparent" color="white" aria-label="Private Raven" m={0} p={0} onClick={toggle}>
										<BsPersonHeart style={{ width: '70%', height: '70%' }} stroke="1.5" />
									</ActionIcon>
								}
							>
								<Text fw={900} size="sm" m={0} p={0}>
									{raven.recipients ? raven.recipients.length : 0}
								</Text>
							</Badge>
						</Tooltip>
					</>
				) : (
					<>
						{controlState.status != 'Ready' ? (
							<>
								<CopyButton value={`${baseURL}/raven/${shortlink}`} timeout={2000}>
									{({ copied, copy }) => (
										<Tooltip label={copied ? 'Copied' : 'Copy Raven Link'} withArrow position="right">
											<Badge
												color="yellow"
												pt={0}
												maw={50}
												m={0}
												p={0}
												onClick={copy}
												leftSection={
													<ActionIcon size="md" variant="transparent" color="white" aria-label="Public Raven" m={0} p={0}>
														<MdPublic style={{ width: '70%', height: '70%' }} stroke="1.5" />
													</ActionIcon>
												}
											>
												<Text fw={900} size="sm" m={0} p={0}>
													{raven.recipients ? raven.recipients.length - 1 : 0}
												</Text>
											</Badge>
										</Tooltip>
									)}
								</CopyButton>
							</>
						) : (
							<>
								<Badge
									color="yellow"
									pt={0}
									pl={4}
									maw={22}
									m={0}
									p={0}
									leftSection={
										<ActionIcon size="md" variant="transparent" color="white" aria-label="Public Raven" m={0} p={0} onClick={toggle}>
											<MdPublic style={{ width: '70%', height: '70%' }} stroke="1.5" />
										</ActionIcon>
									}
								></Badge>
							</>
						)}
					</>
				)}

				<RavenStateBadge controlState={controlState} raven={raven} />

				{controlState.status === 'Ready' && (
					<Badge
						color="gray.5"
						pt={0}
						maw={22}
						m={0}
						p={0}
						pl={6}
						leftSection={
							<ActionIcon size="md" variant="transparent" color="white.5" aria-label="Edit Raven" m={0} p={0} onClick={handleEditRaven}>
								<BsGear style={{ width: '60%', height: '60%' }} stroke="1.5" />
							</ActionIcon>
						}
					></Badge>
				)}
			</Group>
			{controlState.type === 'PRIVATE' && raven && raven.recipients && raven.recipients.length > 0 && (
				<Collapse in={opened}>
					<Stack gap="xs" p={0} m="sm">
						{raven.recipients &&
							raven.recipients.map((r) => (
								<Group key={`recipient-${r.id}`}>
									<Text size="xs" ta="right">
										{(r as ExtendedRecipient).contact ? (r as ExtendedRecipient).contact.name : (r.private_email as string).split('@')[0]}
									</Text>
									<Text size="xs" ta="left" fw={900}>
										<Anchor href={`${baseURL}/raven/${r.short_link}`} target="_raven" underline="hover">
											{r.private_email}
										</Anchor>
									</Text>
								</Group>
							))}
					</Stack>
				</Collapse>
			)}
		</Card.Section>
	);
};

export { RavenCardTitleBar };
