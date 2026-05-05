'use client';

import { useState, useEffect } from 'react';
import { User, CreditCard, AlertTriangle, CheckCircle, Zap, Lock, Mail, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const C = {
  bg: '#FAFAF8', surface: '#FFFFFF', surface2: '#F4F4F2', border: '#E5E7EB', borderInput: '#D1D5DB',
  text: '#111827', muted: '#6B7280', subtle: '#9CA3AF', primary: '#0F766E',
  primaryMuted: 'rgba(15,118,110,0.08)', primaryLight: 'rgba(15,118,110,0.2)',
  success: '#059669', danger: '#DC2626',
  shadowCard: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
};

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#F9FAFB', border: '1.5px solid #D1D5DB', borderRadius: 10,
  padding: '11px 14px 11px 40px', fontSize: 14, color: C.text, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s',
};

const tabs = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'plan', label: 'Plan', icon: CreditCard },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

function AccountTab() {
  const [form, setForm] = useState({ name: '', email: '', newPassword: '', confirmPassword: '' });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState('free');

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setForm((prev) => ({ ...prev, email: user.email || '', name: user.user_metadata?.business_name || '' }));
      const { data: biz } = await supabase.from('businesses').select('name, plan').single();
      if (biz) { setForm((prev) => ({ ...prev, name: biz.name })); setPlan(biz.plan); }
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSave = async () => {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (form.newPassword && form.newPassword.length < 8) {
      setError('Password must be at least 8 characters'); return;
    }
    setSaving(true);
    setError('');
    const supabase = createClient();
    const updates: Record<string, string> = {};
    if (form.newPassword) updates.password = form.newPassword;

    if (Object.keys(updates).length > 0) {
      const { error: authErr } = await supabase.auth.updateUser(updates);
      if (authErr) { setError(authErr.message); setSaving(false); return; }
    }

    await supabase.from('businesses').update({ name: form.name }).eq('id', (await supabase.from('businesses').select('id').single()).data?.id);

    setSaving(false);
    setSaved(true);
    setForm((prev) => ({ ...prev, newPassword: '', confirmPassword: '' }));
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ padding: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 20 }}>Profile Information</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Business Name</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.subtle, pointerEvents: 'none' }} />
              <input type="text" name="name" value={form.name} onChange={handleChange} style={inputStyle} placeholder="Your business name" />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.subtle, pointerEvents: 'none' }} />
              <input type="email" name="email" value={form.email} onChange={handleChange} style={{ ...inputStyle, background: C.surface2, color: C.muted }} readOnly />
            </div>
            <p style={{ fontSize: 11, color: C.subtle, marginTop: 4 }}>Email cannot be changed in this version.</p>
          </div>
        </div>
      </div>

      <div style={{ padding: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 20 }}>Change Password</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.subtle, pointerEvents: 'none' }} />
              <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="Min. 8 characters" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.subtle, pointerEvents: 'none' }} />
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat new password" style={inputStyle} />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: C.danger, fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSave} disabled={saving}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, fontWeight: 600, fontSize: 14, background: saved ? 'rgba(5,150,105,0.08)' : C.primary, border: saved ? '1px solid rgba(5,150,105,0.3)' : 'none', color: saved ? C.success : 'white', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'inherit', transition: 'background 0.15s' }}>
          {saving ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : saved ? <><CheckCircle size={15} /> Saved!</> : 'Save Changes'}
        </button>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function PlanTab() {
  const [plan, setPlan] = useState('free');
  useEffect(() => {
    const supabase = createClient();
    supabase.from('businesses').select('plan').single().then(({ data }) => { if (data) setPlan(data.plan); });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div style={{ padding: 24, background: C.surface, border: `2px solid ${plan === 'free' ? C.primary : C.border}`, borderRadius: 14, boxShadow: C.shadowCard, position: 'relative' }}>
          {plan === 'free' && <div style={{ position: 'absolute', top: 16, right: 16, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: C.primaryMuted, color: C.primary }}>Current Plan</div>}
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 4 }}>Free</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: C.text, marginBottom: 20 }}>$0<span style={{ fontSize: 15, fontWeight: 400, color: C.muted }}>/mo</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {[{ text: '1 QR code', ok: true }, { text: 'Up to 50 reviews/mo', ok: true }, { text: 'Basic analytics', ok: true }, { text: 'AI review messages', ok: false }, { text: 'Multiple locations', ok: false }, { text: 'CSV export', ok: false }, { text: 'Priority support', ok: false }].map((f) => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <CheckCircle size={14} color={f.ok ? C.success : C.border} style={{ flexShrink: 0 }} />
                <span style={{ color: f.ok ? C.text : C.subtle, textDecoration: f.ok ? 'none' : 'line-through' }}>{f.text}</span>
              </div>
            ))}
          </div>
          <button disabled style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 500, background: C.surface2, border: `1px solid ${C.border}`, color: C.muted, cursor: 'default', fontFamily: 'inherit' }}>
            {plan === 'free' ? 'Current Plan' : 'Downgrade'}
          </button>
        </div>

        <div style={{ padding: 24, background: C.surface, border: `2px solid ${plan === 'paid' ? C.primary : C.border}`, borderRadius: 14, boxShadow: C.shadowCard, position: 'relative', overflow: 'hidden' }}>
          {plan === 'paid' && <div style={{ position: 'absolute', top: 16, right: 16, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: C.primaryMuted, color: C.primary }}>Current Plan</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Zap size={16} color={C.primary} />
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Pro</div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: C.text, marginBottom: 20 }}>$29<span style={{ fontSize: 15, fontWeight: 400, color: C.muted }}>/mo</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {['Unlimited QR codes', 'Unlimited reviews', 'Advanced analytics', 'AI review messages', 'Multiple locations', 'CSV export', 'Priority support'].map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <CheckCircle size={14} color={C.primary} style={{ flexShrink: 0 }} />
                <span style={{ color: C.text }}>{f}</span>
              </div>
            ))}
          </div>
          <button onClick={() => alert('Billing integration coming soon!')} style={{ width: '100%', padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: plan === 'paid' ? C.surface2 : C.primary, border: 'none', color: plan === 'paid' ? C.muted : 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
            {plan === 'paid' ? 'Current Plan' : 'Upgrade to Pro'}
          </button>
        </div>
      </div>
      <div style={{ padding: '14px 18px', borderRadius: 10, fontSize: 13, background: C.primaryMuted, border: `1px solid ${C.primaryLight}`, color: C.muted }}>
        <strong style={{ color: C.primary }}>30-day free trial</strong> on Pro. No credit card required. Cancel anytime.
      </div>
    </div>
  );
}

function DangerTab() {
  return (
    <div style={{ padding: 24, background: C.surface, border: '1px solid rgba(220,38,38,0.2)', borderRadius: 14, boxShadow: C.shadowCard }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <AlertTriangle size={18} color={C.danger} />
        <h3 style={{ fontSize: 15, fontWeight: 600, color: C.danger }}>Danger Zone</h3>
      </div>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>These actions are permanent and cannot be undone.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[{ title: 'Delete all reviews', desc: 'Permanently remove all collected reviews from your account.', btn: 'Delete Reviews' }, { title: 'Delete account', desc: 'Permanently delete your account and all associated data.', btn: 'Delete Account' }].map((item) => (
          <div key={item.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 10, background: C.surface2, border: `1px solid ${C.border}`, gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 3 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{item.desc}</div>
            </div>
            <button disabled style={{ padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: C.danger, opacity: 0.5, cursor: 'not-allowed', fontFamily: 'inherit', flexShrink: 0 }}>
              {item.btn}
            </button>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: C.subtle, marginTop: 16 }}>Destructive actions are disabled in this version.</p>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, letterSpacing: '-0.3px', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 14, color: C.muted }}>Manage your account, plan, and preferences.</p>
      </div>
      <div style={{ display: 'flex', padding: '5px', borderRadius: 12, marginBottom: 24, background: C.surface2, border: `1px solid ${C.border}`, gap: 4 }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 9, fontSize: 13, fontWeight: 500, background: activeTab === id ? C.surface : 'transparent', color: activeTab === id ? C.primary : C.muted, border: activeTab === id ? `1px solid ${C.border}` : '1px solid transparent', boxShadow: activeTab === id ? C.shadowCard : 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
            <Icon size={15} /><span>{label}</span>
          </button>
        ))}
      </div>
      {activeTab === 'account' && <AccountTab />}
      {activeTab === 'plan' && <PlanTab />}
      {activeTab === 'danger' && <DangerTab />}
    </div>
  );
}
