// @ts-nocheck
import { deleteFileFromImageKit } from '@/lib/imagekit';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Cleanup API — deletes all expired text shares and file shares.
 * For file shares, also removes the file from ImageKit before deleting the DB row.
 *
 * Can be called:
 *  - Via cron (e.g. Vercel Cron, or external cron hitting GET /api/cleanup)
 *  - Manually for maintenance
 *
 * Secured with CRON_SECRET env var (optional). If set, must pass
 * ?secret=<CRON_SECRET> or Authorization: Bearer <CRON_SECRET>.
 */
export async function GET(request: NextRequest) {
  try {
    // Optional auth check
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const url = new URL(request.url);
      const secretParam = url.searchParams.get('secret');
      const authHeader = request.headers.get('authorization');
      const bearerToken = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

      if (secretParam !== cronSecret && bearerToken !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const now = new Date().toISOString();
    const results = {
      text_deleted: 0,
      files_deleted: 0,
      imagekit_deleted: 0,
      imagekit_failed: 0,
      errors: [] as string[],
    };

    // --- 1. Delete expired text shares ---
    const { data: expiredTexts, error: textFetchErr } = await supabaseAdmin
      .from('text_shares')
      .select('id')
      .lt('expires_at', now);

    if (textFetchErr) {
      results.errors.push(`Text fetch error: ${textFetchErr.message}`);
    } else if (expiredTexts && expiredTexts.length > 0) {
      const ids = expiredTexts.map((t: any) => t.id);
      const { error: textDeleteErr } = await supabaseAdmin
        .from('text_shares')
        .delete()
        .in('id', ids);

      if (textDeleteErr) {
        results.errors.push(`Text delete error: ${textDeleteErr.message}`);
      } else {
        results.text_deleted = ids.length;
      }
    }

    // --- 2. Delete expired file shares (ImageKit first, then DB) ---
    const { data: expiredFiles, error: fileFetchErr } = await supabaseAdmin
      .from('file_shares')
      .select('id, imagekit_file_id, original_filename')
      .lt('expires_at', now);

    if (fileFetchErr) {
      results.errors.push(`File fetch error: ${fileFetchErr.message}`);
    } else if (expiredFiles && expiredFiles.length > 0) {
      // Delete from ImageKit first
      for (const file of expiredFiles as any[]) {
        if (file.imagekit_file_id) {
          try {
            await deleteFileFromImageKit(file.imagekit_file_id);
            results.imagekit_deleted++;
          } catch (err: any) {
            results.imagekit_failed++;
            results.errors.push(
              `ImageKit delete failed for ${file.original_filename} (${file.imagekit_file_id}): ${err.message}`
            );
          }
        }
      }

      // Delete from Supabase
      const ids = expiredFiles.map((f: any) => f.id);
      const { error: fileDeleteErr } = await supabaseAdmin
        .from('file_shares')
        .delete()
        .in('id', ids);

      if (fileDeleteErr) {
        results.errors.push(`File delete error: ${fileDeleteErr.message}`);
      } else {
        results.files_deleted = ids.length;
      }
    }

    // --- 3. Delete expired short URLs ---
    const { data: expiredUrls, error: urlFetchErr } = await supabaseAdmin
      .from('short_urls')
      .select('id')
      .not('expires_at', 'is', null)
      .lt('expires_at', now);

    let urls_deleted = 0;
    if (urlFetchErr) {
      results.errors.push(`URL fetch error: ${urlFetchErr.message}`);
    } else if (expiredUrls && expiredUrls.length > 0) {
      const ids = expiredUrls.map((u: any) => u.id);
      const { error: urlDeleteErr } = await supabaseAdmin
        .from('short_urls')
        .delete()
        .in('id', ids);

      if (urlDeleteErr) {
        results.errors.push(`URL delete error: ${urlDeleteErr.message}`);
      } else {
        urls_deleted = ids.length;
      }
    }

    return NextResponse.json({
      success: true,
      cleaned_at: now,
      text_shares_deleted: results.text_deleted,
      file_shares_deleted: results.files_deleted,
      imagekit_files_deleted: results.imagekit_deleted,
      imagekit_files_failed: results.imagekit_failed,
      short_urls_deleted: urls_deleted,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed', details: error.message },
      { status: 500 }
    );
  }
}
