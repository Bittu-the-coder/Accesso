// @ts-nocheck
import { supabaseAdmin } from '@/lib/supabase';
import { calculateExpiry, generateCode, getClientIP } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      language = 'plaintext',
      password,
      expiresIn,
      code: existingCode,
      customCode,
      createEmpty,
    } = body;

    // --- Create empty tunnel (just reserve a code) ---
    if (createEmpty) {
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

      // Check if code already exists
      const { data: existing } = await supabaseAdmin
        .from('text_shares')
        .select('code, expires_at')
        .eq('code', tunnelCode)
        .single();

      if (existing) {
        // If tunnel exists and hasn't expired, just return it
        if (new Date(existing.expires_at) > new Date()) {
          return NextResponse.json({
            code: existing.code,
            existing: true,
          });
        }
        // If expired, delete it and create fresh
        await supabaseAdmin.from('text_shares').delete().eq('code', tunnelCode);
      }

      let password_hash = null;
      if (password) {
        const crypto = await import('crypto-js/sha256');
        password_hash = crypto.default(password).toString();
      }

      const expireHours = expiresIn ? parseInt(expiresIn, 10) : 24;
      const expiresAt = calculateExpiry(expireHours);
      const userIp = getClientIP(request);

      const { data, error } = await supabaseAdmin
        .from('text_shares')
        .insert({
          code: tunnelCode,
          title: 'Text Tunnel',
          content: JSON.stringify([]),
          language: 'plaintext',
          password_hash,
          expires_at: expiresAt.toISOString(),
          user_ip: userIp,
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
        code: data.code,
        expires_at: data.expires_at,
      });
    }

    // --- Add text to an existing tunnel ---
    if (!content || content.length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length > 50000) {
      return NextResponse.json(
        { error: 'Content exceeds maximum length of 50,000 characters' },
        { status: 400 }
      );
    }

    const newEntry = {
      id: Date.now().toString(),
      title: title || 'Untitled',
      content,
      language,
      createdAt: new Date().toISOString(),
    };

    if (existingCode) {
      // Add to existing tunnel
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('text_shares')
        .select('*')
        .eq('code', existingCode.toUpperCase())
        .single();

      if (fetchError || !existing) {
        return NextResponse.json(
          { error: 'Tunnel not found' },
          { status: 404 }
        );
      }

      const textShare = existing as any;

      if (new Date(textShare.expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'This tunnel has expired' },
          { status: 410 }
        );
      }

      // Parse existing entries
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

      entries.push(newEntry);
      const newContentJson = JSON.stringify(entries);

      if (newContentJson.length > 500000) {
        return NextResponse.json(
          { error: 'Tunnel capacity exceeded' },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabaseAdmin
        .from('text_shares')
        .update({
          content: newContentJson,
          updated_at: new Date().toISOString(),
        })
        .eq('id', textShare.id);

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to add text to tunnel' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        code: textShare.code,
        entryId: newEntry.id,
        totalEntries: entries.length,
      });
    }

    // --- Create new tunnel with first text ---
    let tunnelCode = customCode
      ? customCode.toUpperCase().replace(/[^A-Z0-9]/g, '')
      : generateCode(8);

    if (customCode && tunnelCode.length < 3) {
      return NextResponse.json(
        { error: 'Tunnel ID must be at least 3 characters' },
        { status: 400 }
      );
    }

    let password_hash = null;
    if (password) {
      const crypto = await import('crypto-js/sha256');
      password_hash = crypto.default(password).toString();
    }

    const expireHours = expiresIn ? parseInt(expiresIn, 10) : 24;
    const expiresAt = calculateExpiry(expireHours);
    const userIp = getClientIP(request);
    const contentJson = JSON.stringify([newEntry]);

    const { data, error } = await supabaseAdmin
      .from('text_shares')
      .insert({
        code: tunnelCode,
        title: title || 'Text Tunnel',
        content: contentJson,
        language,
        password_hash,
        expires_at: expiresAt.toISOString(),
        user_ip: userIp,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create tunnel. Code may already exist.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      code: (data as any).code,
      expires_at: (data as any).expires_at,
    });
  } catch (error) {
    console.error('Text create error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
