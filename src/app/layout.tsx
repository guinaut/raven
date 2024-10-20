import type { Metadata } from "next";
import localFont from "next/font/local";

import "@mantine/core/styles.css";
import React from "react";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";

import { theme } from "./theme";

export const metadata = {
  title: "RavenChat",
  description: "Conversational surveys for quick feedback",
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider defaultColorScheme="dark" theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}

