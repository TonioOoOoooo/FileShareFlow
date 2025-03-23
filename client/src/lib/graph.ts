import { graphConfig } from "./msal";

/**
 * Uploads a file to OneDrive and returns the file URL
 */
export async function uploadFileToOneDrive(
  file: File, 
  accessToken: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const endpoint = `${graphConfig.graphUploadEndpoint}${encodeURIComponent(file.name)}:/content`;
  
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    };
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.webUrl) {
              resolve(response.webUrl);
            } else {
              reject(new Error("Failed to get file URL from response"));
            }
          } catch (error) {
            reject(new Error("Failed to parse response"));
          }
        } else {
          let errorMessage = "Upload failed";
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.error ? errorResponse.error.message : errorMessage;
          } catch (e) {
            // Use default error message
          }
          reject(new Error(errorMessage));
        }
      }
    };
    
    xhr.onerror = () => {
      reject(new Error("Network error occurred during upload"));
    };
    
    xhr.open("PUT", endpoint, true);
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

/**
 * Gets the current user's profile information from Microsoft Graph
 */
export async function getUserProfile(accessToken: string) {
  const response = await fetch(graphConfig.graphMeEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return await response.json();
}
