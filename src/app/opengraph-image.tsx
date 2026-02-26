import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Accesso — Free Encrypted Temporary File & Text Sharing';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background:
          'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
      }}
    >
      {/* Grid pattern overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(37,99,235,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          display: 'flex',
        }}
      />

      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #2563eb, #3b82f6, #2563eb)',
          display: 'flex',
        }}
      />

      {/* Lock icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          background: 'rgba(37,99,235,0.15)',
          border: '2px solid rgba(37,99,235,0.3)',
          marginBottom: '24px',
          fontSize: '40px',
        }}
      >
        🔒
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: '72px',
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-2px',
          marginBottom: '16px',
          display: 'flex',
        }}
      >
        Accesso
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: '28px',
          color: '#94a3b8',
          fontWeight: 500,
          marginBottom: '40px',
          display: 'flex',
        }}
      >
        Share Securely, Disappear Instantly
      </div>

      {/* Feature pills */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
        }}
      >
        {['Encrypted Tunnels', 'Auto-Delete', 'Zero Signup'].map(label => (
          <div
            key={label}
            style={{
              padding: '10px 24px',
              borderRadius: '999px',
              background: 'rgba(37,99,235,0.15)',
              border: '1px solid rgba(37,99,235,0.3)',
              color: '#60a5fa',
              fontSize: '18px',
              fontWeight: 600,
              display: 'flex',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* URL at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '28px',
          color: '#475569',
          fontSize: '18px',
          fontWeight: 500,
          letterSpacing: '1px',
          display: 'flex',
        }}
      >
        accesso.vercel.app
      </div>
    </div>,
    { ...size }
  );
}
