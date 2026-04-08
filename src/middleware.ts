import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('sasms_token')?.value;
    const role = request.cookies.get('sasms_role')?.value;
    const { pathname } = request.nextUrl;

    const ROLE_DASHBOARDS: Record<string, string> = {
        STUDENT: '/student',
        SUPER_ADMIN: '/superadmin',
        APPLICANT: '/applicant/dashboard',
        ADMIN: '/admin'
    };

    // Auth routes (Login/Register)
    const isAuthRoute = pathname === '/login' || pathname === '/applicant/register';

    if (isAuthRoute) {
        if (token && role) {
            const dashboard = ROLE_DASHBOARDS[role] || '/';
            return NextResponse.redirect(new URL(dashboard, request.url));
        }
        return NextResponse.next();
    }

    // Role-based route definitions — strict separation: each role only accesses its own prefix
    const routeRoleMap = [
        { prefix: '/superadmin', allowedRoles: ['SUPER_ADMIN'] },
        { prefix: '/admin', allowedRoles: ['ADMIN'] },
        { prefix: '/student', allowedRoles: ['STUDENT'] },
        { prefix: '/applicant', allowedRoles: ['APPLICANT'] }
    ];

    const matchedRoute = routeRoleMap.find(r => pathname.startsWith(r.prefix));

    if (matchedRoute) {
        if (!token || !role) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        if (!matchedRoute.allowedRoles.includes(role)) {
            // Unathorized access attempt, redirect to their proper dashboard
            const correctPath = ROLE_DASHBOARDS[role] || '/login';
            return NextResponse.redirect(new URL(correctPath, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Protect all role-based prefixes
    matcher: [
        '/superadmin/:path*',
        '/admin/:path*',
        '/student/:path*',
        '/applicant/:path*',
        '/login'
    ],
};

