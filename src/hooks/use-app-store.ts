import { useAppStore } from '@/stores/app-store';

// Selector hooks for better performance
export const useUser = () => useAppStore((state) => state.user);
export const useOrganizationId = () => useAppStore((state) => state.organizationId);
export const useOrganizations = () => useAppStore((state) => state.organizations);
export const useCustomer = () => useAppStore((state) => state.customer);
export const useActiveProduct = () => useAppStore((state) => state.activeProduct);

// Loading state hooks
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useCustomerLoading = () => useAppStore((state) => state.customerLoading);

// Error state hooks
export const useError = () => useAppStore((state) => state.error);
export const useCustomerError = () => useAppStore((state) => state.customerError);

// Computed value hooks - compute directly in the selector
export const useIsAuthenticated = () => useAppStore((state) => !!state.user && !!state.organizationId);
export const useIsReady = () => useAppStore((state) => !state.isLoading && !!state.user && !!state.organizationId);

// Individual action hooks to avoid object recreation
export const useSetUser = () => useAppStore((state) => state.setUser);
export const useSetOrganizationId = () => useAppStore((state) => state.setOrganizationId);
export const useSetOrganizations = () => useAppStore((state) => state.setOrganizations);
export const useSetCustomer = () => useAppStore((state) => state.setCustomer);
export const useSetLoading = () => useAppStore((state) => state.setLoading);
export const useSetCustomerLoading = () => useAppStore((state) => state.setCustomerLoading);
export const useSetError = () => useAppStore((state) => state.setError);
export const useSetCustomerError = () => useAppStore((state) => state.setCustomerError);
export const useSwitchOrganization = () => useAppStore((state) => state.switchOrganization);
export const useRefreshCustomer = () => useAppStore((state) => state.refreshCustomer);

// Note: Removed useAppState hook to avoid infinite loops
// Use individual hooks instead for better performance