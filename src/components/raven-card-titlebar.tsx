import { useState, useEffect } from 'react';
import { Card, Text, Group, Badge, Stack, Collapse, Tooltip, ActionIcon, Anchor, CopyButton, Modal } from '@mantine/core';
import { MdPublic } from 'react-icons/md';
import { BsPersonHeart } from 'react-icons/bs';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Raven } from '@prisma/client'; // Assuming you have the Prisma types available
import Markdown from 'react-markdown';
import { RavenState, ExtendedRaven } from './raven-card';

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
	const baseURL: string = 'http://localhost:3000'; // Change this to your actual base URL
	const { raven, controlState } = props;
	const [shortlink, setShortLink] = useState<string | null>(null);
	const [opened, { toggle }] = useDisclosure(false);

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
		<Card.Section>
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
						<Badge color="yellow" pt={0} maw={30} m={0} p={0}>
							<CopyButton value={`${baseURL}/raven/${shortlink}`} timeout={2000}>
								{({ copied, copy }) => (
									<Tooltip label={copied ? 'Copied' : 'Copy Raven Link'} withArrow position="right">
										<ActionIcon size="md" variant="transparent" color="white" aria-label="Public Raven" onClick={copy}>
											<MdPublic
												style={{
													width: '70%',
													height: '70%',
												}}
												stroke="1.5"
											/>
										</ActionIcon>
									</Tooltip>
								)}
							</CopyButton>
						</Badge>
					</>
				)}

				<RavenStateBadge controlState={controlState} raven={raven} />
			</Group>
			{controlState.type === 'PRIVATE' && raven && raven.recipients && raven.recipients.length > 0 && (
				<Collapse in={opened}>
					<Stack gap="xs" p={0} m="sm">
						{raven.recipients &&
							raven.recipients.map((r) => (
								<Group key={`recipient-${r.id}`}>
									<Text size="xs" ta="right">
										{(r.private_email as string).split('@')[0]}
									</Text>
									<Text size="xs" ta="left" fw={900}>
										<Anchor href={`${baseURL}/raven/${r.short_link}`} target="_raven" underline="hover">
											{`https://ravenchat.io/raven/${r.short_link}`}
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
