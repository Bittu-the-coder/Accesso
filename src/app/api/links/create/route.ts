// @ts-nocheck
import { supabaseAdmin } from '@/lib/supabase';
import { generateCode, getClientIP, isValidUrl } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, customAlias, title } = body;

    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      );
    }

    let shortCode = customAlias?.toLowerCase().replace(/[^a-z0-9-]/g, '');

    // If custom alias, check if it's available
    if (shortCode) {
      const { data: existing } = await supabaseAdmin
        .from('short_urls')
        .select('id')
        .eq('custom_alias', shortCode)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'This alias is already taken' },
          { status: 409 }
        );
      }
    } else {
      // Generate random short code
      shortCode = generateCode(6);
    }

    const userIp = getClientIP(request);

    const { data, error } = await supabaseAdmin
      .from('short_urls')
      .insert({
        short_code: shortCode,
        original_url: url,
        custom_alias: customAlias ? shortCode : null,
        title: title || null,
        user_ip: userIp,
      } as any)
      .select()
      .single();

    if (error || !data) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create short URL' },
        { status: 500 }
      );
    }

    const shortUrl = data as any;

    return NextResponse.json({
      short_code: shortUrl.short_code,
      custom_alias: shortUrl.custom_alias,
      original_url: shortUrl.original_url,
      short_url: `${process.env.NEXT_PUBLIC_APP_URL}/l/${shortUrl.short_code}`,
    });
  } catch (error) {
    console.error('URL shortener error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
