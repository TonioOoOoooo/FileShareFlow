import { PublicClientApplication, LogLevel, AccountInfo } from "@azure/msal-browser";

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/common`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          default:
            break;
        }
      },
      logLevel: LogLevel.Info
    }
  }
};

// Microsoft Graph scopes
export const loginRequest = {
  scopes: [
    "User.Read",
    "Files.ReadWrite",
    "Files.ReadWrite.All",
  ]
};

// Microsoft Graph endpoints
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphUploadEndpoint: "https://graph.microsoft.com/v1.0/me/drive/root:/",
};

// Create and initialize MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Call handleRedirectPromise in case this is a redirect from a login
msalInstance.initialize().then(() => {
  // Handle redirect promise to capture response from auth redirect
  msalInstance.handleRedirectPromise().catch(error => {
    console.error("Error handling redirect:", error);
  });
});
