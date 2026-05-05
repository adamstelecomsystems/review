'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, Copy, ExternalLink, Sparkles, Check, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Question = { label: string; options: string[] };
type Business = {
  id: string;
  name: string;
  type: string;
  google_review_url: string;
  plan: 'free' | 'paid';
  primary_color: string;
};

const DEFAULT_STAR_QUESTIONS: Record<number, Question[]> = {
  1: [
    { label: 'What went wrong?', options: ['Long wait time', 'Poor quality work', 'Bad communication', 'Rude staff', 'Overpriced'] },
    { label: 'Was it resolved?', options: ['Not at all', 'Partially', 'Eventually'] },
  ],
  2: [
    { label: 'What fell short?', options: ['Quality', 'Communication', 'Speed', 'Professionalism'] },
    { label: 'Would you try again?', options: ['Unlikely', 'Maybe', 'If improved'] },
  ],
  3: [
    { label: 'What was okay?', options: ['Service quality', 'Staff attitude', 'Speed', 'Value'] },
    { label: 'What could improve?', options: ['Speed', 'Communication', 'Pricing', 'Accuracy'] },
  ],
  4: [
    { label: 'What stood out?', options: ['Professionalism', 'Speed', 'Quality', 'Friendly staff', 'Fair pricing'] },
    { label: 'Any room to improve?', options: ['Wait time', 'Pricing', 'Communication', 'Nothing - was great!'] },
  ],
  5: [
    { label: 'What impressed you most?', options: ['Speed', 'Quality of work', 'Friendliness', 'Professionalism', 'Great value'] },
    { label: 'How was communication?', options: ['Excellent', 'Very clear', 'Prompt', 'Kept me informed'] },
  ],
};

const FREE_MESSAGES: Record<number, string[]> = {
  1: [
    'Unfortunately my experience was disappointing. The service did not meet expectations and I had several unresolved concerns. I hope to see improvements in the future.',
    'I had a frustrating visit. Communication was lacking and the issues I came in with were not fully resolved. Would reconsider before returning.',
    'Not the experience I was hoping for. The quality fell short and the process felt disorganized. Hoping things improve.',
  ],
  2: [
    'Mixed experience overall. Some things went well but others left a lot to be desired. There is definite room for improvement.',
    'Service was okay but not what I expected. Staff was polite but the execution was below standard. Might give another chance.',
    'Below average experience. The work was done but not to the level I was hoping for. Communication could be better.',
  ],
  3: [
    'Decent service overall. Nothing extraordinary but the job got done. Staff was professional and the experience was adequate.',
    'Solid average experience. The team was helpful and the work was completed satisfactorily. A few improvements would make this a 5-star visit.',
    'Fair experience. The service met basic expectations and the staff was courteous. Would consider returning for future needs.',
  ],
  4: [
    'Great experience with Adams Telecom Systems! The team was professional and resolved my issue efficiently. Would definitely recommend.',
    'Really impressed with the service quality. Staff was knowledgeable and friendly throughout the whole process. Will be back!',
    'Very satisfied with my visit. Everything was handled professionally and the results were excellent. Happy to recommend to others.',
  ],
  5: [
    'Absolutely outstanding service! Adams Telecom Systems exceeded every expectation. The team was professional, fast, and incredibly helpful. Cannot recommend enough!',
    'Perfect experience from start to finish! The staff went above and beyond to make sure everything was done right. Five stars all the way!',
    'Incredible service! Knowledgeable team, fast turnaround, and exceptional quality work. This is exactly the kind of business that deserves loyal customers.',
  ],
};

const STAR_LABELS = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];
const STAR_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

function polishLocally(text: string): string {
  const closers = [
    'Highly recommend to anyone looking for reliable service.',
    'Would not hesitate to recommend them.',
    'A business that truly cares about its customers.',
  ];
  const closer = closers[Math.floor(Math.random() * closers.length)];
  let base = text.trim();
  base = base.charAt(0).toUpperCase() + base.slice(1);
  if (!/[.!?]$/.test(base)) base += '.';
  return `${base} ${closer}`;
}

export default function ReviewPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [starQuestions, setStarQuestions] = useState<Record<number, Question[]>>(DEFAULT_STAR_QUESTIONS);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [reviewCards, setReviewCards] = useState<string[]>([]);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [customText, setCustomText] = useState('');
  const [loading, setLoading] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const supabase = createClient();
    (async () => {
      const { data: biz, error } = await supabase
        .from('businesses')
        .select('id, name, type, google_review_url, plan, primary_color')
        .eq('slug', slug)
        .single();

      if (error || !biz) {
        setNotFound(true);
        setPageLoading(false);
        return;
      }
      setBusiness(biz);

      const { data: qRows } = await supabase
        .from('star_questions')
        .select('star, questions')
        .eq('business_id', biz.id);

      if (qRows && qRows.length > 0) {
        const map: Record<number, Question[]> = { ...DEFAULT_STAR_QUESTIONS };
        qRows.forEach((row) => {
          if (row.questions && Array.isArray(row.questions) && row.questions.length > 0) {
            map[row.star] = row.questions;
          }
        });
        setStarQuestions(map);
      }
      setPageLoading(false);
    })();
  }, [slug]);

  const displayStars = hovered || rating;
  const questions = rating > 0 ? starQuestions[rating] : [];
  const starColor = STAR_COLORS[displayStars] || '#f59e0b';

  const handleStarClick = (s: number) => {
    if (s === rating) return;
    setRating(s);
    setAnswers({});
    setReviewCards([]);
    setSelectedCard(null);
    setCustomText('');
  };

  const toggleAnswer = (questionLabel: string, opt: string) => {
    setAnswers((prev) => {
      const current = prev[questionLabel] || [];
      return {
        ...prev,
        [questionLabel]: current.includes(opt)
          ? current.filter((o) => o !== opt)
          : [...current, opt],
      };
    });
    setReviewCards([]);
    setSelectedCard(null);
    setCustomText('');
  };

  const handleGenerate = async () => {
    if (!business) return;
    setLoading(true);
    setSelectedCard(null);
    setCustomText('');

    if (business.plan === 'free') {
      await new Promise((r) => setTimeout(r, 500));
      setReviewCards(FREE_MESSAGES[rating] || FREE_MESSAGES[5]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/generate-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          star: rating,
          answers: Object.fromEntries(
            Object.entries(answers).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : v])
          ),
          businessName: business.name,
          businessType: business.type,
        }),
      });
      const data = await res.json();
      setReviewCards(
        data.reviews && Array.isArray(data.reviews)
          ? data.reviews
          : FREE_MESSAGES[rating] || FREE_MESSAGES[5]
      );
    } catch {
      setReviewCards(FREE_MESSAGES[rating] || FREE_MESSAGES[5]);
    }
    setLoading(false);
  };

  const getActiveText = () => {
    if (customText.trim()) return customText.trim();
    if (selectedCard !== null) return reviewCards[selectedCard];
    return '';
  };

  const handlePolish = async () => {
    const text = getActiveText();
    if (!text || polishing) return;
    setPolishing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setCustomText(polishLocally(text));
    setSelectedCard(null);
    setPolishing(false);
  };

  const handleCopyAndGo = async () => {
    const text = getActiveText();
    if (!text || !business) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);

    // Save review to DB
    const supabase = createClient();
    await supabase.from('reviews').insert({
      business_id: business.id,
      star: rating,
      answers,
      selected_message: text,
    });

    setTimeout(() => {
      setCopied(false);
      const url = business.google_review_url || 'https://www.google.com/maps';
      window.open(url, '_blank');
    }, 900);
  };

  const canProceed = !!getActiveText();

  if (pageLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={32} color="#0F766E" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#6B7280', fontSize: 14 }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Business not found</h1>
          <p style={{ color: '#6B7280', fontSize: 14 }}>This review page doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // ── Shared style objects ──
  const S = {
    page: {
      minHeight: '100vh',
      background: '#FAFAF8',
      paddingBottom: 120,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    } as React.CSSProperties,
    wrap: {
      maxWidth: 480,
      margin: '0 auto',
      padding: '32px 20px 0',
    } as React.CSSProperties,
    card: {
      background: '#ffffff',
      border: '1px solid #E5E7EB',
      borderRadius: 16,
      boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)',
      padding: 20,
      marginBottom: 12,
    } as React.CSSProperties,
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rb-fadeup { animation: fadeUp 0.3s ease-out both; }
        .rb-star-btn { background: none; border: none; cursor: pointer; padding: 6px; display: inline-flex; align-items: center; justify-content: center; transition: transform 0.15s; }
        .rb-star-btn:active { transform: scale(0.88); }
        .rb-pill { cursor: pointer; border-radius: 999px; font-size: 13px; font-weight: 500; padding: 7px 14px; transition: all 0.15s; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
        .rb-pill:active { transform: scale(0.96); }
        .rb-card-btn { width: 100%; text-align: left; cursor: pointer; border-radius: 14px; padding: 16px; transition: all 0.15s; position: relative; display: block; }
        .rb-card-btn:active { transform: scale(0.99); }
        .rb-primary-btn { width: 100%; border: none; border-radius: 12px; padding: 15px 24px; font-size: 15px; font-weight: 600; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.15s; }
        .rb-primary-btn:active { transform: scale(0.98); }
        .rb-primary-btn:disabled { opacity: 0.65; cursor: not-allowed; }
      `}</style>

      <div style={S.page}>
        <div style={S.wrap}>

          {/* ── Business Header ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 22,
              boxShadow: '0 4px 14px rgba(15,118,110,0.3)',
              marginBottom: 14,
            }}>
              {business.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
              {business.name}
            </div>
            <div style={{ fontSize: 14, color: '#6B7280' }}>{business.type || 'Local Business'}</div>
          </div>

          {/* ── Star Rating ── */}
          <div style={{ ...S.card, textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16 }}>
              How was your experience?
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  className="rb-star-btn"
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => handleStarClick(s)}
                  aria-label={`${s} star`}
                  style={{ transform: displayStars >= s ? 'scale(1.2)' : 'scale(1)' }}
                >
                  <Star
                    size={40}
                    fill={displayStars >= s ? starColor : 'transparent'}
                    color={displayStars >= s ? starColor : '#D1D5DB'}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            <div style={{
              fontSize: 13, fontWeight: 600, height: 20,
              color: starColor,
              opacity: displayStars > 0 ? 1 : 0,
              transition: 'opacity 0.2s',
            }}>
              {STAR_LABELS[displayStars]}
            </div>
          </div>

          {/* ── Questions ── */}
          {rating > 0 && (
            <div className="rb-fadeup">
              <div style={S.card}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 16 }}>
                  Tell us more{' '}
                  <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {questions.map((q, qi) => (
                    <div key={`${rating}-${qi}`}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
                        {q.label}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {q.options.map((opt) => {
                          const selected = (answers[q.label] || []).includes(opt);
                          return (
                            <button
                              key={opt}
                              className="rb-pill"
                              onClick={() => toggleAnswer(q.label, opt)}
                              style={{
                                background: selected ? '#0F766E' : '#F9FAFB',
                                color: selected ? '#ffffff' : '#374151',
                                border: selected ? '1.5px solid #0F766E' : '1.5px solid #D1D5DB',
                                boxShadow: selected ? '0 2px 8px rgba(15,118,110,0.25)' : 'none',
                              }}
                            >
                              {selected && <Check size={11} strokeWidth={3} />}
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate button */}
              <button
                className="rb-primary-btn"
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  background: loading ? '#5eaba4' : '#0F766E',
                  boxShadow: '0 4px 14px rgba(15,118,110,0.3)',
                  marginBottom: 8,
                }}
              >
                {loading
                  ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating reviews...</>
                  : <><Sparkles size={16} /> Generate My Reviews</>
                }
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

              {!loading && reviewCards.length === 0 && (
                <button
                  onClick={handleGenerate}
                  style={{
                    width: '100%', textAlign: 'center', fontSize: 13,
                    color: '#9CA3AF', background: 'none', border: 'none',
                    cursor: 'pointer', padding: '6px 0',
                  }}
                >
                  Skip questions &amp; generate
                </button>
              )}
            </div>
          )}

          {/* ── Review Cards ── */}
          {reviewCards.length > 0 && (
            <div className="rb-fadeup" style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>
                Choose a review to post:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {reviewCards.map((text, i) => {
                  const isSelected = selectedCard === i;
                  return (
                    <button
                      key={i}
                      className="rb-card-btn"
                      onClick={() => { setSelectedCard(i); setCustomText(''); }}
                      style={{
                        background: '#ffffff',
                        border: isSelected ? '2px solid #0F766E' : '1.5px solid #E5E7EB',
                        boxShadow: isSelected
                          ? '0 4px 16px rgba(15,118,110,0.12)'
                          : '0 1px 3px rgba(0,0,0,0.06)',
                      }}
                    >
                      {/* Checkmark */}
                      <div style={{
                        position: 'absolute', top: 12, right: 12,
                        width: 22, height: 22, borderRadius: '50%',
                        background: isSelected ? '#0F766E' : '#F3F4F6',
                        border: isSelected ? 'none' : '1.5px solid #D1D5DB',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isSelected && <Check size={12} color="white" strokeWidth={3} />}
                      </div>

                      {/* Star row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 8 }}>
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={12}
                            fill={rating >= s ? '#f59e0b' : 'transparent'}
                            color={rating >= s ? '#f59e0b' : '#E5E7EB'}
                            strokeWidth={1.5}
                          />
                        ))}
                        <span style={{
                          marginLeft: 8, fontSize: 11, fontWeight: 500,
                          padding: '2px 8px', borderRadius: 999,
                          background: business.plan === 'paid' ? 'rgba(15,118,110,0.1)' : '#F3F4F6',
                          color: business.plan === 'paid' ? '#0F766E' : '#9CA3AF',
                        }}>
                          {business.plan === 'paid' ? '✨ AI-powered' : 'Standard'}
                        </span>
                      </div>

                      <div style={{ fontSize: 14, lineHeight: 1.65, color: '#374151', paddingRight: 28 }}>
                        {text}
                      </div>
                      {!isSelected && (
                        <div style={{ fontSize: 12, color: '#D1D5DB', marginTop: 8 }}>
                          Tap to select
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
                <span style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>or write your own</span>
                <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
              </div>

              {/* Textarea */}
              <textarea
                value={customText}
                onChange={(e) => { setCustomText(e.target.value); setSelectedCard(null); }}
                placeholder="Write your own review here..."
                rows={4}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 14,
                  resize: 'none', outline: 'none', lineHeight: 1.6,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  background: '#ffffff',
                  border: customText ? '2px solid #0F766E' : '1.5px solid #D1D5DB',
                  color: '#111827',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
              />

              {/* Polish button */}
              <button
                onClick={handlePolish}
                disabled={!getActiveText() || polishing}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 500, marginTop: 8,
                  color: polishing ? '#9CA3AF' : '#0F766E',
                  opacity: !getActiveText() ? 0.4 : 1,
                  cursor: !getActiveText() || polishing ? 'not-allowed' : 'pointer',
                  background: 'none', border: 'none', padding: 0,
                }}
              >
                {polishing
                  ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Polishing...</>
                  : <><Sparkles size={14} /> Polish my message</>
                }
              </button>
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 40, paddingBottom: 16 }}>
            <span style={{ fontSize: 12, color: '#D1D5DB' }}>Powered by ReviewBoost</span>
          </div>
        </div>
      </div>

      {/* ── Fixed bottom CTA ── */}
      {canProceed && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '12px 20px 20px',
          background: 'rgba(250,250,248,0.96)',
          borderTop: '1px solid #E5E7EB',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <button
              className="rb-primary-btn"
              onClick={handleCopyAndGo}
              style={{
                background: copied
                  ? 'linear-gradient(135deg, #059669, #047857)'
                  : '#0F766E',
                boxShadow: '0 4px 20px rgba(15,118,110,0.35)',
                fontSize: 15,
              }}
            >
              {copied
                ? <><Check size={17} strokeWidth={3} /> Copied to clipboard!</>
                : <><Copy size={16} /> Copy &amp; Open Google <ExternalLink size={14} /></>
              }
            </button>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
              Paste in Google Reviews and submit
            </div>
          </div>
        </div>
      )}
    </>
  );
}
