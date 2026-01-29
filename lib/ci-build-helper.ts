/**
 * CI Build Helper
 * 
 * This module provides utilities to handle CI build mode
 * where environment variables are not available
 */

export function isCIMode(): boolean {
  return process.env.CI_DUMMY_ENV === '1' || process.env.CI_DUMMY_ENV === 'true';
}

/**
 * Creates a mock API response for CI mode
 */
export function createMockApiResponse(data: any = null) {
  return {
    data: data || [],
    error: null,
    pagination: data ? {
      limit: 20,
      offset: 0,
      total: Array.isArray(data) ? data.length : 0,
      hasMore: false
    } : undefined
  };
}

/**
 * Mock Supabase client for CI mode
 */
export function createMockSupabaseClient() {
  const createMockChain = () => {
    const chain = {
      select: () => chain,
      eq: () => chain,
      order: () => chain,
      limit: () => chain,
      update: () => chain,
      insert: () => chain,
      delete: () => chain,
      single: () => Promise.resolve({ data: [], error: null })
    };
    
    // Make it thenable for direct await
    return new Proxy(chain, {
      get(target, prop) {
        if (prop === 'then') {
          return (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve);
        }
        return target[prop as keyof typeof target];
      }
    });
  };

  return {
    from: () => createMockChain(),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null })
    }
  };
}
