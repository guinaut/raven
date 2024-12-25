/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	experimental: {
		optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	experimental: {
		instrumentationHook: true,
	},
};

export default nextConfig;
