'use client';

import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';
import { formatBytes } from '@/lib/utils';
import {
  ArrowLeft,
  Check,
  Clock,
  Copy,
  Dice5,
  Download,
  File,
  Lock as LockIcon,
  RefreshCw,
  Trash2,
  Upload as UploadIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface SharedFile {
  id: string;
  original_filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  download_count: number;
  created_at: string;
  expires_at: string;
}

export default function FilesPage() {
  // Phase: 'join' = enter/create tunnel ID, 'tunnel' = inside the tunnel
  const [phase, setPhase] = useState<'join' | 'tunnel'>('join');

  // Join phase
  const [inputCode, setInputCode] = useState('');
  const [expiresIn, setExpiresIn] = useState('24');
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [viewPassword, setViewPassword] = useState('');

  // Tunnel phase
  const [tunnelCode, setTunnelCode] = useState('');
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);

  // Upload form
  const [pendingFiles, setPendingFiles] = useState<globalThis.File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // State
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const upperCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (upperCode.length < 3) {
      toast.error('Tunnel ID must be at least 3 characters');
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (pwd) headers['x-file-password'] = pwd;

      const response = await fetch(`/api/files/${upperCode}`, { headers });

      if (response.status === 401) {
        const data = await response.json();
        if (data.requirePassword) {
          setNeedsPassword(true);
          toast.error(
            data.error === 'Incorrect password'
              ? 'Incorrect password'
              : 'This tunnel is password protected'
          );
        }
      } else if (response.ok) {
        const data = await response.json();

        // If tunnel is empty and no sentinel exists, create one with password
        if (data.files?.length === 0 && !pwd && password) {
          const createRes = await fetch('/api/files/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: upperCode,
              password,
              expiresIn,
            }),
          });

          if (!createRes.ok) {
            const errData = await createRes.json();
            toast.error(errData.error || 'Failed to create tunnel');
            setLoading(false);
            return;
          }
        }

        setTunnelCode(upperCode);
        setSharedFiles(data.files || []);
        setPhase('tunnel');
        setNeedsPassword(false);
        if (pwd) setViewPassword(pwd);
        toast.success(
          data.files?.length > 0
            ? `Connected! ${data.files.length} file(s) found`
            : 'Tunnel opened — upload files to get started'
        );
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

  // --- File selection ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    const invalidFiles = selectedFiles.filter(f => f.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error('Some files exceed the 10MB limit');
      return;
    }

    setPendingFiles(prev => [...prev, ...selectedFiles]);
    toast.success(`${selectedFiles.length} file(s) added`);

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  // --- Upload files to the current tunnel ---
  const handleUpload = async () => {
    if (pendingFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let uploadedCount = 0;

      for (const file of pendingFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('code', tunnelCode);
        formData.append('expiresIn', expiresIn);
        if (password || viewPassword) {
          formData.append('password', password || viewPassword);
        }

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Upload failed: ${file.name}`);
        }

        uploadedCount++;
        setUploadProgress(
          Math.round((uploadedCount / pendingFiles.length) * 100)
        );
      }

      toast.success('All files uploaded!');
      setPendingFiles([]);
      setUploadProgress(0);
      // Refresh the file list
      await refreshTunnel();
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // --- Refresh tunnel contents ---
  const refreshTunnel = async () => {
    try {
      const headers: Record<string, string> = {};
      if (viewPassword) headers['x-file-password'] = viewPassword;

      const response = await fetch(`/api/files/${tunnelCode}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setSharedFiles(data.files || []);
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
    setSharedFiles([]);
    setPendingFiles([]);
    setInputCode('');
    setPassword('');
    setViewPassword('');
    setNeedsPassword(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/files');
    }
  };

  const shareUrl = tunnelCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/files?code=${tunnelCode}`
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
                File Tunnel
              </h1>
              <p className="text-center text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
                Enter a tunnel ID to connect. Upload and download files using
                the same ID — just like the old system.
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
                        (optional, for new uploads)
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockIcon className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Leave empty for no password"
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-slate-800 dark:text-white transition-all shadow-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Password required (for existing locked tunnels) */}
                {needsPassword && (
                  <div className="animate-slide-up">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                      <LockIcon className="w-4 h-4 text-amber-500" />
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

                {/* Expiration */}
                {!needsPassword && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      File Expiration{' '}
                      <span className="text-xs text-slate-500">
                        (for new uploads)
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
                      Choose any memorable ID like &quot;MYFILES&quot; or
                      &quot;PROJECT1&quot;
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-brand-primary font-bold">2</span>
                    </div>
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
                      Upload Files
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Select files up to 10MB each. Upload as many as you need.
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
                      Anyone with the ID can open the tunnel and download files.
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
                    {sharedFiles.length} file(s)
                    {sharedFiles.length > 0 &&
                      ` • ${formatBytes(sharedFiles.reduce((acc, f) => acc + f.file_size, 0))} total`}
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

              {/* Upload Section */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-5 mb-6">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <UploadIcon className="w-5 h-5 text-brand-primary" />
                  Upload Files
                </h3>

                <div className="space-y-4">
                  {/* Drop zone */}
                  <div
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-brand-primary dark:hover:border-brand-primary transition-colors bg-slate-50 dark:bg-slate-800/50 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <UploadIcon className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Click to select files
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Max 10MB per file
                    </p>
                  </div>

                  {/* Pending files list */}
                  {pendingFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Ready to upload ({pendingFiles.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {pendingFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <File className="w-4 h-4 text-brand-primary flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {formatBytes(file.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removePendingFile(index)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload progress */}
                  {uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}

                  {/* Upload button */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {pendingFiles.length} file(s) selected
                    </span>
                    <button
                      onClick={handleUpload}
                      disabled={uploading || pendingFiles.length === 0}
                      className="px-6 py-2.5 bg-brand-primary hover:bg-brand-accent text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] flex items-center gap-2"
                    >
                      {uploading ? (
                        `Uploading... ${uploadProgress}%`
                      ) : (
                        <>
                          <UploadIcon className="w-4 h-4" />
                          Upload to Tunnel
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Files List */}
              {sharedFiles.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                  <div className="text-slate-400 dark:text-slate-500 mb-3">
                    <File className="w-12 h-12 mx-auto opacity-30" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    This tunnel is empty
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Upload your first file above to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wider">
                    Shared Files ({sharedFiles.length})
                  </h3>
                  {sharedFiles.map(file => (
                    <div
                      key={file.id}
                      className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                            <File className="w-5 h-5 text-brand-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white truncate text-sm sm:text-base">
                              {file.original_filename}
                            </h4>
                            <div className="flex items-center gap-2 sm:gap-3 mt-0.5 flex-wrap">
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {formatBytes(file.file_size)}
                              </span>
                              {file.mime_type && (
                                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                                  {file.mime_type.split('/')[1] ||
                                    file.mime_type}
                                </span>
                              )}
                              <span className="text-xs text-slate-400">
                                {file.download_count} downloads
                              </span>
                            </div>
                          </div>
                        </div>
                        <a
                          href={file.file_url}
                          download={file.original_filename}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-accent text-white rounded-lg font-medium transition-all shadow-sm active:scale-95 text-sm w-full sm:w-auto"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </a>
                      </div>
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
