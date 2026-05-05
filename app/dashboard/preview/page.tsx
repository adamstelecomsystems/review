'use client';

import { useState, useEffect } from 'react';
import { Star, Share2, Smartphone, Eye, Check, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const C = {
  bg: '#FAFAF8', surface: '#FFFFFF', surface2: '#F4F4F2', border: '#E5E7EB',
  text: '#111827', muted: '#6B7280', subtle: '#9CA3AF', primary: '#0F766E',
  primaryMuted: 'rgba(15,118,110,0.08)', primaryLight: 'rgba(15,118,110,0.2)',
  success: '#059669', danger: '#DC2626',
  shadowCard: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
};

type BizData = { name: string; type: string; slug: string; primary_color: string; google_review_url: string };
type Question = { label: string; options: string[] };

function PhoneFrame({ starMode, biz, questions }: { starMode: 1 | 5; biz: BizData; questions: Question[] }) {
  const [rating, setRating] = useState(starMode);
  const isHappy = rating >= 4;
  const color = biz.primary_color || C.primary;
  const initials = biz.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => { setRating(starMode); }, [starMode]);

  return (
    <div style={{ position: 'relative', width: 280, height: 580, borderRadius: 44, overflow: 'hidden', background: '#E5E7EB', boxShadow: '0 0 0 8px #D1D5DB, 0 0 0 10px #E5E7EB, 0 24px 64px rgba(0,0,0,0.18)', border: '3px solid #D1D5DB', margin: '0 auto' }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 80, height: 24, background: '#D1D5DB', borderRadius: '0 0 16px 16px', zIndex: 10 }} />
      <div style={{ height: '100%', overflowY: 'auto', paddingTop: 28, paddingBottom: 16, background: C.bg }}>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, marginBottom: 8, color: 'white', background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
              {initials}
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{biz.name}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{biz.type || 'Local Business'}</div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 8 }}>How was your experience?</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={28} fill={s <= rating ? '#f59e0b' : 'transparent'} color={s <= rating ? '#f59e0b' : '#D1D5DB'} onClick={() => setRating(s as 1 | 5)} style={{ cursor: 'pointer' }} />
              ))}
            </div>
          </div>

          {isHappy && questions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
              {questions.slice(0, 2).map((q) => (
                <div key={q.label}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 6 }}>{q.label}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {q.options.slice(0, 4).map((o, i) => (
                      <span key={o} style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, background: i === 0 ? color : C.surface2, color: i === 0 ? 'white' : C.muted, border: i === 0 ? 'none' : `1px solid ${C.border}` }}>{o}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {isHappy && (
            <div style={{ borderRadius: 12, padding: 12, marginBottom: 12, background: C.surface, border: `1px solid ${C.border}`, boxShadow: C.shadowCard }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                {[1,2,3,4,5].map((s) => <Star key={s} size={10} fill="#f59e0b" color="#f59e0b" />)}
              </div>
              <p style={{ fontSize: 11, color: C.text, lineHeight: 1.5, margin: 0 }}>
                Incredible service! The team was professional and resolved my issue quickly. Will definitely be back!
              </p>
            </div>
          )}

          {!isHappy && (
            <div style={{ borderRadius: 12, padding: 12, marginBottom: 12, background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: C.danger, marginBottom: 6 }}>We are sorry to hear that.</div>
              <p style={{ fontSize: 11, color: C.muted, margin: '0 0 8px' }}>Please tell us what went wrong so we can improve.</p>
              <textarea style={{ width: '100%', padding: 8, borderRadius: 8, fontSize: 11, resize: 'none', outline: 'none', background: C.surface, border: `1px solid ${C.border}`, color: C.text, height: 60, fontFamily: 'inherit', boxSizing: 'border-box' }} placeholder="Share your feedback..." readOnly />
            </div>
          )}

          <button style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: 12, fontWeight: 600, color: 'white', background: isHappy ? color : C.danger, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {isHappy ? 'Copy & Go to Google' : 'Submit Feedback'}
          </button>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 80, height: 4, borderRadius: 999, background: '#D1D5DB' }} />
    </div>
  );
}

export default function PreviewPage() {
  const [starMode, setStarMode] = useState<1 | 5>(5);
  const [shareCopied, setShareCopied] = useState(false);
  const [biz, setBiz] = useState<BizData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: b } = await supabase.from('businesses').select('id, name, type, slug, primary_color, google_review_url').single();
      if (!b) { setLoading(false); return; }
      setBiz(b);

      const { data: qRows } = await supabase.from('star_questions').select('star, questions').eq('business_id', b.id).eq('star', 5).single();
      if (qRows?.questions) setQuestions(qRows.questions as Question[]);
      setLoading(false);
    })();
  }, []);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const reviewUrl = biz ? `${baseUrl}/review/${biz.slug}` : '';

  const handleShare = () => {
    if (!reviewUrl) return;
    navigator.clipboard.writeText(reviewUrl).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <Loader2 size={24} color={C.primary} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!biz) {
    return (
      <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center', padding: '0 24px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>Complete your setup first</h2>
        <p style={{ fontSize: 14, color: C.muted }}>Add your business details in Setup to see a live preview.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: '-0.3px', marginBottom: 4 }}>Live Preview</h1>
        <p style={{ fontSize: 14, color: C.muted }}>See exactly what your customers see when they scan your QR code.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', gap: 4, padding: '5px', borderRadius: 12, marginBottom: 28, background: C.surface, border: `1px solid ${C.border}`, boxShadow: C.shadowCard }}>
            <button onClick={() => setStarMode(5)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 500, background: starMode === 5 ? C.primary : 'transparent', color: starMode === 5 ? 'white' : C.muted, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}>
              <Star size={14} fill={starMode === 5 ? 'white' : 'transparent'} color={starMode === 5 ? 'white' : C.muted} />
              5★ Happy Customer
            </button>
            <button onClick={() => setStarMode(1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 500, background: starMode === 1 ? 'rgba(220,38,38,0.08)' : 'transparent', color: starMode === 1 ? C.danger : C.muted, border: starMode === 1 ? '1px solid rgba(220,38,38,0.2)' : '1px solid transparent', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}>
              <Star size={14} color={starMode === 1 ? C.danger : C.muted} />
              1★ Unhappy Customer
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 12, color: C.muted }}>
            <Smartphone size={13} /> Mobile-optimized view
          </div>
          <PhoneFrame starMode={starMode} biz={biz} questions={questions} />
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.subtle }}>
            <Eye size={13} /> This is how customers see your review page
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 20, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>Current Configuration</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Business Name', value: biz.name },
                { label: 'Business Type', value: biz.type || '—' },
                { label: 'Review Questions', value: `${questions.length} active` },
                { label: 'Google URL', value: biz.google_review_url ? 'Connected' : 'Not set', isGreen: !!biz.google_review_url },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 12, color: C.muted }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: item.isGreen ? C.success : C.text }}>{item.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ fontSize: 12, color: C.muted }}>Brand Color</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: biz.primary_color || C.primary, display: 'inline-block' }} />
                  <span style={{ fontSize: 12, fontWeight: 500, fontFamily: 'monospace', color: C.text }}>{biz.primary_color || C.primary}</span>
                </div>
              </div>
            </div>
          </div>

          {questions.length > 0 && (
            <div style={{ padding: 20, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 16 }}>5★ Questions Preview</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {questions.map((q, i) => (
                  <div key={i} style={{ padding: 12, borderRadius: 10, background: C.surface2, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.text, marginBottom: 8 }}>{q.label}</div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {q.options.map((o) => (
                        <span key={o} style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, background: C.surface, border: `1px solid ${C.border}`, color: C.muted }}>{o}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleShare}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', borderRadius: 10, fontWeight: 600, fontSize: 14, background: shareCopied ? 'rgba(5,150,105,0.08)' : C.primary, border: shareCopied ? '1px solid rgba(5,150,105,0.3)' : 'none', color: shareCopied ? C.success : 'white', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
          >
            {shareCopied ? <Check size={16} /> : <Share2 size={16} />}
            {shareCopied ? 'Link Copied!' : 'Share Preview Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
