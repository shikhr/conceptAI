import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function withOptionalAuth(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const token = await getToken({ req });

  // Add the user info to the request if available, otherwise mark as guest
  const requestWithAuth = Object.assign(req, {
    user: token || { isGuest: true },
  });

  return handler(requestWithAuth);
}
