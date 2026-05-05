'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Star, TrendingUp, QrCode, MessageSquare, ArrowUpRight, ArrowLeft } from 'lucide-react';
import gsap from 'gsap';

const C = {
  bg: '#FAFAF8', surface: '#FFFFFF', surface2: '#F4F4F2', border: '#E5E7EB',
  text: '#111827', muted: '#6B7280', subtle: '#9CA3AF', primary: '#0F766E',
  primaryMuted: 'rgba(15,118,110,0.08)', success: '#059669', warning: '#D97706',
  danger: '#DC2626', shadowCard: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
};

const stats = [
  { label: 'Total Reviews', value: 247, icon: Star, change: '+12 this week', color: C.primary },
  { label: 'Avg Rating', value: 4.6, icon: TrendingUp, change: 'Up from 4.3', color: '#D97706' },
  { label: 'This Month', value: 38, icon: MessageSquare, change: '+8 vs last month', color: C.primary },
  { label: 'QR Scans', value: 312, icon: QrCode, change: '+47 this week', color: '#3b82f6' },
];

const recentReviews = [
  { date: 'May 1, 2025', stars: 5, snippet: 'Absolutely fantastic service! The team was professional and resolved my issue within the hour...', status: 'Posted' },
  { date: 'Apr 30, 2025', stars: 5, snippet: 'Best telecom experience I have ever had. Will definitely recommend to friends and family...', status: 'Posted' },
  { date: 'Apr 29, 2025', stars: 4, snippet: 'Very knowledgeable staff and quick response. Slight wait time but overall great experience...', status: 'Posted' },
  { date: 'Apr 28, 2025', stars: 5, snippet: 'Outstanding support from start to finish. My internet issue was fixed immediately...', status: 'Posted' },
  { date: 'Apr 27, 2025', stars: 5, snippet: 'Excellent customer service! They went above and beyond to help us set up our business line...', status: 'Posted' },
];

const starDistribution = [
  { stars: 5, count: 182, label: '5★' },
  { stars: 4, count: 41, label: '4★' },
  { stars: 3, count: 14, label: '3★' },
  { stars: 2, count: 7, label: '2★' },
  { stars: 1, count: 3, label: '1★' },
];
const maxCount = 182;

function StarRating({ stars, size = 12 }: { stars: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={size} fill={s <= stars ? '#f59e0b' : 'transparent'} color={s <= stars ? '#f59e0b' : '#D1D5DB'} />
      ))}
    </div>
  );
}

export default function DemoPage() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const statValueRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        gsap.from(Array.from(cardsRef.current.children), {
          y: 24, opacity: 0, stagger: 0.1, duration: 0.55, ease: 'power2.out',
        });
      }
      stats.forEach((s, i) => {
        const el = statValueRefs.current[i];
        if (!el) return;
        const isRating = s.label === 'Avg Rating';
        const obj = { val: 0 };
        gsap.to(obj, {
          val: s.value, duration: 1.2, delay: 0.3 + i * 0.1, ease: 'power2.out',
          onUpdate: () => {
            el.textContent = isRating ? obj.val.toFixed(1) + '★' : Math.round(obj.val).toString();
          },
        });
      });
      if (barsRef.current) {
        gsap.from(Array.from(barsRef.current.querySelectorAll('.dist-bar')), {
          scaleX: 0, transformOrigin: 'left center', stagger: 0.08, duration: 0.65, ease: 'power2.out', delay: 0.5,
        });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Demo banner */}
      <div style={{ background: C.primary, padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'white' }}>
          👀 You&apos;re viewing a demo — this is sample data
        </span>
        <Link href="/signup" style={{ fontSize: 13, fontWeight: 600, color: 'white', background: 'rgba(255,255,255,0.2)', padding: '5px 14px', borderRadius: 8, textDecoration: 'none' }}>
          Get Started Free →
        </Link>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Back + header */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.muted, textDecoration: 'none', marginBottom: 20 }}>
            <ArrowLeft size={14} /> Back to home
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: '-0.4px', marginBottom: 6 }}>
            Good morning, <span style={{ color: C.primary }}>Demo Business</span>
          </h1>
          <p style={{ fontSize: 14, color: C.muted }}>Sample dashboard — sign up to see your real data</p>
        </div>

        {/* Stat Cards */}
        <div ref={cardsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ padding: '20px 22px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: C.muted }}>{s.label}</span>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={16} color={s.color} />
                </div>
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: '-0.5px' }}>
                <span ref={(el) => { statValueRefs.current[i] = el; }}>0</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.success }}>
                <ArrowUpRight size={13} />{s.change}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          {/* Recent Reviews */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Recent Reviews</h2>
              <span style={{ fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 8, background: C.primaryMuted, color: C.primary }}>Sample data</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {['Date', 'Rating', 'Review', 'Status'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 18px', fontSize: 11, fontWeight: 600, color: C.muted, background: C.surface2, letterSpacing: '0.03em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentReviews.map((r, i) => (
                    <tr key={i} style={{ borderBottom: i < recentReviews.length - 1 ? `1px solid ${C.border}` : 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.surface2)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '13px 18px', whiteSpace: 'nowrap', color: C.muted, fontSize: 12 }}>{r.date}</td>
                      <td style={{ padding: '13px 18px' }}><StarRating stars={r.stars} /></td>
                      <td style={{ padding: '13px 18px', maxWidth: 280 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.snippet}</span>
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: 'rgba(5,150,105,0.1)', color: C.success }}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Star Distribution */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard, padding: '20px 22px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 20 }}>Rating Distribution</h2>
            <div ref={barsRef} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {starDistribution.map((d) => (
                <div key={d.stars} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, width: 24, textAlign: 'right', fontWeight: 500, color: C.muted, flexShrink: 0 }}>{d.label}</span>
                  <div style={{ flex: 1, height: 18, borderRadius: 999, background: C.surface2, overflow: 'hidden' }}>
                    <div className="dist-bar" style={{ height: '100%', borderRadius: 999, width: `${(d.count / maxCount) * 100}%`, background: d.stars >= 4 ? C.primary : d.stars === 3 ? C.warning : C.danger }} />
                  </div>
                  <span style={{ fontSize: 12, width: 28, textAlign: 'right', color: C.muted, flexShrink: 0 }}>{d.count}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: C.primary, letterSpacing: '-1px', marginBottom: 6 }}>4.6</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginBottom: 6 }}>
                {[1,2,3,4,5].map((s) => <Star key={s} size={16} fill={s <= 4 ? '#f59e0b' : 'transparent'} color={s <= 4 ? '#f59e0b' : '#D1D5DB'} />)}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>Based on 247 reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
