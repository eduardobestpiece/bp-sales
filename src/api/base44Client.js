import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication optional
export const base44 = createClient({
  appId: "684f63a79ad475ecf8c21735", 
  requiresAuth: false // Make authentication optional
});
