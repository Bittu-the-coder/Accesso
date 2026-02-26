// @ts-nocheck
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const providedPassword = request.headers.get('x-text-password');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Fetch the text share
    const { data, error } = await supabaseAdmin
      .from('text_shares')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Text share not found or expired' },
        { status: 404 }
      );
    }

    const textShare = data as any;

    // Check if expired — delete from DB and return 410
    if (new Date(textShare.expires_at) < new Date()) {
      await supabaseAdmin.from('text_shares').delete().eq('id', textShare.id);

      return NextResponse.json(
        { error: 'This text share has expired' },
        { status: 410 }
      );
    }

    // Check password if it exists
    if (textShare.password_hash) {
      if (!providedPassword) {
        return NextResponse.json(
          { error: 'Password required', requirePassword: true },
          { status: 401 }
        );
      }

      const crypto = await import('crypto-js/sha256');
      const hash = crypto.default(providedPassword).toString();

      if (hash !== textShare.password_hash) {
        return NextResponse.json(
          { error: 'Incorrect password', requirePassword: true },
          { status: 401 }
        );
      }
    }

    // Increment view count
    await supabaseAdmin
      .from('text_shares')
      .update({ view_count: textShare.view_count + 1 })
      .eq('id', textShare.id);

    // Parse entries from JSON content
    let entries: any[] = [];
    try {
      const parsed = JSON.parse(textShare.content);
      entries = Array.isArray(parsed)
        ? parsed
        : [
            {
              id: '0',
              title: textShare.title || 'Untitled',
              content: textShare.content,
              language: textShare.language || 'plaintext',
              createdAt: textShare.created_at,
            },
          ];
    } catch {
      // Legacy plain text — wrap it as a single entry
      if (textShare.content && textShare.content.trim()) {
        entries = [
          {
            id: '0',
            title: textShare.title || 'Untitled',
            content: textShare.content,
            language: textShare.language || 'plaintext',
            createdAt: textShare.created_at,
          },
        ];
      }
    }

    return NextResponse.json({
      code: textShare.code,
      entries,
      view_count: textShare.view_count + 1,
      created_at: textShare.created_at,
      expires_at: textShare.expires_at,
    });
  } catch (error) {
    console.error('Text fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
