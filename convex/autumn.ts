import { components } from "./_generated/api";
import { Autumn } from "@useautumn/convex";
import { query as convexQuery } from "./_generated/server";

// Debug function to see user identity structure
export const debugUserIdentity = convexQuery({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    return {
      user,
      hasUser: !!user,
      userKeys: user ? Object.keys(user) : [],
    };
  },
});



export const autumn = new Autumn(components.autumn, {
  secretKey: process.env.AUTUMN_SECRET_KEY ?? "",
  identify: async (ctx: any) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      console.log('No user identity found');
      return null;
    }

    let orgId = user.org_id || user.organizationId || user.organization_id;
    
    if (!orgId) {
      console.log('❌ No organization ID found, returning null to prevent error');
      return null;
    }

    console.log('✅ Found organization ID:', orgId);
    
    // For now, use basic user data without organization details
    // Organization details will be fetched on the client side after onboarding
    return {
      customerId: orgId,
      customerData: {
        name: user.name || user.email || 'Unknown',
        email: user.email || 'unknown@example.com',
        organizationId: orgId,
      },
    };
  },
});

/**
 * These exports are required for our react hooks and components
 */

export const {
  track,
  cancel,
  query,
  attach,
  check,
  checkout,
  usage,
  setupPayment,
  createCustomer,
  listProducts,
  billingPortal,
  createReferralCode,
  redeemReferralCode,
  createEntity,
  getEntity,
} = autumn.api();