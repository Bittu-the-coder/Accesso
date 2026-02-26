// @ts-nocheck
import type { Database } from '@/lib/database.types';
import { deleteFileFromImageKit } from '@/lib/imagekit';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

type FileShare = Database['public']['Tables']['file_shares']['Row'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const providedPassword = request.headers.get('x-file-password');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const upperCode = code.toUpperCase();

    // Fetch all files with this code
    const { data, error } = await supabaseAdmin
      .from('file_shares')
      .select('*')
      .eq('code', upperCode);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch files' },
        { status: 500 }
      );
    }

    // No files yet — but check for a sentinel (tunnel-level password)
    if (!data || data.length === 0) {
      return NextResponse.json({
        code: upperCode,
        files: [],
      });
    }

    // Separate sentinel (tunnel metadata) from actual files
    const allFiles = data as FileShare[];
    const sentinel = allFiles.find(f => f.filename === '__tunnel_meta__');
    const actualFiles = allFiles.filter(f => f.filename !== '__tunnel_meta__');

    // Check password on sentinel OR on any file with password_hash
    const passwordSource = sentinel || actualFiles.find(f => f.password_hash);
    if (passwordSource?.password_hash) {
      if (!providedPassword) {
        return NextResponse.json(
          { error: 'Password required', requirePassword: true },
          { status: 401 }
        );
      }

      const crypto = await import('crypto-js/sha256');
      const hash = crypto.default(providedPassword).toString();

      if (hash !== passwordSource.password_hash) {
        return NextResponse.json(
          { error: 'Incorrect password', requirePassword: true },
          { status: 401 }
        );
      }
    }

    // Filter out expired files and delete them from ImageKit + Supabase
    const now = new Date();
    const validFiles: FileShare[] = [];
    const expiredFiles: FileShare[] = [];

    for (const file of actualFiles) {
      if (new Date(file.expires_at) > now) {
        validFiles.push(file);
      } else {
        expiredFiles.push(file);
      }
    }

    // Clean up expired files in background (don't block the response)
    if (expiredFiles.length > 0) {
      (async () => {
        for (const file of expiredFiles) {
          try {
            if (file.imagekit_file_id) {
              await deleteFileFromImageKit(file.imagekit_file_id);
            }
          } catch (err) {
            console.error(
              `Failed to delete ImageKit file ${file.imagekit_file_id}:`,
              err
            );
          }
        }

        const expiredIds = expiredFiles.map(f => f.id);
        await supabaseAdmin.from('file_shares').delete().in('id', expiredIds);
      })();
    }

    return NextResponse.json({
      code: upperCode,
      files: validFiles.map(file => ({
        id: file.id,
        filename: file.filename,
        original_filename: file.original_filename,
        file_url: file.file_url,
        file_size: file.file_size,
        mime_type: file.mime_type,
        download_count: file.download_count,
        created_at: file.created_at,
        expires_at: file.expires_at,
      })),
    });
  } catch (error) {
    console.error('Files fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
