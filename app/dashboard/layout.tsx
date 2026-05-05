'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import {
  Star,
  LayoutDashboard,
  Settings2,
  QrCode,
  MessageSquare,
  Eye,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const C = {
  bg: '#FAFAF8',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#111827',
  muted: '#6B7280',
  subtle: '#9CA3AF',
  primary: '#0F766E',
  primaryMuted: 'rgba(15,118,110,0.08)',
  shadowSm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)',
};

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/setup', label: 'Setup', icon: Settings2 },
  { href: '/dashboard/qr', label: 'QR Code', icon: QrCode },
  { href: '/dashboard/reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/dashboard/preview', label: 'Live Preview', icon: Eye },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', initials: '' });
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const meta = user.user_metadata;
      const name = meta?.business_name || user.email?.split('@')[0] || 'User';
      const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
      setUserInfo({ name, email: user.email || '', initials });

      // Load business — create it if signup failed to insert it
      const { data: biz } = await supabase.from('businesses').select('name').single();
      if (biz) {
        setBusinessName(biz.name);
      } else if (meta?.business_name) {
        const slug = (meta.business_name as string)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const { data: newBiz } = await supabase
          .from('businesses')
          .insert({
            user_id: user.id,
            name: meta.business_name,
            slug,
            type: meta.business_type || '',
            plan: 'free',
          })
          .select('name')
          .single();
        if (newBiz) setBusinessName(newBiz.name);
      }
    })();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ctx = gsap.context(() => {
      if (navRef.current) {
        const links = navRef.current.querySelectorAll('a');
        gsap.from(Array.from(links), {
          x: -14,
          opacity: 0,
          stagger: 0.07,
          duration: 0.4,
          ease: 'power2.out',
          delay: 0.1,
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 20px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Star size={15} fill="white" color="white" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 17, color: C.primary, letterSpacing: '-0.2px' }}>ReviewBoost</span>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', marginLeft: 'auto', flexShrink: 0 }} />
      </div>

      {/* Business badge */}
      <div style={{ padding: '12px 16px', margin: '12px 12px 4px', borderRadius: 10, background: C.primaryMuted, border: '1px solid rgba(15,118,110,0.18)', flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: C.muted, marginBottom: 2 }}>Current business</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{businessName || '—'}</div>
      </div>

      {/* Nav */}
      <nav ref={navRef} style={{ flex: 1, padding: '8px 12px', overflowY: 'auto' }}>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 10,
              marginBottom: 2,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              background: isActive(href) ? C.primaryMuted : 'transparent',
              color: isActive(href) ? C.primary : C.muted,
              borderLeft: isActive(href) ? `3px solid ${C.primary}` : '3px solid transparent',
              transition: 'background 0.12s, color 0.12s',
            }}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '12px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        {/* Avatar row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{userInfo.initials || '?'}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userInfo.name || '—'}</div>
            <div style={{ fontSize: 11, color: C.subtle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userInfo.email || '—'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, fontSize: 14, fontWeight: 500, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit', transition: 'background 0.12s' }}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{`
        @media (min-width: 1024px) {
          .dash-sidebar { display: flex !important; }
          .dash-main { margin-left: 260px !important; }
          .dash-topbar { display: none !important; }
          .dash-bottom-nav { display: none !important; }
        }
        @media (max-width: 1023px) {
          .dash-sidebar-desktop { display: none !important; }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <aside
        className="dash-sidebar dash-sidebar-desktop"
        style={{
          display: 'none',
          flexDirection: 'column',
          width: 260,
          flexShrink: 0,
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          zIndex: 30,
          background: C.surface,
          borderRight: `1px solid ${C.border}`,
          boxShadow: C.shadowSm,
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.35)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          zIndex: 50,
          width: 264,
          display: 'flex',
          flexDirection: 'column',
          background: C.surface,
          borderRight: `1px solid ${C.border}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="dash-sidebar-mobile"
      >
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="dash-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, marginLeft: 0 }}>
        {/* Mobile top bar */}
        <header
          className="dash-topbar"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${C.border}`, background: C.surface, position: 'sticky', top: 0, zIndex: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={13} fill="white" color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.primary }}>ReviewBoost</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ padding: '7px', borderRadius: 8, color: C.muted, background: '#F4F4F2', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '32px 24px 80px', background: C.bg }}>
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="dash-bottom-nav"
          style={{
            display: 'flex',
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            alignItems: 'center',
            justifyContent: 'space-around',
            borderTop: `1px solid ${C.border}`,
            background: C.surface,
            paddingBottom: 'env(safe-area-inset-bottom, 8px)',
            paddingTop: 8,
          }}
        >
          {navItems.slice(0, 5).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 8px', borderRadius: 10, color: isActive(href) ? C.primary : C.subtle, textDecoration: 'none' }}
            >
              <Icon size={20} />
              <span style={{ fontSize: 11, fontWeight: 500 }}>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
