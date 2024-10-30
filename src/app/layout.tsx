import '@mantine/core/styles.css';
import '@gfazioli/mantine-flip/styles.css';
import '@mantine/charts/styles.css';
//import './globals.css';
import React from 'react';
import { MantineProvider } from '@mantine/core';
import { theme } from './theme';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export const metadata = {
	title: 'RavenChat',
	description: 'Conversational surveys for quick feedback',
};

export default function RootLayout({ children }: React.PropsWithChildren) {
	return (
		<ClerkProvider
			appearance={{
				baseTheme: dark,
				variables: { colorPrimary: '#D64D19' },
			}}
		>
			<html lang="en">
				<head>
					<link rel="shortcut icon" href="/favicon.svg" />
					<meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no" />
				</head>
				<body>
					<MantineProvider defaultColorScheme="dark" theme={theme}>
						{children}
					</MantineProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
