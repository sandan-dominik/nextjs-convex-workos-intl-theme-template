import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
}

interface Organization {
  id: string;
  name: string;
  role?: Record<string, unknown>;
}

interface Product {
  id: string;
  name: string;
  status: string;
}

interface Customer {
  id: string | null;
  products?: Product[];
}

interface AppState {
  // User data
  user: User | null;
  organizationId: string | null;
  organizations: Organization[];
  
  // Subscription data
  customer: Customer | null;
  activeProduct: Product | null;
  
  // Loading states
  isLoading: boolean;
  customerLoading: boolean;
  
  // Error states
  error: string | null;
  customerError: unknown;
  
  // Actions
  setUser: (user: User | null) => void;
  setOrganizationId: (id: string | null) => void;
  setOrganizations: (organizations: Organization[]) => void;
  setCustomer: (customer: Customer | null) => void;
  setActiveProduct: (product: Product | null) => void;
  setLoading: (loading: boolean) => void;
  setCustomerLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCustomerError: (error: unknown) => void;
  
  // Actions
  switchOrganization: (orgId: string) => void;
  refreshCustomer: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        organizationId: null,
        organizations: [],
        customer: null,
        activeProduct: null,
        isLoading: true,
        customerLoading: false,
        error: null,
        customerError: null,

        // Actions
        setUser: (user) => set({ user }),
        setOrganizationId: (organizationId) => set({ organizationId }),
        setOrganizations: (organizations) => set({ organizations }),
        setCustomer: (customer) => {
          const activeProduct = customer?.products?.find(p => p.status === "active") || null;
          set({ customer, activeProduct });
        },
        setActiveProduct: (activeProduct) => set({ activeProduct }),
        setLoading: (isLoading) => set({ isLoading }),
        setCustomerLoading: (customerLoading) => set({ customerLoading }),
        setError: (error) => set({ error }),
        setCustomerError: (customerError) => set({ customerError }),

        // Actions
        switchOrganization: (orgId) => {
          set({ organizationId: orgId });
          // Trigger organization switch
          window.location.href = `/api/auth/switch?organizationId=${orgId}&returnTo=${encodeURIComponent(window.location.pathname)}`;
        },
        refreshCustomer: () => {
          // This will be called by components that need to refresh customer data
          set({ customerLoading: true, customerError: null });
        },
      }),
      {
        name: 'app-store',
        // Persist user, organization, and customer data
        partialize: (state) => ({
          user: state.user,
          organizationId: state.organizationId,
          organizations: state.organizations,
          customer: state.customer,
          activeProduct: state.activeProduct,
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);