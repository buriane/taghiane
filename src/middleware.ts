import { clerkMiddleware } from '@clerk/nextjs/server';

// Only run on specific paths that need protection
export default clerkMiddleware();

export const config = {
    matcher: [
        '/scan',
        '/api/protected(.*)'
    ],
};