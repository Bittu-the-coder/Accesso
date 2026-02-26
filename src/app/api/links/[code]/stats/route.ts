// @ts-nocheck
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Fetch the short URL
    const { data, error } = await supabaseAdmin
      .from('short_urls')
      .select('*')
      .or(`short_code.eq.${code},custom_alias.eq.${code}`)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Short URL not found' },
        { status: 404 }
      );
    }

    const urlData = data as any;

    if (!urlData.is_active) {
      return NextResponse.json(
        { error: 'This short URL has been disabled' },
        { status: 410 }
      );
    }

    // Check expiration
    if (urlData.expires_at && new Date(urlData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This short URL has expired' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      short_code: urlData.short_code,
      original_url: urlData.original_url,
      title: urlData.title,
      click_count: urlData.click_count,
      created_at: urlData.created_at,
    });
  } catch (error) {
    console.error('Short URL fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
