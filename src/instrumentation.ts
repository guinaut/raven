import { registerOTel } from '@vercel/otel';

export function register() {
	registerOTel('okareo-otel');
}
