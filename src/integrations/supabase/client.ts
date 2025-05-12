
// This file is kept as a placeholder for potential future implementation.
// Supabase integration has been removed as requested.

export const supabase = {
  // Dummy client implementation that does nothing
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: () => Promise.resolve({ data: { session: null } }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({ data: [], error: null }),
      in: () => ({ data: [], error: null }),
    }),
    insert: () => ({
      select: () => ({
        single: () => ({ data: null, error: null }),
      }),
    }),
    update: () => ({
      eq: () => ({ data: null, error: null }),
    }),
  })
};
