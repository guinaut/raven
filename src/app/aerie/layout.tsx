'use client';

import { AppShell } from '@mantine/core';
import { AerieFooter } from '@/components/commons';

export default function AppLayout({ children }: React.PropsWithChildren) {
	return (
		<AppShell withBorder={true}>
			<AppShell.Main mb={50}>
				{children}
				<AerieFooter />
			</AppShell.Main>
		</AppShell>
	);
}
