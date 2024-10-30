'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { addUser } from '../api/v1/account/onboarding/route';
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
		const user = await addUser({ name, email });
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
