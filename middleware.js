import { NextResponse } from 'next/server';

// Define allowed routes for each role with dashboard as the default route
const roleBasedRoutes = {
  ADMIN: ['/admin/dashboard', '/admin/manage-users', '/admin/reports', '/admin/settings'],
  MENTOR: ['/mentor/dashboard', '/mentor/schedule', '/mentor/tasks', '/mentor/support', '/mentor/manage-slots'],
  STUDENT: ['/student/dashboard', '/student/lectures', '/student/assignments', '/student/notifications',, '/student/slot-booking'],
  IA: ['/ia/dashboard', '/ia/performance'],
  LEADERSHIP: ['/leadership/dashboard', '/leadership/analytics', '/leadership/reports'],
  EC: ['/ec/dashboard', '/ec/events'],
};

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  console.log('Middleware triggered for:', pathname);

  // Allow access to public routes, static assets, or API routes
  if (
    pathname === '/' ||
    pathname === '/select-role' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // Retrieve the JWT token and selected role from cookies
  const token = req.cookies.get('token')?.value;
  console.log('Token:', token);
  let selectedRole = req.cookies.get('selectedRole')?.value;
  console.log('Selected Role:', selectedRole);

  // If no token exists, redirect to the login page
  if (!token) {
    console.log('No token found. Redirecting to /');
    return NextResponse.redirect(new URL('/', req.url));
  }

  try {
    // Fetch user status and roles from the backend
    const response = await fetch('https://masai-connect-backend-w28f.vercel.app/api/get-user-status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.log('User status fetch failed. Redirecting to /');
      return NextResponse.redirect(new URL('/', req.url));
    }

    const { status, roles } = await response.json();
    console.log('Fetched user status and roles:', status, roles);

    // Handle users with 'PENDING' status
    if (status === 'PENDING') {
      if (pathname.startsWith('/pending-approval') || pathname === '/') {
        console.log('User status is PENDING. Allowing access to:', pathname);
        return NextResponse.next();
      }
      console.log('User status is PENDING. Redirecting to /pending-approval');
      return NextResponse.redirect(new URL('/pending-approval', req.url));
    }

    // Handle role selection and access for ACTIVE users
    if (status === 'ACTIVE') {
      if (roles.length > 1) {
        // Multiple roles: Handle role selection
        if (!selectedRole) {
          console.log('No selected role found. Redirecting to /select-role.');
          if (pathname !== '/select-role') {
            return NextResponse.redirect(new URL('/select-role', req.url));
          }
          return NextResponse.next();
        }

        // Validate access to allowed paths for the selected role
        const allowedPaths = roleBasedRoutes[selectedRole] || [];
        const isAllowed = allowedPaths.some((allowedPath) => pathname.startsWith(allowedPath));

        if (!isAllowed) {
          console.log(`User with selected role ${selectedRole} not allowed on ${pathname}. Redirecting to their dashboard.`);
          return NextResponse.redirect(new URL(allowedPaths[0] || '/dashboard', req.url));
        }

        console.log('User with multiple roles is ACTIVE and allowed. Proceeding to:', pathname);
        return NextResponse.next();

      } else if (roles.length === 1) {
        // Single role: Automatically direct the user to their role's dashboard
        const singleRole = roles[0];
        const allowedPaths = roleBasedRoutes[singleRole] || [];

        // If no `selectedRole` cookie is set, set it to the single role
        if (!selectedRole) {
          console.log(`Setting selected role to ${singleRole}.`);
          const response = NextResponse.next();
          response.cookies.set('selectedRole', singleRole, { path: '/' });
          return response;
        }

        // Ensure the user has access to allowed paths for their role
        if (!allowedPaths.some((allowedPath) => pathname.startsWith(allowedPath))) {
          console.log(`User with role ${singleRole} is not on an allowed path. Redirecting to their dashboard.`);
          return NextResponse.redirect(new URL(allowedPaths[0] || '/dashboard', req.url));
        }

        console.log('User with single role is ACTIVE and allowed. Proceeding to:', pathname);
        return NextResponse.next();
      }
    }

  } catch (error) {
    console.error('Error in middleware fetch:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Default response if no conditions are met
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*', // Apply middleware to all routes
};