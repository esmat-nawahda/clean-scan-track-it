
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
    invoke: (functionName: string, options?: { body?: any }) => 
      Promise.resolve({ data: null, error: null })
  }
};
