"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    ),
    title: "Smart File Organization",
    desc: "Automatically categorize and tag files with AI-powered sorting. Keep your workspace clean and accessible at all times.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    title: "End-to-End Encryption",
    desc: "Every file is encrypted at rest and in transit. Your data stays private — always. Enterprise-grade security by default.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    ),
    title: "Instant Sharing",
    desc: "Share files or folders with expiring links, password protection, and granular permission controls — in one click.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
    title: "Analytics Dashboard",
    desc: "Track storage usage, file activity, and team access patterns with real-time analytics built right into your workspace.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
      </svg>
    ),
    title: "Unlimited Uploads",
    desc: "No file size cap, no hidden limits. Upload entire project folders, large videos, or raw datasets without friction.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.394A9 9 0 015.106 5.607m13.788 0a9 9 0 010 12.787M12 12h.008v.008H12V12z" />
      </svg>
    ),
    title: "Real-time Collaboration",
    desc: "Work together seamlessly. Comment on files, co-edit documents, and see changes live across your entire team.",
  },
];

// Static plans removed in favor of dynamic fetching

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "2B+", label: "Files Stored" },
  { value: "99.99%", label: "Uptime" },
  { value: "180+", label: "Countries" },
];

export default function Home() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dynamicPlans, setDynamicPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://backend-iota-inky-13.vercel.app/api'}/packages/public`);
        const json = await res.json();
        if (json.success) {
          setDynamicPlans(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#080c14] text-white overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#080c14]/90 backdrop-blur-md border-b border-white/5 py-3" : "py-5"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight">ZoomIt</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#stats" className="hover:text-white transition-colors">About</a>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                href={user.role === 'ADMIN' ? "/admin" : "/dashboard"}
                className="text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white/60 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0d1220] border-t border-white/5 px-6 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block text-sm text-white/70 hover:text-white py-1">Features</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="block text-sm text-white/70 hover:text-white py-1">Pricing</a>
            <div className="pt-2 flex flex-col gap-2 border-t border-white/5">
              {user ? (
                <Link
                  href={user.role === 'ADMIN' ? "/admin" : "/dashboard"}
                  className="text-sm text-center font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2 rounded-xl"
                  onClick={() => setMobileOpen(false)}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-center text-white/70 hover:text-white py-2 border border-white/10 rounded-xl" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  <Link href="/register" className="text-sm text-center font-medium bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2 rounded-xl" onClick={() => setMobileOpen(false)}>Get Started Free</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero ─── */}
      <section className="relative pt-40 pb-28 px-6 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-32 left-1/4 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[100px]" />
          <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-purple-500/8 rounded-full blur-[80px]" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            New: AI-powered file tagging is here
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
            Manage files{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              without limits
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
            ZoomIt is the modern SaaS file management platform built for teams. Upload, organize, share, and
            collaborate — all in one beautifully simple workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href={user.role === 'ADMIN' ? "/admin" : "/dashboard"}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-2xl font-semibold text-white shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:-translate-y-0.5 duration-200"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-2xl font-semibold text-white shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:-translate-y-0.5 duration-200"
                >
                  Start for Free
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-medium text-white/80 hover:text-white transition-all hover:-translate-y-0.5 duration-200"
                >
                  Sign In →
                </Link>
              </>
            )}
          </div>

          <p className="mt-5 text-sm text-white/30">No credit card required · Free 14-day trial</p>
        </div>

        {/* Hero mockup */}
        <div className="relative max-w-5xl mx-auto mt-20">
          <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent to-transparent z-10 pointer-events-none" />
          <div className="bg-[#0d1220] border border-white/8 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
            {/* Window bar */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5 bg-[#0a0f1a]">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="flex-1 mx-4 bg-white/5 rounded-lg h-6 flex items-center px-3">
                <span className="text-xs text-white/30">app.zoomit.io/dashboard</span>
              </div>
            </div>
            {/* Fake dashboard */}
            <div className="flex h-72">
              {/* Sidebar */}
              <div className="w-52 border-r border-white/5 bg-[#0a0f1a] p-4 space-y-1 hidden sm:block">
                {["Dashboard", "My Files", "Shared", "Recent", "Trash"].map((item, i) => (
                  <div key={item} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${i === 1 ? "bg-violet-600/20 text-violet-300" : "text-white/30"}`}>
                    <div className="w-4 h-4 rounded bg-white/10" />
                    {item}
                  </div>
                ))}
                <div className="pt-4 mt-4 border-t border-white/5">
                  <div className="text-xs text-white/20 px-3 mb-2">Storage</div>
                  <div className="px-3">
                    <div className="h-1.5 bg-white/10 rounded-full">
                      <div className="h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full w-3/5" />
                    </div>
                    <div className="text-xs text-white/30 mt-1.5">612 GB / 1 TB</div>
                  </div>
                </div>
              </div>
              {/* Main area */}
              <div className="flex-1 p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {["Documents", "Images", "Videos", "Archives"].map((name, i) => (
                    <div key={name} className="bg-white/4 border border-white/6 rounded-xl p-3 flex flex-col gap-2">
                      <div className={`w-8 h-8 rounded-lg ${["bg-violet-500/20", "bg-blue-500/20", "bg-orange-500/20", "bg-emerald-500/20"][i]}`} />
                      <div className="text-xs text-white/50">{name}</div>
                      <div className="text-xs text-white/20">{["42 files", "128 files", "16 files", "7 files"][i]}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Q4 Report.pdf", size: "2.4 MB", color: "bg-red-400" },
                    { name: "Brand Assets.zip", size: "84 MB", color: "bg-yellow-400" },
                    { name: "Meeting Notes.docx", size: "412 KB", color: "bg-blue-400" },
                  ].map((f) => (
                    <div key={f.name} className="flex items-center gap-3 px-3 py-2.5 bg-white/3 border border-white/5 rounded-xl">
                      <div className={`w-2 h-2 rounded-full ${f.color}`} />
                      <span className="text-xs text-white/60 flex-1">{f.name}</span>
                      <span className="text-xs text-white/25">{f.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section id="stats" className="py-16 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-1">
                {s.value}
              </div>
              <div className="text-sm text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-5">
              Everything you need
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Built for modern teams
            </h2>
            <p className="text-white/40 max-w-xl mx-auto text-lg">
              Every feature you need to manage, share, and collaborate on files — designed to get out of your way.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-white/3 hover:bg-white/5 border border-white/8 hover:border-violet-500/30 rounded-2xl p-6 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center text-violet-400 mb-5 group-hover:from-violet-500/30 group-hover:to-indigo-500/30 transition-all">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/8 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-5">
              Simple pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Pick your plan
            </h2>
            <p className="text-white/40 max-w-xl mx-auto text-lg">
              Start free. Scale as you grow. Cancel anytime with no lock-in.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-center">
            {loadingPlans ? (
              <div className="col-span-3 py-20 text-center">
                <div className="inline-block w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
                <p className="text-white/40">Loading plans...</p>
              </div>
            ) : dynamicPlans.length > 0 ? (
              dynamicPlans.map((plan, index) => {
                const isFree = plan.price === 0;
                // Highlight the first non-free plan, or the second plan if all are paid
                const highlighted = index === (dynamicPlans.some(p => p.price === 0) ? 1 : 1);

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl p-7 border transition-all duration-300 ${highlighted
                      ? "bg-gradient-to-b from-violet-600/20 to-indigo-600/10 border-violet-500/40 scale-105 shadow-2xl shadow-violet-500/20"
                      : "bg-white/3 border-white/8 hover:border-white/15"
                      }`}
                  >
                    {highlighted && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-lg">
                        Most Popular
                      </div>
                    )}
                    <div className="mb-5">
                      <div className="text-sm text-white/50 mb-1">{plan.name}</div>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-4xl font-bold text-white">
                          {isFree ? "Free" : `$${plan.price}`}
                        </span>
                        {!isFree && <span className="text-white/40 text-sm">/mo</span>}
                      </div>
                      <p className="text-sm text-white/40">
                        {plan.totalStorageMB >= 1024
                          ? `${(plan.totalStorageMB / 1024).toFixed(0)} TB`
                          : `${plan.totalStorageMB} MB`} total storage
                      </p>
                    </div>

                    <ul className="space-y-3 mb-7">
                      <li className="flex items-center gap-2.5 text-sm text-white/60">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-violet-400 flex-shrink-0">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        {plan.totalFileLimit} files limit
                      </li>
                      <li className="flex items-center gap-2.5 text-sm text-white/60">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-violet-400 flex-shrink-0">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        {plan.maxFileSizeMB} MB max file size
                      </li>
                      <li className="flex items-center gap-2.5 text-sm text-white/60">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-violet-400 flex-shrink-0">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        {plan.maxFolders} folders included
                      </li>
                    </ul>

                    <Link
                      href="/register"
                      className={`block w-full text-center py-3 rounded-xl font-medium text-sm transition-all ${highlighted
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/30"
                        : "bg-white/8 hover:bg-white/12 text-white border border-white/10"
                        }`}
                    >
                      {isFree ? "Get Started" : "Choose Plan"}
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 py-20 text-center text-white/40">
                No plans available at the moment.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden p-12 bg-gradient-to-br from-violet-600/20 via-indigo-600/15 to-purple-600/10 border border-violet-500/20">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-white/50 mb-8 text-lg">
                Join 50,000+ teams already using ZoomIt. Free forever, upgrade anytime.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-2xl font-semibold text-white shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:-translate-y-0.5 duration-200"
              >
                Create Free Account
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
                <path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white/60">ZoomIt</span>
          </div>
          <p className="text-sm text-white/25">© 2026 ZoomIt. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
