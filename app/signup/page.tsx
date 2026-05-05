'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ArrowRight, Building2, Mail, Lock } from 'lucide-react';
import gsap from 'gsap';
import { createClient } from '@/lib/supabase/client';

const C = {
  bg: '#FAFAF8',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  borderInput: '#D1D5DB',
  text: '#111827',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  primary: '#0F766E',
  primaryMuted: 'rgba(15,118,110,0.08)',
  primaryLight: 'rgba(15,118,110,0.2)',
  shadowCard: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
  shadowLg: '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#F9FAFB',
  border: '1.5px solid #D1D5DB',
  borderRadius: 10,
  padding: '12px 14px 12px 40px',
  fontSize: 14,
  color: C.text,
  outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'inherit',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: '#F9FAFB',
  border: '1.5px solid #D1D5DB',
  borderRadius: 10,
  padding: '12px 14px',
  fontSize: 14,
  color: C.text,
  outline: 'none',
  appearance: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'inherit',
};

const businessTypes = [
  'Restaurant',
  'Hotel',
  'Spa / Salon',
  'Bar / Club',
  'Retail',
  'Service / Repair',
  'Other',
];

const features = [
  'Branded QR code in minutes',
  'AI-powered review messages',
  'Real-time analytics dashboard',
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: '',
    email: '',
    password: '',
    businessType: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ctx = gsap.context(() => {
      if (formRef.current) {
        gsap.from(Array.from(formRef.current.children), {
          y: 24,
          opacity: 0,
          stagger: 0.1,
          duration: 0.55,
          ease: 'power2.out',
        });
      }
      if (leftRef.current) {
        gsap.from(Array.from(leftRef.current.children), {
          y: 20,
          opacity: 0,
          stagger: 0.12,
          duration: 0.6,
          ease: 'power2.out',
          delay: 0.1,
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          business_name: form.businessName,
          business_type: form.businessType,
        },
      },
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    // 2. Create business record
    const slug = form.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { error: bizError } = await supabase.from('businesses').insert({
      user_id: authData.user!.id,
      name: form.businessName,
      slug,
      type: form.businessType,
      plan: 'free',
    });

    setLoading(false);
    if (bizError) {
      // Business insert failed (email not confirmed yet) — dashboard will retry on load
      console.warn('Business insert failed, will retry on dashboard load:', bizError.message);
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{`
        @media (min-width: 1024px) { .auth-left { display: flex !important; } }
        .rb-input:focus { border-color: #0F766E !important; }
        .rb-select:focus { border-color: #0F766E !important; }
      `}</style>

      {/* ── LEFT: Teal brand panel ─────────────────────────────────────────── */}
      <div
        className="auth-left"
        style={{
          display: 'none',
          width: '40%',
          flexShrink: 0,
          background: C.primary,
          padding: '40px',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div ref={leftRef}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Star size={17} fill="white" color="white" />
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>ReviewBoost</span>
          </Link>

          {/* Headline */}
          <div style={{ marginTop: 64 }}>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: 16, letterSpacing: '-0.5px' }}>
              Start collecting 5-star reviews today.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>
              Free forever plan. No credit card required. Set up in under 60 seconds.
            </p>
          </div>

          {/* Feature checklist */}
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {features.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: 14, color: 'white', opacity: 0.92 }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Testimonial card */}
          <div style={{ marginTop: 40, padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
              {[1,2,3,4,5].map((s) => <Star key={s} size={14} fill="#fbbf24" color="#fbbf24" />)}
            </div>
            <p style={{ fontSize: 14, color: 'white', lineHeight: 1.65, opacity: 0.92, marginBottom: 16 }}>
              &ldquo;Simple setup, incredible results. Our Google rating went from 3.9 to 4.7 in a month.&rdquo;
            </p>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'white' }}>Priya K.</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>Serenity Spa</div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          &copy; 2025 ReviewBoost. All rights reserved.
        </div>
      </div>

      {/* ── RIGHT: Form panel ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: C.bg }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div ref={formRef} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 6, letterSpacing: '-0.3px' }}>
                Create your account
              </h1>
              <p style={{ fontSize: 14, color: C.muted }}>
                Start collecting 5-star reviews today — free forever
              </p>
            </div>

            {/* Card */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: C.shadowLg, padding: '36px 32px' }}>
              {error && (
                <div style={{ marginBottom: 4, padding: '12px 16px', borderRadius: 10, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: '#DC2626', fontSize: 13 }}>
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Business Name */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                    Business Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.subtle, pointerEvents: 'none' }} />
                    <input
                      type="text"
                      name="businessName"
                      value={form.businessName}
                      onChange={handleChange}
                      required
                      placeholder="Adams Telecom Systems"
                      className="rb-input"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.subtle, pointerEvents: 'none' }} />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@yourbusiness.com"
                      className="rb-input"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.subtle, pointerEvents: 'none' }} />
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="Min. 8 characters"
                      minLength={8}
                      className="rb-input"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Business Type */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>
                    Business Type
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      name="businessType"
                      value={form.businessType}
                      onChange={handleChange}
                      required
                      className="rb-select"
                      style={{ ...selectStyle, color: form.businessType ? C.text : C.subtle }}
                    >
                      <option value="" disabled>Select your business type</option>
                      {businessTypes.map((t) => (
                        <option key={t} value={t} style={{ color: C.text, background: C.surface }}>{t}</option>
                      ))}
                    </select>
                    {/* Arrow icon */}
                    <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: C.subtle }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px 24px', borderRadius: 10, background: loading ? '#5eada8' : C.primary, color: 'white', fontWeight: 600, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4, transition: 'background 0.15s', fontFamily: 'inherit' }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin" style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                        <path style={{ opacity: 0.75 }} fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    <>Create Account <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              {/* Sign in link */}
              <p style={{ textAlign: 'center', fontSize: 14, color: C.muted, marginTop: 24 }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: C.primary, fontWeight: 600, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </p>
            </div>

            {/* Terms */}
            <p style={{ textAlign: 'center', fontSize: 12, color: C.subtle, marginTop: 20 }}>
              By creating an account you agree to our{' '}
              <span style={{ color: C.primary, cursor: 'pointer' }}>Terms of Service</span> and{' '}
              <span style={{ color: C.primary, cursor: 'pointer' }}>Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
