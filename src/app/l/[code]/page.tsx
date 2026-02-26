// @ts-nocheck
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export default async function ShortUrlRedirect({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Fetch the short URL
  const { data, error } = await supabaseAdmin
    .from('short_urls')
    .select('*')
    .or(`short_code.eq.${code},custom_alias.eq.${code}`)
    .single();

  if (error || !data || !data.is_active) {
    redirect('/?error=invalid-link');
  }

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    redirect('/?error=expired-link');
  }

  // Increment click count
  await supabaseAdmin
    .from('short_urls')
    .update({ click_count: data.click_count + 1 })
    .eq('id', data.id);

  // Log the click (optional analytics)
  await supabaseAdmin.from('url_clicks').insert({
    short_url_id: data.id,
  });

  // Redirect to the original URL
  redirect(data.original_url);
}
