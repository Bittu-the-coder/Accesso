'use client';

import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';
import {
  BarChart3,
  Check,
  Copy,
  ExternalLink,
  Link as LinkIcon,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function LinksPage() {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [title, setTitle] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const handleShorten = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/links/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          customAlias: customAlias || undefined,
          title: title || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShortCode(data.short_code || data.custom_alias);
        setShortUrl(
          `${window.location.origin}/l/${data.short_code || data.custom_alias}`
        );
        toast.success('URL shortened successfully!');
      } else {
        toast.error(data.error || 'Failed to shorten URL');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getStats = async () => {
    if (!shortCode) return;

    try {
      const response = await fetch(`/api/links/${shortCode}/stats`);
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-slate-900 dark:text-white">
            URL Shortener
          </h1>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
            Create short, memorable links with optional custom aliases
          </p>

          {!shortUrl && (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Long URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://example.com/very-long-url..."
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-slate-800 dark:text-white transition-all shadow-sm"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Custom Alias (optional)
                  </label>
                  <input
                    type="text"
                    value={customAlias}
                    onChange={e =>
                      setCustomAlias(
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      )
                    }
                    placeholder="my-link"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-slate-800 dark:text-white transition-all shadow-sm"
                    maxLength={50}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Letters, numbers, and hyphens only
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="My Website"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-slate-800 dark:text-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Preview:</strong>{' '}
                  {typeof window !== 'undefined' ? window.location.origin : ''}
                  /l/{customAlias || 'XXXXXXX'}
                </p>
              </div>

              <button
                onClick={handleShorten}
                disabled={loading || !url.trim()}
                className="w-full py-4 bg-brand-primary hover:bg-brand-accent text-white rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
              >
                {loading ? 'Shortening...' : 'Shorten URL'}
              </button>
            </div>
          )}

          {/* Success Display */}
          {shortUrl && (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 space-y-6 animate-slide-up">
              <div className="text-center">
                <div className="inline-block p-4 bg-green-50 dark:bg-green-900/30 rounded-full mb-4">
                  <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  URL Shortened Successfully!
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Your short URL is ready to share
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Short URL:
                  </p>
                  <div className="flex items-center gap-2">
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-lg sm:text-2xl font-bold text-brand-primary hover:text-brand-accent transition-colors break-all"
                    >
                      {shortUrl}
                    </a>
                    <button
                      onClick={() => copyToClipboard(shortUrl)}
                      className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                    >
                      {copied ? (
                        <Check className="w-6 h-6 text-green-600" />
                      ) : (
                        <Copy className="w-6 h-6 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Original URL:
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-800 dark:text-slate-200 hover:text-brand-primary transition-colors break-all flex items-center gap-2"
                  >
                    {url}
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  </a>
                </div>

                {stats && (
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-brand-primary" />
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        Statistics
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                      {stats.click_count} clicks
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShortUrl('');
                    setShortCode('');
                    setUrl('');
                    setCustomAlias('');
                    setTitle('');
                    setStats(null);
                  }}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-all"
                >
                  Create Another
                </button>
                <button
                  onClick={getStats}
                  className="flex-1 py-3 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  View Stats
                </button>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <LinkIcon className="w-10 h-10 text-brand-primary mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">
                Custom Aliases
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Create memorable short links with your own custom aliases
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <BarChart3 className="w-10 h-10 text-brand-primary mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">
                Click Analytics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Track how many times your short links are clicked
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <Check className="w-10 h-10 text-brand-primary mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">
                No Expiration
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Short links never expire unless you set a custom expiration
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
