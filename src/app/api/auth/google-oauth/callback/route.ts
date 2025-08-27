"use server";

import { getWorkOS } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const workos = getWorkOS();
  const code = new URL(request.url).searchParams.get('code') || '';

  let response;

  try {
    response = await workos.userManagement.authenticateWithCode({
      clientId: process.env.WORKOS_CLIENT_ID || '',
      code,
    });
  } catch (error) {
    response = error;
  }

  if (response) {
    redirect(
      `http://localhost:3000/using-your-own-ui/sign-in/google-oauth?response=${JSON.stringify(
        response
      )}`
    );
  }
}