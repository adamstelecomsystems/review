'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Star, TrendingUp, QrCode, MessageSquare, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { createClient } from '@/lib/supabase/client';

const C = {
  bg: '#FAFAF8', surface: '#FFFFFF', surface2: '#F4F4F2', border: '#E5E7EB',
  text: '#111827', muted: '#6B7280', subtle: '#9CA3AF', primary: '#0F766E',
  primaryMuted: 'rgba(15,118,110,0.08)', success: '#059669', warning: '#D97706',
  danger: '#DC2626', shadowCard: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
};

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

type Review = { id: string; star: number; selected_message: string | null; created_at: string };

function StarRating({ stars, size = 12 }: { stars: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={size} fill={s <= stars ? '#f59e0b' : 'transparent'} color={s <= stars ? '#f59e0b' : '#D1D5DB'} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const statValueRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [businessName, setBusinessName] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Computed stats
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.star, 0) / totalReviews
    : 0;
  const thisMonth = reviews.filter((r) => {
    const d = new Date(r.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const starDist = [5,4,3,2,1].map((s) => ({
    star: s,
    label: `${s}★`,
    count: reviews.filter((r) => r.star === s).length,
  }));
  const maxCount = Math.max(...starDist.map((d) => d.count), 1);

  const statCards = [
    { label: 'Total Reviews', value: totalReviews, icon: Star, color: C.primary },
    { label: 'Avg Rating', value: avgRating, isRating: true, icon: TrendingUp, color: '#D97706' },
    { label: 'This Month', value: thisMonth, icon: MessageSquare, color: C.primary },
    { label: 'QR Scans', value: 0, icon: QrCode, color: '#3b82f6' },
  ];

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: biz } = await supabase.from('businesses').select('id, name').single();
      if (!biz) { setDataLoaded(true); return; }
      setBusinessName(biz.name);

      const { data: revs } = await supabase
        .from('reviews')
        .select('id, star, selected_message, created_at')
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false });

      setReviews(revs || []);
      setDataLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;
    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        gsap.from(Array.from(cardsRef.current.children), {
          y: 24, opacity: 0, stagger: 0.1, duration: 0.55, ease: 'power2.out',
        });
      }
      statCards.forEach((s, i) => {
        const el = statValueRefs.current[i];
        if (!el) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: s.value, duration: 1.2, delay: 0.3 + i * 0.1, ease: 'power2.out',
          onUpdate: () => {
            el.textContent = s.isRating
              ? (obj.val > 0 ? obj.val.toFixed(1) + '★' : '—')
              : Math.round(obj.val).toString();
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoaded]);

  const recentReviews = reviews.slice(0, 5);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: '-0.4px', marginBottom: 6 }}>
          Good morning,{' '}
          <span style={{ color: C.primary }}>{businessName || '—'}</span>
        </h1>
        <p style={{ fontSize: 14, color: C.muted }}>{today}</p>
      </div>

      {/* Stat Cards */}
      <div ref={cardsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <div key={s.label} style={{ padding: '20px 22px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.muted }}>{s.label}</span>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={16} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: '-0.5px' }}>
              <span ref={(el) => { statValueRefs.current[i] = el; }}>
                {s.isRating ? (s.value > 0 ? s.value.toFixed(1) + '★' : '—') : s.value}
              </span>
            </div>
            {s.label === 'QR Scans' ? (
              <div style={{ fontSize: 12, color: C.subtle }}>Tracking coming soon</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: totalReviews > 0 ? C.success : C.subtle }}>
                {totalReviews > 0 && <ArrowUpRight size={13} />}
                {totalReviews > 0 ? 'From your review page' : 'No reviews yet'}
              </div>
            )}
          </div>
        ))}
      </div>

      {totalReviews === 0 ? (
        /* Empty state */
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard, padding: '56px 32px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: C.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Star size={28} color={C.primary} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>No reviews yet</h2>
          <p style={{ fontSize: 14, color: C.muted, maxWidth: 380, margin: '0 auto 28px', lineHeight: 1.6 }}>
            Set up your business profile and share your QR code to start collecting reviews.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard/setup" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 10, background: C.primary, color: 'white', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Complete Setup
            </Link>
            <Link href="/dashboard/qr" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surface, color: C.text, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              Get QR Code
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          {/* Recent Reviews */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Recent Reviews</h2>
              <Link href="/dashboard/reviews" style={{ fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 8, background: C.primaryMuted, color: C.primary, textDecoration: 'none' }}>
                View All
              </Link>
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
                    <tr key={r.id} style={{ borderBottom: i < recentReviews.length - 1 ? `1px solid ${C.border}` : 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.surface2)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '13px 18px', whiteSpace: 'nowrap', color: C.muted, fontSize: 12 }}>
                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '13px 18px' }}><StarRating stars={r.star} /></td>
                      <td style={{ padding: '13px 18px', maxWidth: 280 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.selected_message || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: 'rgba(5,150,105,0.1)', color: C.success }}>
                          Submitted
                        </span>
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
              {starDist.map((d) => (
                <div key={d.star} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, width: 24, textAlign: 'right', fontWeight: 500, color: C.muted, flexShrink: 0 }}>{d.label}</span>
                  <div style={{ flex: 1, height: 18, borderRadius: 999, background: C.surface2, overflow: 'hidden' }}>
                    <div className="dist-bar" style={{ height: '100%', borderRadius: 999, width: `${(d.count / maxCount) * 100}%`, background: d.star >= 4 ? C.primary : d.star === 3 ? C.warning : C.danger }} />
                  </div>
                  <span style={{ fontSize: 12, width: 28, textAlign: 'right', color: C.muted, flexShrink: 0 }}>{d.count}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: C.primary, letterSpacing: '-1px', marginBottom: 6 }}>
                {avgRating.toFixed(1)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginBottom: 6 }}>
                {[1,2,3,4,5].map((s) => <Star key={s} size={16} fill={s <= Math.round(avgRating) ? '#f59e0b' : 'transparent'} color={s <= Math.round(avgRating) ? '#f59e0b' : '#D1D5DB'} />)}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
