import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { msalInstance, loginRequest, graphConfig } from "../lib/msal";
import { AuthenticationResult, InteractionRequiredAuthError, PublicClientApplication } from "@azure/msal-browser";

interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    name: string;
    username: string;
    avatar?: string;
  } | null;
  login: () => Promise<void>;
  logout: () => void;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthContextType["user"]>(null);

  // Initialize auth state
  useEffect(() => {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      setIsAuthenticated(true);
      // Get user details
      getUserDetails();
    }
  }, []);

  const getUserDetails = async () => {
    try {
      const accessToken = await getToken();
      if (accessToken) {
        const response = await fetch(graphConfig.graphMeEndpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser({
            name: userData.displayName,
            username: userData.userPrincipalName,
            avatar: userData.avatar || undefined
          });
        }
      }
    } catch (error) {
      console.error("Error getting user details:", error);
    }
  };

  const login = async (): Promise<void> => {
    try {
      // Login with popup
      const response: AuthenticationResult = await msalInstance.loginPopup(loginRequest);
      if (response.account) {
        msalInstance.setActiveAccount(response.account);
        setIsAuthenticated(true);
        await getUserDetails();
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const logout = (): void => {
    msalInstance.logoutPopup().then(() => {
      setIsAuthenticated(false);
      setUser(null);
    });
  };

  const getToken = async (): Promise<string | null> => {
    const account = msalInstance.getActiveAccount();
    if (!account) {
      // No account found, redirect to login
      return null;
    }

    try {
      // Silent token acquisition
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account
      });
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Fallback to interactive method if silent fails
        try {
          const response = await msalInstance.acquireTokenPopup(loginRequest);
          return response.accessToken;
        } catch (err) {
          console.error("Error acquiring token interactively:", err);
          return null;
        }
      } else {
        console.error("Error acquiring token silently:", error);
        return null;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
