import { handleAuth } from '@workos-inc/authkit-nextjs';

export const GET = handleAuth({
    baseURL: 'http://localhost:3000',
    returnPathname: '/workspace',
});
