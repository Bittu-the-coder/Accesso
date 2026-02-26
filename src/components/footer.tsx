import { Github, Heart, Lock, Shield, Twitter } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-6 h-6 text-brand-primary" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Accesso
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Enterprise-grade encrypted tunnels for temporary sharing. Zero
              data retention, maximum security.
            </p>
            <div className="flex items-center gap-2 text-brand-primary text-xs">
              <Shield className="w-4 h-4" />
              <span>256-bit AES Encrypted</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Secure Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/text"
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors"
                >
                  Encrypted Text Tunnel
                </Link>
              </li>
              <li>
                <Link
                  href="/files"
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors"
                >
                  Secure File Vault
                </Link>
              </li>
              <li>
                <Link
                  href="/links"
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors"
                >
                  Smart URL Shortener
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/docs"
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/api"
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors"
                >
                  Enterprise Plans
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Legal & Security</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors"
                >
                  Security Details
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
            Made with{' '}
            <Heart className="w-4 h-4 text-brand-primary fill-brand-primary" /> for
            security-conscious developers
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-slate-500">
              © 2026 Accesso. Zero data retention.
            </span>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
