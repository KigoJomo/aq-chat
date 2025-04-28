import { NextResponse } from 'next/server';

interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

/**
 * Health check endpoint to verify API availability
 * @route GET /api/health
 * @returns {Promise<NextResponse>} Health status response
 */
export async function GET(): Promise<NextResponse<HealthResponse>> {
  try {
    const healthData: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { status: 'error', timestamp: new Date().toISOString(), version: 'unknown' },
      { status: 500 }
    );
  }
}