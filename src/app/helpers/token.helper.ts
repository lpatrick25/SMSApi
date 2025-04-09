import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
  [key: string]: any;
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    return decoded.exp < now; // Check if token is expired
  } catch (e) {
    console.error("Error decoding token:", e); // Handle any errors (e.g., invalid token format)
    return true; // If there's an error (e.g., invalid token), consider it expired
  }
}
