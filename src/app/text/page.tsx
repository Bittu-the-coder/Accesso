'use client';

import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';
import {
  ArrowLeft,
  Check,
  Clock,
  Copy,
  Dice5,
  Lock,
  Plus,
  RefreshCw,
  Send,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface TextEntry {
  id: string;
  title: string;
  content: string;
  language: string;
  createdAt: string;
}

export default function TextPage() {
  // Phase: 'join' = enter/create tunnel ID, 'tunnel' = inside the tunnel
  const [phase, setPhase] = useState<'join' | 'tunnel'>('join');

  // Join phase
  const [inputCode, setInputCode] = useState('');
  const [password, setPassword] = useState('');
  const [expiresIn, setExpiresIn] = useState('24');

  // Tunnel phase
  const [tunnelCode, setTunnelCode] = useState('');
  const [entries, setEntries] = useState<TextEntry[]>([]);
  const [tunnelInfo, setTunnelInfo] = useState<any>(null);

  // Add text form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('plaintext');

  // State
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [viewPassword, setViewPassword] = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Auto-generate a random tunnel ID
  const generateRandomId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInputCode(result);
  };

  // Auto-open tunnel from URL param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (code) {
        setInputCode(code.toUpperCase());
        openTunnel(code.toUpperCase());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Open/connect to a tunnel ---
  const openTunnel = async (code: string, pwd?: string) => {
    if (!code.trim()) {
      toast.error('Please enter a tunnel ID');
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (pwd) headers['x-text-password'] = pwd;

      const response = await fetch(`/api/text/${code.toUpperCase()}`, {
        headers,
      });

      if (response.status === 404) {
        // Tunnel doesn't exist yet — create it
        const createRes = await fetch('/api/text/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            createEmpty: true,
            customCode: code,
            password: password || null,
            expiresIn,
          }),
        });

        const createData = await createRes.json();

        if (createRes.ok) {
          setTunnelCode(createData.code);
          setEntries([]);
          setTunnelInfo({
            code: createData.code,
            expires_at: createData.expires_at,
            view_count: 0,
          });
          setPhase('tunnel');
          setNeedsPassword(false);
          toast.success(
            createData.existing ? 'Connected to tunnel!' : 'New tunnel created!'
          );
        } else {
          toast.error(createData.error || 'Failed to create tunnel');
        }
      } else if (response.status === 401) {
        const data = await response.json();
        if (data.requirePassword) {
          setNeedsPassword(true);
          toast.error('This tunnel is password protected');
        }
      } else if (response.ok) {
        const data = await response.json();
        setTunnelCode(data.code);
        setEntries(data.entries || []);
        setTunnelInfo(data);
        setPhase('tunnel');
        setNeedsPassword(false);
        toast.success('Connected to tunnel!');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to open tunnel');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  // --- Add a text to the current tunnel ---
  const addText = async () => {
    if (!content.trim()) {
      toast.error('Please enter some text');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/text/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Untitled',
          content,
          language,
          code: tunnelCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Text added!');
        setTitle('');
        setContent('');
        setLanguage('plaintext');
        // Refresh tunnel
        await refreshTunnel();
      } else {
        toast.error(data.error || 'Failed to add text');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  // --- Refresh tunnel contents ---
  const refreshTunnel = async () => {
    try {
      const headers: Record<string, string> = {};
      if (viewPassword) headers['x-text-password'] = viewPassword;

      const response = await fetch(`/api/text/${tunnelCode}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
        setTunnelInfo(data);
      }
    } catch {
      // silent
    }
  };

  // --- Copy helper ---
  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(''), 2000);
  };

  // --- Leave tunnel ---
  const leaveTunnel = () => {
    setPhase('join');
    setTunnelCode('');
    setEntries([]);
    setTunnelInfo(null);
    setTitle('');
    setContent('');
    setPassword('');
    setViewPassword('');
    setNeedsPassword(false);
    setInputCode('');
    // Clean URL
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/text');
    }
  };

  const shareUrl = tunnelCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/text?code=${tunnelCode}`
    : '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* ==================== JOIN PHASE ==================== */}
          {phase === 'join' && (
            <>
              <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-slate-900 dark:text-white">
                Text Tunnel
              </h1>
              <p className="text-center text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
                Enter a tunnel ID to connect. If it doesn&apos;t exist, a new
                one will be created. Share the ID with anyone to let them access
                the same tunnel.
              </p>

              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg mx-auto space-y-6">
                {/* Tunnel ID Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tunnel ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={e =>
                        setInputCode(
                          e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                        )
                      }
                      onKeyDown={e => {
                        if (e.key === 'Enter' && inputCode.trim()) {
                          openTunnel(inputCode, viewPassword || undefined);
                        }
                      }}
                      placeholder="e.g. MYFILES"
                      className="flex-1 min-w-0 px-4 py-4 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-slate-800 dark:text-white font-mono text-lg sm:text-xl text-center tracking-widest transition-all shadow-sm"
                      maxLength={20}
                      autoFocus
                    />
                    <button
                      onClick={generateRandomId}
                      className="flex-shrink-0 px-4 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors"
                      title="Generate random ID"
                      type="button"
                    >
                      <Dice5 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                    Type your own or tap the dice to auto-generate
                  </p>
                </div>

                {/* Password (optional, for new tunnels) */}
                {!needsPassword && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Password{' '}
                      <span className="text-xs text-slate-500">
                        (optional, for new tunnels)
                      </span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Leave empty for no password"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-slate-800 dark:text-white transition-all shadow-sm"
                    />
                  </div>
                )}

                {/* Password required (for existing locked tunnels) */}
                {needsPassword && (
                  <div className="animate-slide-up">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-500" />
                      This tunnel is password protected
                    </label>
                    <input
                      type="password"
                      value={viewPassword}
                      onChange={e => setViewPassword(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && viewPassword) {
                          openTunnel(inputCode, viewPassword);
                        }
                      }}
                      placeholder="Enter password to unlock"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-slate-800 dark:text-white transition-all shadow-sm"
                      autoFocus
                    />
                  </div>
                )}

                {/* Expiration (for new tunnels) */}
                {!needsPassword && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Expiration{' '}
                      <span className="text-xs text-slate-500">
                        (for new tunnels)
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className="w-4 h-4 text-slate-400" />
                      </div>
                      <select
                        value={expiresIn}
                        onChange={e => setExpiresIn(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-slate-800 dark:text-white appearance-none transition-all shadow-sm"
                      >
                        <option value="1">1 Hour</option>
                        <option value="12">12 Hours</option>
                        <option value="24">24 Hours</option>
                        <option value="168">7 Days</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Connect Button */}
                <button
                  onClick={() =>
                    openTunnel(inputCode, viewPassword || undefined)
                  }
                  disabled={
                    loading ||
                    !inputCode.trim() ||
                    (needsPassword && !viewPassword)
                  }
                  className="w-full py-4 bg-brand-primary hover:bg-brand-accent text-white rounded-lg font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
                >
                  {loading
                    ? 'Connecting...'
                    : needsPassword
                      ? 'Unlock Tunnel'
                      : 'Open Tunnel'}
                </button>
              </div>

              {/* How it works */}
              <div className="mt-12 max-w-2xl mx-auto">
                <h3 className="text-center text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">
                  How it works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-brand-primary font-bold">1</span>
                    </div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
                      Pick an ID
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Choose any memorable ID like &quot;MYPROJECT&quot; or
                      &quot;MEETING1&quot;
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-brand-primary font-bold">2</span>
                    </div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
                      Add Texts
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Paste code, notes, or any text. Add as many as you need.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-brand-primary font-bold">3</span>
                    </div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
                      Share the ID
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Anyone with the ID can open the tunnel and see all texts.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ==================== TUNNEL PHASE ==================== */}
          {phase === 'tunnel' && (
            <>
              {/* Header */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
                <button
                  onClick={leaveTunnel}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  title="Back to join"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white truncate">
                    Tunnel:{' '}
                    <span className="text-brand-primary font-mono">
                      {tunnelCode}
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {entries.length} text(s)
                    {tunnelInfo?.view_count
                      ? ` • ${tunnelInfo.view_count} views`
                      : ''}
                    {tunnelInfo?.expires_at
                      ? ` • Expires ${new Date(tunnelInfo.expires_at).toLocaleString()}`
                      : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={refreshTunnel}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(shareUrl, 'shareUrl')}
                    className="px-3 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-lg transition-colors border border-brand-primary/20 text-sm font-medium flex items-center gap-1.5"
                    title="Copy share link"
                  >
                    {copiedId === 'shareUrl' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Share Link</span>
                  </button>
                </div>
              </div>

              {/* Add Text Form */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-4 sm:p-5 mb-6">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-brand-primary" />
                  Add Text
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Title (optional)"
                      className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-slate-800 dark:text-white transition-all shadow-sm text-sm"
                    />
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-slate-800 dark:text-white transition-all shadow-sm text-sm"
                    >
                      <option value="plaintext">Plain Text</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="csharp">C#</option>
                      <option value="cpp">C++</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="json">JSON</option>
                      <option value="markdown">Markdown</option>
                      <option value="sql">SQL</option>
                      <option value="bash">Bash</option>
                    </select>
                  </div>

                  <textarea
                    ref={contentRef}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Paste your code or text here..."
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-slate-800 dark:text-white font-mono text-sm transition-all shadow-sm resize-y"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {content.length.toLocaleString()} chars
                    </span>
                    <button
                      onClick={addText}
                      disabled={loading || !content.trim()}
                      className="px-6 py-2.5 bg-brand-primary hover:bg-brand-accent text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] flex items-center gap-2"
                    >
                      {loading ? (
                        'Adding...'
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Add to Tunnel
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Entries List */}
              {entries.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                  <div className="text-slate-400 dark:text-slate-500 mb-3">
                    <Send className="w-12 h-12 mx-auto opacity-30" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    This tunnel is empty
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Add your first text above to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider">
                    Shared Texts ({entries.length})
                  </h3>
                  {entries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-brand-primary">
                              {index + 1}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                              {entry.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                                {entry.language}
                              </span>
                              {entry.createdAt && (
                                <span className="text-xs text-slate-400">
                                  {new Date(entry.createdAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(entry.content, entry.id)
                          }
                          className="flex-shrink-0 p-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-lg transition-colors border border-brand-primary/20"
                          title="Copy content"
                        >
                          {copiedId === entry.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <pre className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg overflow-x-auto border border-slate-200 dark:border-slate-800 max-h-64 overflow-y-auto">
                        <code className="text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                          {entry.content}
                        </code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
