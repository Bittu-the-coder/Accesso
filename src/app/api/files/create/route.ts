// @ts-nocheck
import { supabaseAdmin } from '@/lib/supabase';
import { calculateExpiry, generateCode } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/files/create
 * Creates a file tunnel with optional password protection.
 * Stores a sentinel record (file_size = 0, filename = '__tunnel_meta__')
 * so password can be enforced even before any files are uploaded.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code: customCode, password, expiresIn } = body;

    let tunnelCode = customCode
      ? customCode.toUpperCase().replace(/[^A-Z0-9]/g, '')
      : generateCode(8);

    if (tunnelCode.length < 3) {
      return NextResponse.json(
        { error: 'Tunnel ID must be at least 3 characters' },
        { status: 400 }
      );
    }
    if (tunnelCode.length > 20) {
      tunnelCode = tunnelCode.slice(0, 20);
    }

    // Check if a tunnel (sentinel) already exists for this code
    const { data: existing } = await supabaseAdmin
      .from('file_shares')
      .select('id, password_hash, expires_at')
      .eq('code', tunnelCode)
      .eq('filename', '__tunnel_meta__')
      .single();

    if (existing) {
      // Tunnel exists — if not expired, return it
      if (new Date(existing.expires_at) > new Date()) {
        return NextResponse.json({
          code: tunnelCode,
          existing: true,
          hasPassword: !!existing.password_hash,
        });
      }
      // Expired — delete old sentinel
      await supabaseAdmin.from('file_shares').delete().eq('id', existing.id);
    }

    // Hash password if provided
    let password_hash = null;
    if (password) {
      const crypto = await import('crypto-js/sha256');
      password_hash = crypto.default(password).toString();
    }

    const expireHours = expiresIn ? parseInt(expiresIn, 10) : 24;
    const expiresAt = calculateExpiry(expireHours);

    // Create sentinel record
    const { data, error } = await supabaseAdmin
      .from('file_shares')
      .insert({
        code: tunnelCode,
        filename: '__tunnel_meta__',
        original_filename: '__tunnel_meta__',
        file_url: 'none',
        file_size: 0,
        mime_type: null,
        imagekit_file_id: null,
        password_hash,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create tunnel. Try a different ID.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      code: tunnelCode,
      expires_at: data.expires_at,
    });
  } catch (error) {
    console.error('File tunnel create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
