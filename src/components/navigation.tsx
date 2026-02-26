'use client';

import {
    FileText,
    Link as LinkIcon,
    Lock,
    Menu,
    Upload,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="glass fixed w-full z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors"
          >
            <Lock className="w-8 h-8 text-brand-primary" />
            Accesso
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/text"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-accent transition-colors font-medium"
            >
              <FileText className="w-4 h-4" />
              Tunnel
            </Link>
            <Link
              href="/files"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-accent transition-colors font-medium"
            >
              <Upload className="w-4 h-4" />
              Vault
            </Link>
            <Link
              href="/links"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-accent transition-colors font-medium"
            >
              <LinkIcon className="w-4 h-4" />
              Short
            </Link>
            <ThemeToggle />
            <Link href="/text">
              <Button size="sm">
                Start Sharing
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand-primary transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              href="/text"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-brand-primary transition-colors font-medium px-2 py-1"
              onClick={() => setIsOpen(false)}
            >
              <FileText className="w-4 h-4" />
              Text Tunnel
            </Link>
            <Link
              href="/files"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-brand-primary transition-colors font-medium px-2 py-1"
              onClick={() => setIsOpen(false)}
            >
              <Upload className="w-4 h-4" />
              File Vault
            </Link>
            <Link
              href="/links"
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-brand-primary transition-colors font-medium px-2 py-1"
              onClick={() => setIsOpen(false)}
            >
              <LinkIcon className="w-4 h-4" />
              URL Shortener
            </Link>
            <Link href="/text" onClick={() => setIsOpen(false)} className="block pt-2">
              <Button className="w-full">Start Sharing</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
