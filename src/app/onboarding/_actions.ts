'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import prisma from '../../lib/prisma';

interface UserData {
	name: string | null;
	email: string;
}

export const completeOnboarding = async (userData: UserData) => {
	const { userId } = await auth();

	if (!userId) {
		return { message: 'No Logged In User' };
	}

	const { name, email } = userData;
	try {
		if (!name || !email) {
			return { message: 'Invalid passed user' };
		}
		const user = await prisma.user.create({
			data: {
				name: name,
				email: email,
			},
		});

		if (user) {
			const client = await clerkClient();
			await client.users.updateUser(userId, {
				publicMetadata: {
					onboardingComplete: true,
				},
			});
			return { message: 'Success' };
		} else {
			return { error: 'There was an error creating the user.' };
		}
	} catch (err) {
		console.log(err);
		return { error: 'There was an error updating the user metadata.' };
	}
};
