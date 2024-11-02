import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const isAPIRoute = createRouteMatcher(['/api(.*)']);
const isRavenChat = createRouteMatcher(['/raven(.*)']);
const isOnboardingRoute = createRouteMatcher(['/onboarding']);
const isUnsubscribe = createRouteMatcher(['/unsubscribe']);
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
	const { userId, sessionClaims, redirectToSignIn } = await auth();

	// Users visiting /raven should be able to view the page without being signed in
	if (isRavenChat(req)) {
		return NextResponse.next();
	}

	// For users visiting /onboarding, don't try to redirect
	if (isUnsubscribe(req)) {
		return NextResponse.next();
	}

	// For users visiting /onboarding, don't try to redirect
	if (userId && isOnboardingRoute(req)) {
		return NextResponse.next();
	}
	// APIs need to self secure
	if (isAPIRoute(req)) {
		return NextResponse.next();
	}

	// If the user isn't signed in and the route is private, redirect to sign-in
	if (!userId && !isPublicRoute(req) && !isRavenChat(req)) return redirectToSignIn({ returnBackUrl: req.url });

	if (userId && !sessionClaims?.metadata?.onboardingComplete) {
		const onboardingUrl = new URL('/onboarding', req.url);
		return NextResponse.redirect(onboardingUrl);
	}

	// If the user is logged in and the route is protected, let them view.
	if (userId && !isPublicRoute(req)) return NextResponse.next();

	/*
	if (!isPublicRoute(req)) {
		await auth.protect();
	}
	*/
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
	],
};
/*,
		// Always run for API routes
		'/(api|trpc)/v1(.*)',
		*/

/*
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const isOnboardingRoute = createRouteMatcher(['/onboarding']);
const isPublicRoute = createRouteMatcher(['/raven']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
	const { userId, sessionClaims, redirectToSignIn } = await auth();

	// For users visiting /onboarding, don't try to redirect
	if (userId && isOnboardingRoute(req)) {
		return NextResponse.next();
	}

	// If the user isn't signed in and the route is private, redirect to sign-in
	if (!userId && !isPublicRoute(req)) return redirectToSignIn({ returnBackUrl: req.url });

	// Catch users who do not have `onboardingComplete: true` in their publicMetadata
	// Redirect them to the /onboading route to complete onboarding
	if (userId && !sessionClaims?.metadata?.onboardingComplete) {
		const onboardingUrl = new URL('/onboarding', req.url);
		return NextResponse.redirect(onboardingUrl);
	}

	// If the user is logged in and the route is protected, let them view.
	if (userId && !isPublicRoute(req)) return NextResponse.next();
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',
	],
};
*/
