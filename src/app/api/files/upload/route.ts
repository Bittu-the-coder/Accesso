// @ts-nocheck
import type { Database } from '@/lib/database.types';
import { uploadFileToImageKit } from '@/lib/imagekit';
import { supabaseAdmin } from '@/lib/supabase';
import { calculateExpiry, generateCode, getClientIP } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

type FileShareInsert = Database['public']['Tables']['file_shares']['Insert'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const code = formData.get('code') as string | null;
    const expiresInStr = formData.get('expiresIn') as string | null;
    const passwordRaw = formData.get('password') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to ImageKit
    const { url, fileId } = await uploadFileToImageKit(buffer, file.name);

    // Generate or use existing code
    const rawCode = code || generateCode(8);
    const shareCode = rawCode.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (shareCode.length < 3) {
      return NextResponse.json(
        { error: 'Tunnel ID must be at least 3 characters' },
        { status: 400 }
      );
    }

    const expireHours = expiresInStr ? parseInt(expiresInStr, 10) : 24;
    const expiresAt = calculateExpiry(expireHours);
    const userIp = getClientIP(request);

    // Hash password if provided
    let password_hash = null;
    if (passwordRaw) {
      const crypto = await import('crypto-js/sha256');
      password_hash = crypto.default(passwordRaw).toString();
    }

    // Store file metadata in Supabase
    const insertData: FileShareInsert = {
      code: shareCode,
      filename: fileId,
      original_filename: file.name,
      file_url: url,
      file_size: file.size,
      mime_type: file.type,
      imagekit_file_id: fileId,
      expires_at: expiresAt.toISOString(),
      user_ip: userIp,
      password_hash,
    };

    const { data, error } = await supabaseAdmin
      .from('file_shares')
      .insert(insertData as any)
      .select()
      .single();

    if (error || !data) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save file metadata' },
        { status: 500 }
      );
    }

    const fileData = data as Database['public']['Tables']['file_shares']['Row'];

    return NextResponse.json({
      code: fileData.code,
      filename: fileData.original_filename,
      expires_at: fileData.expires_at,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
