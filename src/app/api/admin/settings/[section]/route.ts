import { NextRequest, NextResponse } from 'next/server';
import { getAdminSettingsSection, updateAdminSettingsSection } from '@/lib/adminSettingsService';
import { AdminSettingsSection } from '@/types/settings';

const validSections: AdminSettingsSection[] = [
  'security',
  'notifications',
  'data-audit',
  'system-defaults',
];

function isValidSection(section: string): section is AdminSettingsSection {
  return validSections.includes(section as AdminSettingsSection);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ section: string }> }
) {
  const { section } = await context.params;

  if (!isValidSection(section)) {
    return NextResponse.json({ success: false, error: 'Invalid settings section.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: getAdminSettingsSection(section) });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ section: string }> }
) {
  const { section } = await context.params;

  if (!isValidSection(section)) {
    return NextResponse.json({ success: false, error: 'Invalid settings section.' }, { status: 404 });
  }

  const body = await request.json();
  const updated = updateAdminSettingsSection(section, body ?? {});

  return NextResponse.json({ success: true, data: updated });
}
