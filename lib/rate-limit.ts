import { NextRequest } from 'next/server';

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Store request counts in memory
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

/**
 * Rate limiting middleware for API routes
 * @param request The incoming request
 * @returns RateLimitResult indicating if the request should be allowed
 */
export async function rateLimit(request: NextRequest): Promise<RateLimitResult> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
  const now = Date.now();
  
  // Get or initialize the request count for this IP
  const requestData = requestCounts.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  // Check if the window has expired
  if (now > requestData.resetTime) {
    requestData.count = 0;
    requestData.resetTime = now + RATE_LIMIT_WINDOW;
  }
  
  // Increment the request count
  requestData.count++;
  requestCounts.set(ip, requestData);
  
  // Calculate remaining requests and reset time
  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - requestData.count);
  const reset = Math.ceil((requestData.resetTime - now) / 1000);
  
  return {
    success: requestData.count <= MAX_REQUESTS_PER_WINDOW,
    limit: MAX_REQUESTS_PER_WINDOW,
    remaining,
    reset
  };
}

// Clean up old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of Array.from(requestCounts.entries())) {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000); 