// theme.ts
import { createTheme, DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';

const themeOverride = createTheme({
	fontFamily: 'Open Sans, sans-serif',
	primaryColor: 'orange',
	defaultRadius: 5,
	defaultGradient: {
		from: 'orange',
		to: 'yellow',
		deg: 45,
	},
});

export const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);
