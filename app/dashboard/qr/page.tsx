'use client';

import { useState, useEffect } from 'react';
import { QrCode, Download, Copy, Check, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase/client';

const C = {
  bg: '#FAFAF8', surface: '#FFFFFF', surface2: '#F4F4F2', border: '#E5E7EB',
  text: '#111827', muted: '#6B7280', subtle: '#9CA3AF', primary: '#0F766E',
  primaryMuted: 'rgba(15,118,110,0.08)', primaryLight: 'rgba(15,118,110,0.2)',
  success: '#059669',
  shadowCard: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
  shadowLg: '0 8px 32px rgba(0,0,0,0.1)',
};

const sizeOptions = [
  { label: 'S', size: 120, px: 'Small (120px)' },
  { label: 'M', size: 180, px: 'Medium (180px)' },
  { label: 'L', size: 240, px: 'Large (240px)' },
];

export default function QRPage() {
  const [selectedSize, setSelectedSize] = useState(1);
  const [copied, setCopied] = useState(false);
  const [slug, setSlug] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.from('businesses').select('slug, name').single().then(({ data }) => {
      if (data) { setSlug(data.slug); setBusinessName(data.name); }
      setLoading(false);
    });
  }, []);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const qrUrl = slug ? `${baseUrl}/review/${slug}` : '';
  const qrSize = sizeOptions[selectedSize].size;

  const handleCopy = () => {
    if (!qrUrl) return;
    navigator.clipboard.writeText(qrUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const svg = document.querySelector('#qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      canvas.width = qrSize; canvas.height = qrSize;
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.download = `${slug || 'qr-code'}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <Loader2 size={24} color={C.primary} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: '-0.3px', marginBottom: 4 }}>QR Code</h1>
        <p style={{ fontSize: 14, color: C.muted }}>Your unique QR code for collecting customer reviews.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

        {/* QR Code panel */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 'fit-content', padding: 20, borderRadius: 16, background: 'white', boxShadow: C.shadowLg, border: `1px solid ${C.border}` }}>
            {qrUrl ? (
              <QRCodeSVG
                id="qr-code-svg"
                value={qrUrl}
                size={qrSize}
                fgColor="#111827"
                bgColor="white"
                level="M"
              />
            ) : (
              <div style={{ width: qrSize, height: qrSize, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.surface2, borderRadius: 8 }}>
                <QrCode size={48} color={C.border} />
              </div>
            )}
          </div>

          {/* Size selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: C.muted, marginRight: 4 }}>Size:</span>
            {sizeOptions.map((opt, i) => (
              <button
                key={opt.label}
                onClick={() => setSelectedSize(i)}
                title={opt.px}
                style={{
                  width: 34, height: 34, borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: selectedSize === i ? C.primaryMuted : C.surface2,
                  color: selectedSize === i ? C.primary : C.muted,
                  border: selectedSize === i ? `1.5px solid ${C.primary}` : `1px solid ${C.border}`,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            <button
              onClick={handleDownload}
              disabled={!qrUrl}
              style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: C.primary, color: 'white', border: 'none', cursor: qrUrl ? 'pointer' : 'not-allowed', opacity: qrUrl ? 1 : 0.5, fontFamily: 'inherit' }}
            >
              <Download size={15} />
              Download PNG
            </button>
            <button
              onClick={handleCopy}
              disabled={!qrUrl}
              style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: copied ? 'rgba(5,150,105,0.08)' : C.surface, color: copied ? C.success : C.text, border: copied ? '1px solid rgba(5,150,105,0.3)' : `1px solid ${C.border}`, cursor: qrUrl ? 'pointer' : 'not-allowed', opacity: qrUrl ? 1 : 0.5, fontFamily: 'inherit', transition: 'all 0.15s' }}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        {/* Info panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* URL card */}
          <div style={{ padding: 20, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14 }}>Your Review Link</h2>
            <div style={{ padding: '10px 14px', borderRadius: 10, background: C.surface2, border: `1px solid ${C.border}`, fontSize: 13, fontWeight: 500, color: C.primary, wordBreak: 'break-all', marginBottom: 10, fontFamily: 'monospace' }}>
              {qrUrl || '—'}
            </div>
            <p style={{ fontSize: 12, color: C.subtle }}>
              This is the URL encoded in your QR code. Customers are taken here when they scan.
            </p>
          </div>

          {/* Business info */}
          <div style={{ padding: 20, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14 }}>Business Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Business Name', value: businessName || '—' },
                { label: 'Review Page Slug', value: slug || '—' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, color: C.muted }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: C.text, fontFamily: item.label === 'Review Page Slug' ? 'monospace' : 'inherit' }}>{item.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ fontSize: 12, color: C.muted }}>Status</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.success }}>● Active</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div style={{ padding: 20, background: C.primaryMuted, border: `1px solid ${C.primaryLight}`, borderRadius: 14 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: C.primary, marginBottom: 10 }}>Tips for more scans</h2>
            <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'Print and place at checkout counter',
                'Add to receipts and invoices',
                'Display on your front desk or table',
                'Include in email follow-ups',
              ].map((tip) => (
                <li key={tip} style={{ fontSize: 12, color: C.muted }}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
