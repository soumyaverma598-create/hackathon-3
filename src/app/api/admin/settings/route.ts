import { NextResponse } from 'next/server';
import { getAdminSettings } from '@/lib/adminSettingsService';

export async function GET() {
  return NextResponse.json({ success: true, data: getAdminSettings() });
}
