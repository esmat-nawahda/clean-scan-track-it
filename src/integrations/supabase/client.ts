
// This file is kept as a placeholder for potential future implementation.
// Supabase integration has been removed as requested.

export const supabase = {
  // Dummy client implementation that does nothing
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: () => Promise.resolve({ data: { session: null } }),
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (field: string, value: any) => Promise.resolve({ data: [], error: null }),
      in: (field: string, values: any[]) => Promise.resolve({ data: [], error: null }),
      order: (column: string, options: any) => Promise.resolve({ data: [], error: null }),
      data: [],
      error: null
    }),
    insert: (data: any) => ({
      select: (columns?: string) => ({
        single: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
    update: (data: any) => ({
      eq: (field: string, value: any) => Promise.resolve({ data: null, error: null }),
    }),
  }),
  functions: {
    // Always return success for room creation operations
    invoke: (functionName: string, options?: { body?: any }) => {
      if (functionName === 'check-subscription') {
        // Return a mock subscription with unlimited rooms
        return Promise.resolve({ 
          data: {
            has_subscription: true,
            is_active: true,
            can_create_rooms: true,
            rooms_count: 3,
            max_rooms: 999, // High number to allow unlimited room creation
            rooms_remaining: 996,
            subscription: {
              status: 'active',
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              plan: {
                name: 'Demo Plan',
                price: 0,
                features: ['Unlimited QR rooms', 'Basic cleaning checklists', 'Email support']
              }
            }
          }, 
          error: null 
        });
      }
      
      // For other function calls, return generic success
      return Promise.resolve({ data: null, error: null });
    }
  }
};
