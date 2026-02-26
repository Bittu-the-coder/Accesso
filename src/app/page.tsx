import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Clock,
  FileText,
  Link as LinkIcon,
  Lock,
  Shield,
  TrendingUp,
  Upload,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="text-center max-w-5xl mx-auto animate-fade-in">
          <div className="inline-block px-6 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full mb-6">
            <span className="text-brand-primary font-semibold text-sm flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Secure Temporary Tunnel
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Share Securely,
            <br />
            Disappear Instantly
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-10 max-w-3xl mx-auto">
            Enterprise-grade encrypted tunnels for temporary sharing. Files,
            text, and links vanish automatically. Zero compromise on privacy.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/text">
              <Button size="lg" className="text-lg px-10 py-6">
                <Lock className="w-5 h-5" />
                Create Secure Tunnel
              </Button>
            </Link>
            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-6"
              >
                Explore Features
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-bold text-brand-primary mb-2">
                256-bit
              </div>
              <div className="text-slate-500 text-xs sm:text-sm font-medium uppercase tracking-wider">AES Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-bold text-brand-primary mb-2">
                24h
              </div>
              <div className="text-slate-500 text-xs sm:text-sm font-medium uppercase tracking-wider">Auto-Delete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-bold text-brand-primary mb-2">0</div>
              <div className="text-slate-500 text-xs sm:text-sm font-medium uppercase tracking-wider">Data Retention</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Professional Sharing Tools
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Military-grade security meets developer-friendly simplicity
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <ToolCard
            href="/text"
            icon={<FileText className="w-12 h-12" />}
            title="Encrypted Text Tunnel"
            description="Share code, secrets, or notes through end-to-end encrypted channels. Self-destructing messages with zero server-side storage."
            badge="Most Popular"
          />
          <ToolCard
            href="/files"
            icon={<Upload className="w-12 h-12" />}
            title="Secure File Vault"
            description="Transfer files up to 10MB with military-grade encryption. CDN-powered delivery with automatic 24-hour deletion."
            badge="Fast & Reliable"
          />
          <ToolCard
            href="/links"
            icon={<LinkIcon className="w-12 h-12" />}
            title="Smart URL Shortener"
            description="Create branded short links with custom aliases. Real-time analytics, click tracking, and optional expiration."
            badge="Analytics Included"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-slate-100 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Why Professionals Choose Accesso
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Built for security-conscious teams and developers
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-brand-primary" />}
              title="Lightning Performance"
              description="Next.js 15 on the edge. Global CDN. Sub-100ms response times worldwide."
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8 text-brand-primary" />}
              title="Military Encryption"
              description="AES-256 encryption. Zero-knowledge architecture. No server-side decryption keys."
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-brand-primary" />}
              title="Auto-Destruct"
              description="Guaranteed deletion after 24 hours. No traces, no logs, no recovery possible."
            />
            <FeatureCard
              icon={<Lock className="w-8 h-8 text-brand-primary" />}
              title="Privacy First"
              description="No signup required. No tracking. No analytics. Your data, your control."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-brand-primary" />}
              title="Enterprise Ready"
              description="99.99% uptime SLA. Custom retention. Dedicated support for teams."
            />
            <FeatureCard
              icon={<FileText className="w-8 h-8 text-brand-primary" />}
              title="Syntax Highlight"
              description="50+ languages supported. Perfect for sharing code snippets with teams."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto overflow-hidden border-2 border-brand-primary/20">
          <div className="bg-brand-primary p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Start Sharing Securely
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of security-conscious developers and teams using
              Accesso for encrypted temporary sharing.
            </p>
            <Link href="/text">
              <Button
                size="lg"
                className="bg-white text-brand-primary hover:bg-slate-100 text-lg px-10 py-6 font-bold shadow-xl active:scale-95 transition-all"
              >
                Create Your First Tunnel →
              </Button>
            </Link>
            <p className="text-white/80 text-sm mt-6 font-medium">
              No credit card • No signup • 100% Free • Self-destructing by
              default
            </p>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
}

function ToolCard({
  href,
  icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full p-8 hover:border-brand-primary border-2 relative overflow-hidden transition-all duration-300">
        {badge && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-brand-primary text-white text-xs font-bold rounded-full">
            {badge}
          </div>
        )}
        <div className="inline-block p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-brand-primary mb-6 transition-transform group-hover:scale-110">
          {icon}
        </div>
        <CardHeader className="p-0 mb-3">
          <CardTitle className="text-2xl group-hover:text-brand-primary transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <CardDescription className="text-base leading-relaxed">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="inline-block p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-brand-primary mb-4">
        {icon}
      </div>
      <CardHeader className="p-0 mb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <CardDescription className="leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
