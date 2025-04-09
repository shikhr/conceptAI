import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized: Authentication required' },
      { status: 401 }
    );
  }

  // Add the user info to the request for use in the handler
  const requestWithAuth = Object.assign(req, { user: token });
  return handler(requestWithAuth);
}
