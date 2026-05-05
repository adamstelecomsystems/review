'use client';

import { useState, useEffect } from 'react';
import {
  Star,
  Trash2,
  Plus,
  Save,
  Check,
  X,
  ExternalLink,
  Loader2,
  Zap,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg: '#FAFAF8',
  surface: '#FFFFFF',
  surface2: '#F4F4F2',
  border: '#E5E7EB',
  borderInput: '#D1D5DB',
  text: '#111827',
  textMid: '#374151',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  primary: '#0F766E',
  primaryMuted: 'rgba(15,118,110,0.08)',
  primaryLight: 'rgba(15,118,110,0.2)',
  success: '#059669',
  danger: '#DC2626',
  warning: '#D97706',
  shadowCard: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
  shadowSm: '0 1px 2px rgba(0,0,0,0.06)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#F9FAFB',
  border: '1.5px solid #D1D5DB',
  borderRadius: 10,
  padding: '11px 14px',
  fontSize: 14,
  color: C.text,
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

// ─── Types ───────────────────────────────────────────────────────────────────

type Question = { label: string; options: string[] };
type StarQuestions = Record<number, Question[]>;

// ─── Constants ───────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  'Restaurant',
  'Hotel',
  'Spa/Salon',
  'Bar/Club',
  'Retail',
  'Service/Repair',
  'Other',
];

const PRESET_COLORS = [
  { label: 'Teal', value: '#0F766E' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Green', value: '#10b981' },
  { label: 'Orange', value: '#f97316' },
];

const INITIAL_QUESTIONS: StarQuestions = {
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

// ─── Shared input component ───────────────────────────────────────────────────

function LightInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
    />
  );
}

// ─── Pill tab ─────────────────────────────────────────────────────────────────

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 18px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 500,
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
        background: active ? C.primary : 'transparent',
        color: active ? 'white' : C.muted,
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

// ─── Phone Preview ────────────────────────────────────────────────────────────

function PhonePreview({
  name,
  tagline,
  initials,
  color,
}: {
  name: string;
  tagline: string;
  initials: string;
  color: string;
}) {
  return (
    <div
      style={{
        borderRadius: 30,
        padding: 10,
        background: '#E5E7EB',
        border: '3px solid #D1D5DB',
        width: 220,
        minHeight: 420,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}
    >
      {/* Phone notch */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
        <div style={{ width: 60, height: 5, borderRadius: 99, background: '#C4C4C4' }} />
      </div>

      {/* Screen */}
      <div
        style={{ borderRadius: 22, padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: C.bg, minHeight: 370 }}
      >
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: i === 0 ? 18 : 6,
                height: 6,
                borderRadius: 99,
                background: i === 0 ? color : '#E5E7EB',
              }}
            />
          ))}
        </div>

        {/* Logo */}
        <div
          style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 14, marginBottom: 8, background: `linear-gradient(135deg, ${color}, ${color}99)`, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
        >
          {initials.slice(0, 2).toUpperCase() || 'AT'}
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, textAlign: 'center', marginBottom: 2, color: C.text }}>{name || 'Business Name'}</p>
        <p style={{ fontSize: 9, textAlign: 'center', marginBottom: 14, color: C.subtle }}>{tagline || 'Your tagline here'}</p>

        <p style={{ fontSize: 10, fontWeight: 600, marginBottom: 10, textAlign: 'center', color: C.text }}>How was your experience?</p>

        {/* Stars */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={18} fill={color} color={color} strokeWidth={1} />
          ))}
        </div>
        <p style={{ fontSize: 9, fontWeight: 500, marginBottom: 14, color }}> Excellent</p>

        {/* Pill options preview */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginBottom: 14 }}>
          {['Speed', 'Quality', 'Friendly'].map((opt) => (
            <span
              key={opt}
              style={{
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: 8,
                background: C.surface,
                border: `1px solid ${C.border}`,
                color: C.muted,
              }}
            >
              {opt}
            </span>
          ))}
        </div>

        {/* CTA button */}
        <div
          style={{ width: '100%', borderRadius: 10, padding: '8px 0', textAlign: 'center', fontSize: 9, fontWeight: 600, color: 'white', background: `linear-gradient(135deg, ${color}, ${color}99)` }}
        >
          Generate My Review
        </div>
      </div>
    </div>
  );
}

// ─── Business Info Tab ─────────────────────────────────────────────────────────

function BusinessInfoTab({
  info,
  onChange,
  onSave,
}: {
  info: { name: string; tagline: string; type: string; googleUrl: string; website: string };
  onChange: (key: string, val: string) => void;
  onSave: () => Promise<void>;
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 6 }}>Business Name</label>
        <LightInput value={info.name} onChange={(v) => onChange('name', v)} placeholder="Adams Telecom Systems" />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 6 }}>Tagline</label>
        <LightInput value={info.tagline} onChange={(v) => onChange('tagline', v)} placeholder="Your trusted local partner" />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 6 }}>Business Type</label>
        <div style={{ position: 'relative' }}>
          <select
            value={info.type}
            onChange={(e) => onChange('type', e.target.value)}
            style={{ ...inputStyle, appearance: 'none', paddingRight: 36 }}
          >
            {BUSINESS_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: C.subtle }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 6 }}>Company Website</label>
        <LightInput value={info.website} onChange={(v) => onChange('website', v)} placeholder="https://adamstelecom.com" />
        <p style={{ fontSize: 12, color: C.subtle, marginTop: 5 }}>Shown on your printed QR card</p>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 6 }}>Google Review URL</label>
        <div style={{ position: 'relative' }}>
          <input
            type="url"
            value={info.googleUrl}
            onChange={(e) => onChange('googleUrl', e.target.value)}
            style={{ ...inputStyle, paddingRight: 40 }}
            placeholder="https://g.page/r/..."
          />
          <ExternalLink size={14} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: C.subtle, pointerEvents: 'none' }} />
        </div>
        <p style={{ fontSize: 12, color: C.subtle, marginTop: 5 }}>
          Find this in Google Business Profile &rarr; Get more reviews
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: saved ? 'rgba(5,150,105,0.08)' : C.primary,
          color: saved ? C.success : 'white',
          border: saved ? '1px solid rgba(5,150,105,0.3)' : 'none',
          opacity: saving ? 0.7 : 1,
          cursor: saving ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          alignSelf: 'flex-start',
          transition: 'background 0.15s',
        }}
      >
        {saving ? (
          <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
        ) : saved ? (
          <><Check size={14} /> Saved!</>
        ) : (
          <><Save size={14} /> Save</>
        )}
      </button>
    </div>
  );
}

// ─── Review Questions Tab ─────────────────────────────────────────────────────

function ReviewQuestionsTab({
  questions,
  onChange,
  onSave,
}: {
  questions: StarQuestions;
  onChange: (q: StarQuestions) => void;
  onSave: (star: number) => Promise<void>;
}) {
  const [activeStar, setActiveStar] = useState(5);
  const [newOptionInputs, setNewOptionInputs] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const starQuestions = questions[activeStar] || [];
  const MAX_QUESTIONS = 3;

  const updateQuestion = (qi: number, updated: Question) => {
    const updated_list = starQuestions.map((q, i) => (i === qi ? updated : q));
    onChange({ ...questions, [activeStar]: updated_list });
  };

  const deleteQuestion = (qi: number) => {
    onChange({ ...questions, [activeStar]: starQuestions.filter((_, i) => i !== qi) });
  };

  const addQuestion = () => {
    if (starQuestions.length >= MAX_QUESTIONS) return;
    onChange({ ...questions, [activeStar]: [...starQuestions, { label: 'New question', options: [] }] });
  };

  const removeOption = (qi: number, opt: string) => {
    const q = starQuestions[qi];
    updateQuestion(qi, { ...q, options: q.options.filter((o) => o !== opt) });
  };

  const addOption = (qi: number) => {
    const key = `${activeStar}-${qi}`;
    const val = (newOptionInputs[key] || '').trim();
    if (!val) return;
    const q = starQuestions[qi];
    if (!q.options.includes(val)) {
      updateQuestion(qi, { ...q, options: [...q.options, val] });
    }
    setNewOptionInputs((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSaveQuestions = async () => {
    setSaving(true);
    await onSave(activeStar);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Star sub-tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => setActiveStar(s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 999, fontSize: 13, fontWeight: 500,
              background: activeStar === s ? C.primary : C.surface,
              color: activeStar === s ? 'white' : C.muted,
              border: activeStar === s ? 'none' : `1px solid ${C.border}`,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
          >
            {s}
            <Star size={11} fill={activeStar === s ? 'white' : C.border} color="transparent" />
          </button>
        ))}
      </div>

      {/* Questions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {starQuestions.map((q, qi) => {
          const optKey = `${activeStar}-${qi}`;
          return (
            <div
              key={qi}
              style={{ padding: 16, borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}
            >
              {/* Question label row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, background: C.primaryMuted, color: C.primary }}>
                  {qi + 1}
                </span>
                <input
                  type="text"
                  value={q.label}
                  onChange={(e) => updateQuestion(qi, { ...q, label: e.target.value })}
                  style={{ flex: 1, background: 'transparent', fontSize: 13, fontWeight: 500, outline: 'none', border: 'none', borderBottom: `1px solid ${C.border}`, paddingBottom: 3, color: C.text, fontFamily: 'inherit' }}
                />
                <button
                  onClick={() => deleteQuestion(qi)}
                  style={{ padding: 4, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: C.subtle, display: 'flex', alignItems: 'center' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.danger)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.subtle)}
                  title="Delete question"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Options chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {q.options.map((opt) => (
                  <span
                    key={opt}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, fontSize: 12, background: '#F3F4F6', border: `1px solid ${C.border}`, color: C.textMid }}
                  >
                    {opt}
                    <button
                      onClick={() => removeOption(qi, opt)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.subtle, display: 'flex', alignItems: 'center', padding: 0, lineHeight: 1 }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = C.danger)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = C.subtle)}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add option input */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={newOptionInputs[optKey] || ''}
                  onChange={(e) =>
                    setNewOptionInputs((prev) => ({ ...prev, [optKey]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === 'Enter' && addOption(qi)}
                  placeholder="Add option, press Enter"
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 8, fontSize: 12, background: C.surface2, border: `1px solid ${C.border}`, color: C.text, outline: 'none', fontFamily: 'inherit' }}
                />
                <button
                  onClick={() => addOption(qi)}
                  style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: C.primaryMuted, color: C.primary, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add question */}
      <button
        onClick={addQuestion}
        disabled={starQuestions.length >= MAX_QUESTIONS}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500,
          background: starQuestions.length >= MAX_QUESTIONS ? C.surface2 : C.primaryMuted,
          color: starQuestions.length >= MAX_QUESTIONS ? C.subtle : C.primary,
          border: starQuestions.length >= MAX_QUESTIONS ? `1px dashed ${C.border}` : `1px dashed ${C.primary}`,
          cursor: starQuestions.length >= MAX_QUESTIONS ? 'not-allowed' : 'pointer',
          alignSelf: 'flex-start',
          fontFamily: 'inherit',
        }}
      >
        <Plus size={15} />
        Add Question
        {starQuestions.length >= MAX_QUESTIONS && (
          <span style={{ fontSize: 11, color: C.subtle }}>(max 3)</span>
        )}
      </button>

      <button
        onClick={handleSaveQuestions}
        disabled={saving}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: saved ? 'rgba(5,150,105,0.08)' : C.primary,
          color: saved ? C.success : 'white',
          border: saved ? '1px solid rgba(5,150,105,0.3)' : 'none',
          opacity: saving ? 0.7 : 1,
          cursor: saving ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          alignSelf: 'flex-start',
        }}
      >
        {saving ? (
          <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
        ) : saved ? (
          <><Check size={14} /> Saved!</>
        ) : (
          <><Save size={14} /> Save Questions</>
        )}
      </button>
    </div>
  );
}

// ─── Branding Tab ─────────────────────────────────────────────────────────────

function BrandingTab({
  color,
  initials,
  onColorChange,
  onInitialsChange,
  plan,
  onSave,
}: {
  color: string;
  initials: string;
  onColorChange: (c: string) => void;
  onInitialsChange: (s: string) => void;
  plan: 'free' | 'paid';
  onSave: () => Promise<void>;
}) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveBranding = async () => {
    setSaving(true);
    await onSave();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  const [customHex, setCustomHex] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const isPreset = PRESET_COLORS.some((c) => c.value === color);
  void isPreset;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Logo upload */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 12 }}>Business Logo</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{ width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 20, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', background: logoPreview ? 'transparent' : `linear-gradient(135deg, ${color}, ${color}99)` }}
          >
            {logoPreview
              ? <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (initials.slice(0, 2).toUpperCase() || 'AT')
            }
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label
              style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: C.surface, border: `1px solid ${C.border}`, color: C.text, boxShadow: C.shadowSm }}
            >
              Upload Logo
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
            </label>
            {logoPreview && (
              <button onClick={() => setLogoPreview(null)} style={{ fontSize: 12, color: C.danger, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                Remove logo
              </button>
            )}
            <p style={{ fontSize: 11, color: C.subtle }}>PNG, JPG up to 2MB</p>
          </div>
        </div>
      </div>

      {/* Initials */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 6 }}>
          Initials <span style={{ color: C.subtle, fontWeight: 400 }}>(shown if no logo)</span>
        </label>
        <input
          type="text"
          value={initials}
          onChange={(e) => onInitialsChange(e.target.value.slice(0, 2))}
          maxLength={2}
          placeholder="AT"
          style={{ ...inputStyle, width: 80, textAlign: 'center', fontWeight: 700, fontSize: 18, textTransform: 'uppercase' }}
        />
      </div>

      {/* Primary color */}
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 12 }}>Primary Color</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          {PRESET_COLORS.map((c) => {
            const active = color === c.value;
            return (
              <button
                key={c.value}
                onClick={() => onColorChange(c.value)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
                  background: active ? `${c.value}14` : C.surface,
                  border: active ? `2px solid ${c.value}` : `2px solid ${C.border}`,
                  color: active ? c.value : C.muted,
                  boxShadow: C.shadowSm,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'border 0.15s',
                }}
              >
                <span style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, background: c.value }} />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Custom hex */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: customHex.length === 7 ? customHex : C.border, border: `1px solid ${C.border}` }}
          />
          <input
            type="text"
            value={customHex}
            onChange={(e) => {
              const v = e.target.value;
              setCustomHex(v);
              if (/^#[0-9a-fA-F]{6}$/.test(v)) onColorChange(v);
            }}
            placeholder="#0F766E"
            maxLength={7}
            style={{ ...inputStyle, width: 120, fontFamily: 'monospace', fontSize: 13 }}
          />
          <span style={{ fontSize: 12, color: C.subtle }}>Custom hex</span>
        </div>
      </div>

      {/* Plan badge */}
      <div
        style={{
          padding: 16, borderRadius: 14,
          background: plan === 'paid' ? C.primaryMuted : C.surface2,
          border: `1px solid ${C.border}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Zap size={15} color={plan === 'paid' ? C.primary : C.muted} />
              <span style={{ fontSize: 13, fontWeight: 600, color: plan === 'paid' ? C.primary : C.text }}>
                {plan === 'paid' ? 'Pro Plan' : 'Free Plan'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: C.muted }}>
              {plan === 'paid'
                ? 'AI-generated reviews, unlimited responses, priority support.'
                : 'Standard review templates. Upgrade for AI-powered personalization.'}
            </p>
          </div>
          {plan === 'free' && (
            <button
              style={{ marginLeft: 16, padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, flexShrink: 0, color: 'white', background: C.primary, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Upgrade
            </button>
          )}
        </div>
      </div>

      <button
        onClick={handleSaveBranding}
        disabled={saving}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: saved ? 'rgba(5,150,105,0.08)' : C.primary, color: saved ? C.success : 'white', border: saved ? '1px solid rgba(5,150,105,0.3)' : 'none', opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start', transition: 'background 0.15s' }}
      >
        {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Branding</>}
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SetupPage() {
  const [activeTab, setActiveTab] = useState<'info' | 'questions' | 'branding'>('info');
  const [previewStarView, setPreviewStarView] = useState(5);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [bizId, setBizId] = useState('');
  const [plan, setPlan] = useState<'free' | 'paid'>('free');

  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    tagline: '',
    type: 'Service/Repair',
    googleUrl: '',
    website: '',
  });

  const [questions, setQuestions] = useState<StarQuestions>(INITIAL_QUESTIONS);
  const [primaryColor, setPrimaryColor] = useState('#0F766E');
  const [initials, setInitials] = useState('');

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: biz } = await supabase.from('businesses').select('id, name, type, google_review_url, primary_color, plan, website').single();
      if (!biz) return;
      setBizId(biz.id);
      setPlan(biz.plan || 'free');
      setBusinessInfo({ name: biz.name || '', tagline: '', type: biz.type || 'Service/Repair', googleUrl: biz.google_review_url || '', website: biz.website || '' });
      setPrimaryColor(biz.primary_color || '#0F766E');
      const auto = (biz.name || '').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
      setInitials(auto || 'AT');

      const { data: qRows } = await supabase.from('star_questions').select('star, questions').eq('business_id', biz.id);
      if (qRows && qRows.length > 0) {
        const map: StarQuestions = { ...INITIAL_QUESTIONS };
        qRows.forEach((r) => { if (r.questions?.length > 0) map[r.star] = r.questions; });
        setQuestions(map);
      }
    })();
  }, []);

  const handleBusinessChange = (key: string, val: string) => {
    setBusinessInfo((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveInfo = async () => {
    if (!bizId) return;
    const supabase = createClient();
    await supabase.from('businesses').update({
      name: businessInfo.name,
      type: businessInfo.type,
      google_review_url: businessInfo.googleUrl,
      primary_color: primaryColor,
      website: businessInfo.website,
    }).eq('id', bizId);
  };

  const handleSaveQuestions = async (star: number) => {
    if (!bizId) return;
    const supabase = createClient();
    await supabase.from('star_questions').upsert({
      business_id: bizId,
      star,
      questions: questions[star] || [],
    }, { onConflict: 'business_id,star' });
  };

  const handleSaveBranding = async () => {
    if (!bizId) return;
    const supabase = createClient();
    await supabase.from('businesses').update({ primary_color: primaryColor }).eq('id', bizId);
  };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: C.text }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: '-0.3px', marginBottom: 4 }}>Business Setup</h1>
          <p style={{ fontSize: 14, color: C.muted }}>Configure your review page and see a live customer preview.</p>
        </div>

        {/* Split layout */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

          {/* LEFT: Form (60%) */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Pill tab bar */}
            <div
              style={{
                display: 'inline-flex', gap: 4, padding: '5px', borderRadius: 999, marginBottom: 20,
                background: '#F0F0EE',
                border: `1px solid ${C.border}`,
              }}
            >
              <Tab active={activeTab === 'info'} onClick={() => setActiveTab('info')}>Business Info</Tab>
              <Tab active={activeTab === 'questions'} onClick={() => setActiveTab('questions')}>Review Questions</Tab>
              <Tab active={activeTab === 'branding'} onClick={() => setActiveTab('branding')}>Branding</Tab>
            </div>

            {/* Tab content card */}
            <div
              style={{ padding: 28, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}`, boxShadow: C.shadowCard }}
            >
              {activeTab === 'info' && (
                <BusinessInfoTab info={businessInfo} onChange={handleBusinessChange} onSave={handleSaveInfo} />
              )}
              {activeTab === 'questions' && (
                <ReviewQuestionsTab questions={questions} onChange={setQuestions} onSave={handleSaveQuestions} />
              )}
              {activeTab === 'branding' && (
                <BrandingTab
                  color={primaryColor}
                  initials={initials}
                  onColorChange={setPrimaryColor}
                  onInitialsChange={setInitials}
                  plan={plan}
                  onSave={handleSaveBranding}
                />
              )}
            </div>

            {/* Mobile preview toggle */}
            <button
              onClick={() => setShowPreviewMobile((v) => !v)}
              style={{
                display: 'none',
                marginTop: 16,
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 500,
                padding: '9px 16px',
                borderRadius: 10,
                background: C.surface,
                border: `1px solid ${C.border}`,
                color: C.muted,
                boxShadow: C.shadowSm,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              className="mobile-preview-toggle"
            >
              {showPreviewMobile ? 'Hide Preview' : 'Show Customer Preview'}
            </button>

            {/* Mobile stacked preview */}
            {showPreviewMobile && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.muted }}>Customer Preview</span>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map((s) => (
                      <button key={s} onClick={() => setPreviewStarView(s)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}>
                        <Star size={16} fill={previewStarView >= s ? '#f59e0b' : 'transparent'} color={previewStarView >= s ? '#f59e0b' : C.border} strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                </div>
                <PhonePreview name={businessInfo.name} tagline={businessInfo.tagline} initials={initials} color={primaryColor} />
              </div>
            )}
          </div>

          {/* RIGHT: Preview (40%) — desktop only */}
          <div style={{ width: 290, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'sticky', top: 32 }} className="preview-panel">
            <style>{`
              @media (max-width: 1023px) { .preview-panel { display: none !important; } .mobile-preview-toggle { display: inline-flex !important; } }
            `}</style>
            {/* Preview header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.muted }}>Customer Preview</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {[1,2,3,4,5].map((s) => (
                  <button key={s} onClick={() => setPreviewStarView(s)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.1s' }}>
                    <Star size={16} fill={previewStarView >= s ? '#f59e0b' : 'transparent'} color={previewStarView >= s ? '#f59e0b' : '#D1D5DB'} strokeWidth={1.5} />
                  </button>
                ))}
                <span style={{ fontSize: 11, color: C.subtle, marginLeft: 4 }}>{previewStarView}★ view</span>
              </div>
            </div>

            <PhonePreview
              name={businessInfo.name}
              tagline={businessInfo.tagline}
              initials={initials}
              color={primaryColor}
            />

            <p style={{ fontSize: 12, textAlign: 'center', color: C.subtle }}>Updates live as you edit</p>
          </div>
        </div>
      </div>
    </div>
  );
}
