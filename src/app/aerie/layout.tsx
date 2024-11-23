'use client';

import { useEffect } from 'react';
import { AppShell } from '@mantine/core';
import { AerieFooter } from '@/components/commons';
import { useAuth, useUser } from '@clerk/nextjs';
import { usePostHog } from 'posthog-js/react';

export default function AppLayout({ children }: React.PropsWithChildren) {
	const posthog = usePostHog();
	const { isSignedIn, userId } = useAuth();
	const { user } = useUser();

	useEffect(() => {
		if (isSignedIn && userId && user && !posthog._isIdentified()) {
			posthog.identify(userId, {
				email: user.primaryEmailAddress?.emailAddress,
				username: user.username,
			});
		}
	}, [posthog, user, isSignedIn, userId]);

	return (
		<AppShell withBorder={true}>
			<AppShell.Main mb={50}>
				{children}
				<AerieFooter />
			</AppShell.Main>
		</AppShell>
	);
}
