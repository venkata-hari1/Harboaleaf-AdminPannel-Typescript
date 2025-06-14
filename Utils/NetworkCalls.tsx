// Utils/NetworkCalls.ts

// This utility function is designed to handle API calls consistently.
// It automatically manages the 'token' header and sets 'Content-Type'
// based on the body type (JSON or FormData).

interface NetworkCallResult<T = any, E = any> {
  response: T | null;
  error: {
    status?: number; // HTTP status code (e.g., 400, 500)
    message: string; // User-friendly error message
    data?: E; // Raw error data from the API (optional)
  } | null;
}

const networkCall = async <T = any, E = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: FormData | object | string, // Body can be FormData, plain object (for JSON), or string
): Promise<NetworkCallResult<T, E>> => {
  const options: RequestInit = {
    method: method,
    // credentials: 'include' // Use if you need to send cookies/credentials with cross-origin requests
  };

  // Initialize headers. 'Accept' is generally good to always request JSON.
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  // --- AUTOMATICALLY ADD AUTHENTICATION TOKEN ---
  const authToken = localStorage.getItem('token');
  if (authToken) {
    // Your backend expects a custom 'token' header
    (headers as Record<string, string>)['token'] = authToken;
  } else {
    // This console.warn will help you debug if the token isn't found in localStorage
    console.warn(`NetworkCall: No authentication token found in localStorage for request to ${url}`);
    // Optionally, if ALL your API calls absolutely require a token, you could reject here:
    // return { response: null, error: { message: "Authentication required: No token found." } };
  }

  // --- HANDLE BODY AND CONTENT-TYPE ---
  if (body) {
    if (body instanceof FormData) {
      options.body = body;
      // IMPORTANT: When sending FormData, DO NOT manually set Content-Type header.
      // 'fetch' automatically sets 'multipart/form-data' with the correct boundary.
      delete (headers as Record<string, string>)['Content-Type']; // Ensure it's not present if it was implicitly added
    } else if (typeof body === 'object') {
      options.body = JSON.stringify(body);
      (headers as Record<string, string>)['Content-Type'] = 'application/json'; // Set for JSON bodies
    } else {
      // For string bodies (e.g., plain text), default to text/plain if not specified
      options.body = body;
      (headers as Record<string, string>)['Content-Type'] = (headers as Record<string, string>)['Content-Type'] || 'text/plain';
    }
  } else if (['POST', 'PUT', 'PATCH'].includes(method)) {
    // If it's a method that typically has a body but none was provided,
    // still set Content-Type to application/json as a common default.
    (headers as Record<string, string>)['Content-Type'] = (headers as Record<string, string>)['Content-Type'] || 'application/json';
  }

  options.headers = headers; // Apply all prepared headers

  try {
    const response = await fetch(url, options);

    let responseData: any = null;
    try {
      // Attempt to parse JSON response. Many APIs return JSON even on error statuses.
      responseData = await response.json();
    } catch (parseError) {
      // If parsing fails (e.g., empty response, non-JSON response),
      // provide a fallback message.
      responseData = { message: response.statusText || 'No response body or non-JSON response' };
    }

    if (!response.ok) {
      // If response.ok is false, it's an HTTP error (4xx, 5xx)
      console.error(`API Error (${response.status}) from ${url}:`, responseData);
      return {
        response: null,
        error: {
          status: response.status,
          message: responseData.message || responseData.error || `Request failed with status ${response.status}`,
          data: responseData as E,
        },
      };
    }

    // If response.ok is true, it's a successful response (2xx)
    return { response: responseData as T, error: null };

  } catch (err: any) {
    // This catch block handles actual network errors (e.g., no internet, CORS issues, DNS errors)
    console.error("Network Call Error:", err);
    return {
      response: null,
      error: {
        status: 0, // Indicate a network-level error, not an HTTP status
        message: err.message || "Network request failed. Please check your internet connection.",
        data: null,
      },
    };
  }
};

export default networkCall;