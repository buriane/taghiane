import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define which routes are protected
const isProtectedRoute = createRouteMatcher([
    '/scan(.*)',
])

export default clerkMiddleware(async (auth, req) => {
    // Protect the route if it matches our protected routes
    if (isProtectedRoute(req)) {
        const { userId } = await auth();

        if (!userId) {
            // Redirect to home with auth parameter to trigger login modal
            const homeUrl = new URL('/', req.url);
            homeUrl.searchParams.set('auth', 'required');
            return NextResponse.redirect(homeUrl);
        }
    }

    return NextResponse.next();
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}