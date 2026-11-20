import { NextResponse } from 'next/server';
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        framework: 'Next.js 16 (App Router)',
        orm: 'Prisma',
        database: 'MySQL',
        timestamp: new Date().toISOString(),
    });
}
