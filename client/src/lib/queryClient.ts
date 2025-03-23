import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { msalInstance } from "./msal";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Get the user ID from the active MSAL account
function getUserId(): string | null {
  const account = msalInstance.getActiveAccount();
  return account ? account.username : null;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const userId = getUserId();
  
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
  };
  
  // Add user ID header if available
  if (userId) {
    headers["X-User-Id"] = userId;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const userId = getUserId();
    const headers: Record<string, string> = {};
    
    // Add user ID header if available
    if (userId) {
      headers["X-User-Id"] = userId;
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
