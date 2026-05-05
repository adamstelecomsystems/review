'use client';

import { useState, useEffect } from 'react';
import { Star, Download, ChevronLeft, ChevronRight, Filter, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const C = {
  bg: '#FAFAF8', surface: '#FFFFFF', surface2: '#F4F4F2', border: '#E5E7EB',
  text: '#111827', muted: '#6B7280', subtle: '#9CA3AF', primary: '#0F766E',
  primaryMuted: 'rgba(15,118,110,0.08)', primaryLight: 'rgba(15,118,110,0.2)',
  success: '#059669', warning: '#D97706',
  shadowCard: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
};

type Review = { id: string; star: number; selected_message: string | null; answers: Record<string, string[]> | null; created_at: string };

const PAGE_SIZE = 8;

function StarRating({ stars, size = 13 }: { stars: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={size} fill={s <= stars ? '#f59e0b' : 'transparent'} color={s <= stars ? '#f59e0b' : '#D1D5DB'} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: biz } = await supabase.from('businesses').select('id').single();
      if (!biz) { setLoading(false); return; }
      const { data } = await supabase
        .from('reviews')
        .select('id, star, selected_message, answers, created_at')
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false });
      setReviews(data || []);
      setLoading(false);
    })();
  }, []);

  const filtered = starFilter ? reviews.filter((r) => r.star === starFilter) : reviews;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStarFilter = (star: number | null) => { setStarFilter(star); setPage(1); };

  const handleExport = () => {
    if (reviews.length === 0) return;
    const rows = [
      ['Date', 'Rating', 'Review', 'Status'],
      ...reviews.map((r) => [
        new Date(r.created_at).toLocaleDateString(),
        String(r.star),
        (r.selected_message || '').replace(/,/g, ';'),
        'Submitted',
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'reviews.csv'; a.click();
    URL.revokeObjectURL(url);
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
    <div style={{ maxWidth: 1100, margin: '0 auto', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: '-0.3px', marginBottom: 4 }}>Reviews</h1>
          <p style={{ fontSize: 14, color: C.muted }}>{reviews.length} total review{reviews.length !== 1 ? 's' : ''} collected</p>
        </div>
        <button
          onClick={handleExport}
          disabled={reviews.length === 0}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: C.surface, border: `1px solid ${C.border}`, color: reviews.length === 0 ? C.subtle : C.muted, boxShadow: C.shadowCard, cursor: reviews.length === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Filter size={14} color={C.muted} />
        {[null, 5, 4, 3, 2, 1].map((s) => (
          <button
            key={String(s)}
            onClick={() => handleStarFilter(s)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
              background: starFilter === s ? C.primaryMuted : C.surface,
              border: starFilter === s ? `1px solid ${C.primary}` : `1px solid ${C.border}`,
              color: starFilter === s ? C.primary : C.muted,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            {s === null ? 'All' : <><Star size={12} fill="#f59e0b" color="#f59e0b" />{s}★</>}
          </button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard, padding: '64px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⭐</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>No reviews yet</h2>
          <p style={{ fontSize: 14, color: C.muted }}>Share your QR code to start collecting reviews from customers.</p>
        </div>
      ) : (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {['Date', 'Rating', 'Review', 'Status'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, fontWeight: 700, color: C.muted, background: C.surface2, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((r, i) => (
                  <tr
                    key={r.id}
                    style={{ borderBottom: i < paginated.length - 1 ? `1px solid ${C.border}` : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.surface2)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap', color: C.muted, fontSize: 12 }}>
                      {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <StarRating stars={r.star} />
                    </td>
                    <td style={{ padding: '14px 20px', color: C.text, maxWidth: 420 }}>
                      <p style={{ margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
                        {r.selected_message || '—'}
                      </p>
                    </td>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: 'rgba(5,150,105,0.1)', color: C.success }}>
                        Submitted
                      </span>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '48px 20px', textAlign: 'center', color: C.muted, fontSize: 14 }}>
                      No reviews match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, color: C.muted }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', color: page === 1 ? C.border : C.muted, cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex' }}>
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    style={{ width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 500, background: page === i + 1 ? C.primaryMuted : 'transparent', color: page === i + 1 ? C.primary : C.muted, border: page === i + 1 ? `1px solid ${C.primary}` : '1px solid transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: 7, borderRadius: 8, border: 'none', background: 'transparent', color: page === totalPages ? C.border : C.muted, cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex' }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
