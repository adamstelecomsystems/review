'use client';

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Star, QrCode, BarChart3, Zap, ArrowRight, CheckCircle } from "lucide-react";
import gsap from "gsap";

// ── Design tokens (hardcoded — no CSS var dependency for critical visuals) ─────
const C = {
  bg: "#FAFAF8",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  borderInput: "#D1D5DB",
  text: "#111827",
  muted: "#6B7280",
  subtle: "#9CA3AF",
  primary: "#0F766E",
  primaryHover: "#0D6560",
  primaryMuted: "rgba(15,118,110,0.08)",
  success: "#059669",
  shadowCard: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)",
  shadowCardHover: "0 4px 12px rgba(0,0,0,0.1)",
  shadowBtn: "0 1px 3px rgba(15,118,110,0.3)",
};

const features = [
  {
    icon: QrCode,
    title: "QR Code Generation",
    description:
      "Instantly generate branded QR codes that direct customers to your custom review page. Print them, display them, or embed them anywhere.",
  },
  {
    icon: Zap,
    title: "AI Review Messages",
    description:
      "Our AI crafts personalized, genuine-sounding review messages based on customer feedback, making it easy for them to post a great review.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track QR scans, review submissions, star ratings, and customer sentiment trends — all in one clean, real-time dashboard.",
  },
];

const statsData = [
  { value: "10,000+", label: "Businesses Trust Us" },
  { value: "2M+", label: "Reviews Generated" },
  { value: "4.8★", label: "Average Rating" },
];

const steps = [
  { num: "01", title: "Set Up Your Profile", desc: "Enter your business details and Google review link in under 60 seconds." },
  { num: "02", title: "Generate Your QR Code", desc: "Get a unique QR code for your business. Print it, embed it, or share it." },
  { num: "03", title: "Watch Reviews Roll In", desc: "Customers scan, rate, and post. You track it all from your dashboard." },
];

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.from(Array.from(heroRef.current.children), {
          y: 30,
          opacity: 0,
          stagger: 0.12,
          duration: 0.65,
          ease: "power2.out",
        });
      }
      if (statsRef.current) {
        gsap.from(Array.from(statsRef.current.children), {
          y: 24,
          opacity: 0,
          stagger: 0.1,
          duration: 0.55,
          ease: "power2.out",
          delay: 0.45,
        });
      }
      if (cardsRef.current) {
        gsap.from(Array.from(cardsRef.current.children), {
          y: 24,
          opacity: 0,
          stagger: 0.1,
          duration: 0.55,
          ease: "power2.out",
          delay: 0.65,
        });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg, color: C.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", height: "64px", background: C.surface, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Star size={15} fill="white" color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px" }}>ReviewBoost</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/login"
            style={{ fontSize: 14, fontWeight: 500, padding: "8px 18px", borderRadius: 10, border: `1px solid ${C.border}`, color: C.muted, background: C.surface, textDecoration: "none" }}
          >
            Login
          </Link>
          <Link
            href="/signup"
            style={{ fontSize: 14, fontWeight: 600, padding: "8px 18px", borderRadius: 10, background: C.primary, color: "white", textDecoration: "none", boxShadow: C.shadowBtn }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px 64px", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div ref={heroRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 700, margin: "0 auto" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: C.primaryMuted, border: `1px solid rgba(15,118,110,0.2)`, fontSize: 13, fontWeight: 500, color: C.primary, marginBottom: 28 }}>
            <Zap size={13} />
            AI-Powered · Trusted by 10,000+ businesses
          </div>

          {/* H1 */}
          <h1 style={{ fontSize: "clamp(40px, 6vw, 56px)", fontWeight: 800, lineHeight: 1.1, color: C.text, marginBottom: 22, letterSpacing: "-1px" }}>
            Turn Every Visit Into a{" "}
            <span style={{ color: C.primary }}>5-Star Review</span>
          </h1>

          {/* Sub */}
          <p style={{ fontSize: 18, color: C.muted, lineHeight: 1.6, marginBottom: 40, maxWidth: 520 }}>
            AI-powered Google review collection for any business. Set up in minutes, watch your ratings soar.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <Link
              href="/signup"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, background: C.primary, color: "white", fontWeight: 600, fontSize: 16, textDecoration: "none", boxShadow: C.shadowBtn }}
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/demo"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.surface, color: C.text, fontWeight: 600, fontSize: 16, textDecoration: "none", boxShadow: C.shadowCard }}
            >
              View Demo
            </Link>
          </div>

          {/* Trust line */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center", marginTop: 36, fontSize: 14, color: C.muted }}>
            {["No credit card required", "Free forever plan", "Setup in 60 seconds"].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={15} color={C.success} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 24px 72px", background: C.bg }}>
        <div ref={statsRef} style={{ maxWidth: 720, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          {statsData.map((s) => (
            <div
              key={s.label}
              style={{ textAlign: "center", padding: "28px 20px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard }}
            >
              <div style={{ fontSize: 34, fontWeight: 800, color: C.primary, marginBottom: 6, letterSpacing: "-0.5px" }}>{s.value}</div>
              <div style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 24px 80px", background: C.bg }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: C.text, marginBottom: 12, letterSpacing: "-0.5px" }}>How It Works</h2>
            <p style={{ fontSize: 16, color: C.muted, maxWidth: 440, margin: "0 auto" }}>
              Three simple steps to transform your online reputation.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 40 }}>
            {steps.map((step) => (
              <div key={step.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: C.primaryMuted, border: `1px solid rgba(15,118,110,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: C.primary, marginBottom: 18 }}>
                  {step.num}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: "72px 24px 80px", background: "#F4F4F2" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: C.text, marginBottom: 12, letterSpacing: "-0.5px" }}>
              Everything you need to dominate local search
            </h2>
            <p style={{ fontSize: 16, color: C.muted, maxWidth: 480, margin: "0 auto" }}>
              Three powerful tools working together to automate your reputation management.
            </p>
          </div>
          <div ref={cardsRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {features.map((f) => (
              <div
                key={f.title}
                style={{ padding: 28, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: C.shadowCard }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: C.primaryMuted, border: `1px solid rgba(15,118,110,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <f.icon size={22} color={C.primary} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Strip ────────────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", background: C.primary }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 34, fontWeight: 700, color: "white", marginBottom: 16, letterSpacing: "-0.5px" }}>
            Ready to boost your reviews?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.82)", marginBottom: 36, lineHeight: 1.6 }}>
            Join thousands of businesses already growing their reputation with ReviewBoost.
          </p>
          <Link
            href="/signup"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 36px", borderRadius: 10, background: "white", color: C.primary, fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
          >
            Start for Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer style={{ padding: "24px 32px", background: C.surface, borderTop: `1px solid ${C.border}`, textAlign: "center", fontSize: 13, color: C.subtle }}>
        &copy; 2025 ReviewBoost. Built for local businesses.
      </footer>
    </div>
  );
}
