import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, Zap, Shield, Globe, BarChart3, Users, BookOpen,
  Star, Check, ChevronRight, X, Gift, Menu,
  Feather, Eye, Heart, TrendingUp, Sparkles,
  Lock, Rss, Award, Coffee, MousePointer, Play
} from "lucide-react";

/* ─────────────────────────────────────────────
   HOOK – simple IntersectionObserver reveal
───────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─────────────────────────────────────────────
   REUSABLE COMPONENTS
───────────────────────────────────────────── */
function GlassCard({ children, className = "", hover = true }) {
  return (
    <div className={`
      relative rounded-2xl border border-white/[0.06]
      bg-white/[0.03] backdrop-blur-md
      ${hover ? "hover:border-cyan-400/30 hover:bg-white/[0.06] transition-all duration-500" : ""}
      ${className}
    `}>
      {children}
    </div>
  );
}

function GradientText({ children, className = "" }) {
  return (
    <span className={`bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}

function Badge({ children, color = "cyan" }) {
  const colors = {
    cyan: "border-cyan-400/30 text-cyan-300 bg-cyan-400/10",
    violet: "border-violet-400/30 text-violet-300 bg-violet-400/10",
    pink: "border-pink-400/30 text-pink-300 bg-pink-400/10",
    green: "border-emerald-400/30 text-emerald-300 bg-emerald-400/10",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border tracking-wide ${colors[color]}`}>
      {children}
    </span>
  );
}

function Button({ children, variant = "primary", className = "", onClick }) {
  const base = "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer select-none";
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:shadow-[0_0_32px_rgba(34,211,238,0.35)] hover:scale-[1.02] active:scale-[0.98]",
    secondary: "border border-white/10 text-white/80 hover:border-white/30 hover:text-white hover:bg-white/[0.05] backdrop-blur-sm",
    ghost: "text-white/60 hover:text-white hover:bg-white/[0.05] px-4",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────
   ANIMATED GRID BACKGROUND
───────────────────────────────────────────── */
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid lines */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />
      {/* Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-violet-600/10 rounded-full blur-[120px]" />
      <div className="absolute top-[10%] right-[-15%] w-[55vw] h-[55vw] bg-cyan-500/8 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[40vw] bg-pink-600/6 rounded-full blur-[100px]" />
      {/* Noise grain */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["Features", "Pricing", "Blog", "About"];

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
      scrolled ? "bg-[#080b14]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl" : ""
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Feather size={14} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight" style={{fontFamily:"'Oxanium',sans-serif"}}>
              Quill<span className="text-cyan-400">.</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Button key={l} variant="ghost" className="text-sm">{l}</Button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="secondary" className="text-sm py-2">Sign in</Button>
            <Button variant="primary" className="text-sm py-2">
              Start writing <ArrowRight size={14} />
            </Button>
          </div>

          {/* Mobile menu */}
          <button
            className="md:hidden text-white/70 hover:text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#080b14]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 py-4 space-y-1">
          {links.map(l => (
            <button key={l} className="block w-full text-left px-4 py-3 text-white/70 hover:text-white rounded-xl hover:bg-white/[0.05] transition-all text-sm">
              {l}
            </button>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Button variant="secondary" className="justify-center">Sign in</Button>
            <Button variant="primary" className="justify-center">Start writing <ArrowRight size={14} /></Button>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero() {
  const [ref, visible] = useReveal(0.1);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 overflow-hidden">
      <GridBackground />

      {/* Floating badge */}
      <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        style={{ transitionDelay: "100ms" }}>
        <Badge color="violet">
          <Sparkles size={10} /> New — Real-time collaboration is here
        </Badge>
      </div>

      {/* Headline */}
      <h1 className={`mt-8 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] max-w-5xl transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{ fontFamily: "'Oxanium',sans-serif", transitionDelay: "200ms" }}>
        <span className="text-white">Write.</span>{" "}
        <GradientText>Share.</GradientText>{" "}
        <span className="text-white/30">Inspire.</span>
      </h1>

      {/* Sub */}
      <p className={`mt-6 text-lg sm:text-xl text-white/50 max-w-2xl leading-relaxed transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{ fontFamily: "'Space Mono',monospace", transitionDelay: "350ms" }}>
        A next-generation blogging platform for developers, designers, and thinkers.
        Publish beautiful stories. Build your audience.
      </p>

      {/* CTAs */}
      <div className={`mt-10 flex flex-col sm:flex-row items-center gap-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{ transitionDelay: "500ms" }}>
        <Button variant="primary" className="text-base px-8 py-4 rounded-2xl">
          Start for free <ArrowRight size={16} />
        </Button>
        <Button variant="secondary" className="text-base px-8 py-4 rounded-2xl gap-3">
          <Play size={14} className="text-cyan-400" /> Watch demo
        </Button>
      </div>

      {/* Social proof */}
      <div className={`mt-12 flex items-center gap-6 text-sm text-white/30 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{ transitionDelay: "650ms" }}>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {["bg-cyan-500","bg-violet-500","bg-pink-500","bg-emerald-500","bg-orange-500"].map((c,i)=>(
              <div key={i} className={`w-7 h-7 rounded-full border-2 border-[#080b14] ${c} flex items-center justify-center text-[9px] font-bold text-white`}>
                {String.fromCharCode(65+i)}
              </div>
            ))}
          </div>
          <span>5,000+ writers</span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-1.5">
          {[1,2,3,4,5].map(i=>(
            <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
          ))}
          <span>4.9/5 rating</span>
        </div>
      </div>

      {/* Hero image / Dashboard preview */}
      <div className={`mt-20 w-full max-w-5xl transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
        style={{ transitionDelay: "800ms" }}>
        <div className="relative">
          {/* Glow behind card */}
          <div className="absolute inset-x-20 top-4 h-20 bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-pink-500/20 blur-3xl rounded-full" />
          <GlassCard hover={false} className="overflow-hidden border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)]">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4 h-6 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center px-3 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-white/30 text-xs">quill.io/dashboard</span>
              </div>
            </div>
            {/* Dashboard content */}
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[380px]">
              {/* Sidebar */}
              <div className="hidden md:block border-r border-white/[0.06] p-5 space-y-1">
                {[
                  { icon: <BarChart3 size={14}/>, label: "Dashboard", active: true },
                  { icon: <Feather size={14}/>, label: "Create" },
                  { icon: <BookOpen size={14}/>, label: "My Blogs" },
                  { icon: <Globe size={14}/>, label: "Browse" },
                  { icon: <Users size={14}/>, label: "Community" },
                ].map((item)=>(
                  <div key={item.label} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all ${item.active ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"}`}>
                    {item.icon} {item.label}
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div className="p-6 space-y-5">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Total Views", value: "24.5K", icon: <Eye size={14}/>, color: "cyan" },
                    { label: "Total Likes", value: "1,893", icon: <Heart size={14}/>, color: "pink" },
                    { label: "Followers", value: "342", icon: <Users size={14}/>, color: "violet" },
                  ].map((s)=>(
                    <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5">
                      <div className={`text-xs mb-2 ${s.color === "cyan" ? "text-cyan-400" : s.color === "pink" ? "text-pink-400" : "text-violet-400"}`}>
                        {s.icon}
                      </div>
                      <div className="text-white font-bold text-lg leading-none">{s.value}</div>
                      <div className="text-white/30 text-xs mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Blog cards */}
                <div className="space-y-2.5">
                  {[
                    { title: "Building Scalable APIs with Node.js", views: "8.2K", likes: 432, tag: "Technology" },
                    { title: "The Art of Minimalist UI Design", views: "5.7K", likes: 289, tag: "Design" },
                    { title: "Mastering TypeScript in 2024", views: "10.1K", likes: 567, tag: "Dev" },
                  ].map((b, i)=>(
                    <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 hover:border-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-cyan-400 to-violet-400" />
                        <div>
                          <p className="text-white/80 text-xs font-medium">{b.title}</p>
                          <p className="text-white/30 text-[10px] mt-0.5">{b.tag}</p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-4 text-[10px] text-white/30">
                        <span className="flex items-center gap-1"><Eye size={10}/>{b.views}</span>
                        <span className="flex items-center gap-1"><Heart size={10}/>{b.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   LOGO STRIP
───────────────────────────────────────────── */
function LogoStrip() {
  const logos = ["Medium", "Hashnode", "Dev.to", "Substack", "Ghost", "WordPress"];
  return (
    <section className="relative py-14 border-y border-white/[0.04] overflow-hidden">
      <p className="text-center text-white/20 text-xs tracking-[0.2em] uppercase mb-8 font-medium">
        Trusted by writers who left
      </p>
      <div className="flex gap-12 animate-[scroll_20s_linear_infinite] whitespace-nowrap">
        {[...logos,...logos].map((l,i)=>(
          <span key={i} className="text-white/20 font-bold text-sm tracking-widest uppercase">{l}</span>
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          from { transform: translateX(0) }
          to { transform: translateX(-50%) }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FEATURES
───────────────────────────────────────────── */
function Features() {
  const [ref, visible] = useReveal();

  const features = [
    {
      icon: <Zap size={20}/>,
      color: "cyan",
      title: "Blazing Fast Editor",
      desc: "A distraction-free markdown editor with live preview, syntax highlighting, and zero latency. Focus on writing, not fighting tools.",
    },
    {
      icon: <BarChart3 size={20}/>,
      color: "violet",
      title: "Real-Time Analytics",
      desc: "Beautiful dashboards with live views, likes, read time, and audience demographics. Know your readers deeply.",
    },
    {
      icon: <Shield size={20}/>,
      color: "pink",
      title: "Role-Based Access",
      desc: "Granular permissions with JWT auth, Google OAuth, and admin controls. Enterprise-grade security that just works.",
    },
    {
      icon: <Globe size={20}/>,
      color: "green",
      title: "SEO Powerhouse",
      desc: "Automatic meta tags, Open Graph, sitemaps, and canonical URLs. Built for discoverability from day one.",
    },
    {
      icon: <Users size={20}/>,
      color: "cyan",
      title: "Community First",
      desc: "Follow authors, bookmark blogs, comment threads, and curated feeds. Build a loyal readership over time.",
    },
    {
      icon: <TrendingUp size={20}/>,
      color: "violet",
      title: "Monetisation Ready",
      desc: "Paid subscriptions, tip jars, and sponsor placements. Turn your audience into sustainable income.",
    },
  ];

  const colorMap = {
    cyan: { bg: "bg-cyan-400/10", border: "border-cyan-400/20", text: "text-cyan-400", glow: "shadow-cyan-500/20" },
    violet: { bg: "bg-violet-400/10", border: "border-violet-400/20", text: "text-violet-400", glow: "shadow-violet-500/20" },
    pink: { bg: "bg-pink-400/10", border: "border-pink-400/20", text: "text-pink-400", glow: "shadow-pink-500/20" },
    green: { bg: "bg-emerald-400/10", border: "border-emerald-400/20", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
  };

  return (
    <section ref={ref} className="relative py-28 px-4 max-w-7xl mx-auto">
      <div className={`text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <Badge color="cyan"><Zap size={10}/> Features</Badge>
        <h2 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-white" style={{fontFamily:"'Oxanium',sans-serif"}}>
          Everything a writer needs.
          <br/><GradientText>Nothing they don't.</GradientText>
        </h2>
        <p className="mt-4 text-white/40 max-w-xl mx-auto text-base leading-relaxed">
          Quill is opinionated about what matters: beautiful writing, engaged readers, and real data.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => {
          const c = colorMap[f.color];
          return (
            <div key={i} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${i * 80}ms` }}>
              <GlassCard className="p-6 h-full group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} border ${c.border} ${c.text} mb-5 group-hover:shadow-lg group-hover:${c.glow} transition-all duration-300`}>
                  {f.icon}
                </div>
                <h3 className="text-white font-bold text-base mb-2" style={{fontFamily:"'Oxanium',sans-serif"}}>{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </GlassCard>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────── */
function HowItWorks() {
  const [ref, visible] = useReveal();
  const steps = [
    { n: "01", icon: <MousePointer size={18}/>, title: "Create your account", desc: "Sign up with email or Google in seconds. Your profile is live immediately." },
    { n: "02", icon: <Feather size={18}/>, title: "Write your first blog", desc: "Use our markdown editor with live preview, image uploads, and tagging." },
    { n: "03", icon: <Rss size={18}/>, title: "Publish & distribute", desc: "One click publishes to your profile, your followers' feeds, and the explore page." },
    { n: "04", icon: <TrendingUp size={18}/>, title: "Grow your audience", desc: "Track performance in real-time and iterate with data-driven insights." },
  ];

  return (
    <section ref={ref} className="relative py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <Badge color="violet"><Coffee size={10}/> How it works</Badge>
          <h2 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight text-white" style={{fontFamily:"'Oxanium',sans-serif"}}>
            From idea to <GradientText>published</GradientText>
            <br/>in minutes.
          </h2>
        </div>

        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Connector line desktop */}
          <div className="absolute hidden lg:block top-10 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          {steps.map((s, i) => (
            <div key={i}
              className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${i * 120}ms` }}>
              <GlassCard className="p-6 text-center relative">
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20 text-cyan-400 mb-5 relative z-10">
                  {s.icon}
                </div>
                <div className="absolute top-4 right-5 text-white/[0.04] font-black text-5xl" style={{fontFamily:"'Oxanium',sans-serif"}}>
                  {s.n}
                </div>
                <h3 className="text-white font-bold text-sm mb-2" style={{fontFamily:"'Oxanium',sans-serif"}}>{s.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   BLOG PREVIEW GRID
───────────────────────────────────────────── */
function BlogPreview() {
  const [ref, visible] = useReveal();
  const posts = [
    { emoji: "⚡", tag: "Technology", title: "The Future of Web Development in 2025", author: "Alex Chen", read: "5 min", views: "12.4K", likes: 891 },
    { emoji: "🎨", tag: "Design", title: "Designing for Dark Mode: A Complete Guide", author: "Sara Kim", read: "8 min", views: "9.1K", likes: 723 },
    { emoji: "🚀", tag: "Startup", title: "How We Scaled to 1M Users With Zero Budget", author: "Mike Torres", read: "12 min", views: "31K", likes: 2100 },
    { emoji: "🧠", tag: "AI", title: "Building LLM-Powered Apps That Actually Work", author: "Priya Nair", read: "10 min", views: "18.2K", likes: 1340 },
    { emoji: "📐", tag: "Engineering", title: "Clean Architecture in Node.js: A Deep Dive", author: "James Wu", read: "15 min", views: "7.8K", likes: 610 },
    { emoji: "🌿", tag: "Lifestyle", title: "The Minimalist Developer's Productivity System", author: "Lena Ross", read: "6 min", views: "5.3K", likes: 487 },
  ];

  return (
    <section ref={ref} className="relative py-28 px-4 max-w-7xl mx-auto">
      <div className={`flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div>
          <Badge color="pink"><BookOpen size={10}/> Explore</Badge>
          <h2 className="mt-4 text-4xl font-black text-white" style={{fontFamily:"'Oxanium',sans-serif"}}>
            Trending stories <GradientText>today</GradientText>
          </h2>
        </div>
        <Button variant="secondary" className="self-start sm:self-auto">
          View all posts <ChevronRight size={14}/>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((p, i) => (
          <div key={i}
            className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            style={{ transitionDelay: `${i * 80}ms` }}>
            <GlassCard className="overflow-hidden group cursor-pointer h-full flex flex-col">
              {/* Thumbnail */}
              <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-6xl relative overflow-hidden">
                <span className="transform group-hover:scale-110 transition-transform duration-500">{p.emoji}</span>
                <div className="absolute inset-0 bg-gradient-to-t from-[#080b14]/80 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <Badge color={["cyan","violet","pink","green"][i%4]}>{p.tag}</Badge>
                </div>
              </div>
              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-white font-bold text-sm leading-snug mb-3 group-hover:text-cyan-300 transition-colors duration-300" style={{fontFamily:"'Oxanium',sans-serif"}}>
                  {p.title}
                </h3>
                <div className="mt-auto flex items-center justify-between text-white/30 text-xs pt-4 border-t border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-[9px] font-bold text-white">
                      {p.author[0]}
                    </div>
                    <span>{p.author}</span>
                    <span>·</span>
                    <span>{p.read} read</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Eye size={10}/>{p.views}</span>
                    <span className="flex items-center gap-1"><Heart size={10}/>{p.likes}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PRICING
───────────────────────────────────────────── */
function Pricing() {
  const [ref, visible] = useReveal();
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Free",
      price: { monthly: 0, annual: 0 },
      desc: "Perfect for getting started",
      features: ["5 blog posts/month", "Basic analytics", "Community access", "Markdown editor", "Public profile"],
      cta: "Start free",
      variant: "secondary",
      highlight: false,
    },
    {
      name: "Pro",
      price: { monthly: 12, annual: 9 },
      desc: "For serious writers",
      features: ["Unlimited posts", "Advanced analytics", "Custom domain", "Newsletter tools", "Priority support", "AI writing assistant", "Monetisation"],
      cta: "Start Pro trial",
      variant: "primary",
      highlight: true,
    },
    {
      name: "Team",
      price: { monthly: 39, annual: 29 },
      desc: "For publications & teams",
      features: ["Everything in Pro", "Up to 10 authors", "Team analytics", "Admin dashboard", "Custom branding", "API access", "Dedicated support"],
      cta: "Contact sales",
      variant: "secondary",
      highlight: false,
    },
  ];

  return (
    <section ref={ref} className="relative py-28 px-4">
      <div className="max-w-5xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <Badge color="green"><Award size={10}/> Pricing</Badge>
          <h2 className="mt-5 text-4xl sm:text-5xl font-black text-white" style={{fontFamily:"'Oxanium',sans-serif"}}>
            Simple, <GradientText>transparent</GradientText> pricing.
          </h2>
          <p className="mt-4 text-white/40 text-base">No hidden fees. Cancel anytime.</p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!annual ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}
            >Monthly</button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${annual ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}
            >
              Annual <Badge color="green">Save 25%</Badge>
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {plans.map((p, i) => (
            <div key={i}
              className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ transitionDelay: `${i * 100}ms` }}>
              <div className={`relative rounded-2xl border p-6 h-full flex flex-col ${
                p.highlight
                  ? "border-cyan-400/40 bg-gradient-to-b from-cyan-500/10 to-violet-500/5 shadow-[0_0_60px_rgba(34,211,238,0.1)]"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge color="cyan"><Sparkles size={10}/> Most Popular</Badge>
                  </div>
                )}
                <div>
                  <h3 className="text-white font-bold text-sm" style={{fontFamily:"'Oxanium',sans-serif"}}>{p.name}</h3>
                  <p className="text-white/30 text-xs mt-1">{p.desc}</p>
                  <div className="mt-5 flex items-end gap-1">
                    <span className="text-4xl font-black text-white" style={{fontFamily:"'Oxanium',sans-serif"}}>
                      ${annual ? p.price.annual : p.price.monthly}
                    </span>
                    {p.price.monthly > 0 && <span className="text-white/30 text-sm mb-1">/mo</span>}
                  </div>
                </div>
                <ul className="mt-6 space-y-3 flex-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-xs text-white/60">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${p.highlight ? "bg-cyan-500/20 text-cyan-400" : "bg-white/10 text-white/40"}`}>
                        <Check size={9}/>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button variant={p.variant} className="w-full justify-center">
                    {p.cta}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────── */
function Testimonials() {
  const [ref, visible] = useReveal();
  const items = [
    { name: "Aisha Patel", role: "Full-Stack Developer", quote: "Quill replaced Medium for me completely. The editor is silky smooth and the analytics are actually useful.", avatar: "bg-gradient-to-br from-cyan-400 to-blue-500" },
    { name: "Carlos Ruiz", role: "Design Lead @ Vercel", quote: "The dark theme and typography choices are *chef's kiss*. Finally a blogging platform that looks good on day one.", avatar: "bg-gradient-to-br from-violet-400 to-pink-500" },
    { name: "Ming-Li Zhang", role: "Indie Hacker", quote: "Monetised my newsletter in week 2. Made more in a month than six months on Substack. No joke.", avatar: "bg-gradient-to-br from-emerald-400 to-cyan-500" },
    { name: "James Okafor", role: "Software Architect", quote: "Custom domains, SEO out of the box, and zero ads. This is how blogging should work.", avatar: "bg-gradient-to-br from-orange-400 to-pink-500" },
    { name: "Priya Sharma", role: "Tech Writer", quote: "The AI writing assistant is genuinely helpful – not a gimmick. It helps me write faster without losing my voice.", avatar: "bg-gradient-to-br from-pink-400 to-rose-500" },
    { name: "Noah Williams", role: "CTO @ BuildFast", quote: "We migrated our company blog in an afternoon. The API is clean, the docs are excellent. Love it.", avatar: "bg-gradient-to-br from-amber-400 to-orange-500" },
  ];

  return (
    <section ref={ref} className="relative py-28 px-4 max-w-7xl mx-auto">
      <div className={`text-center mb-14 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <Badge color="violet"><Star size={10}/> Testimonials</Badge>
        <h2 className="mt-5 text-4xl sm:text-5xl font-black text-white" style={{fontFamily:"'Oxanium',sans-serif"}}>
          Writers love <GradientText>Quill.</GradientText>
        </h2>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
        {items.map((t, i) => (
          <div key={i}
            className={`break-inside-avoid transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            style={{ transitionDelay: `${i * 80}ms` }}>
            <GlassCard className="p-5">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(s=>(
                  <Star key={s} size={12} className="text-amber-400 fill-amber-400"/>
                ))}
              </div>
              <p className="text-white/60 text-sm leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/[0.06]">
                <div className={`w-8 h-8 rounded-full ${t.avatar} flex items-center justify-center text-xs font-bold text-white`}>
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{t.name}</p>
                  <p className="text-white/30 text-[10px]">{t.role}</p>
                </div>
              </div>
            </GlassCard>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CTA BANNER
───────────────────────────────────────────── */
function CTABanner() {
  const [ref, visible] = useReveal();

  return (
    <section ref={ref} className="relative py-20 px-4">
      <div className={`max-w-4xl mx-auto transition-all duration-700 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-pink-500/10 p-12 text-center">
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          
          <div className="relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 mb-6 shadow-2xl shadow-cyan-500/30">
              <Feather size={24} className="text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4" style={{fontFamily:"'Oxanium',sans-serif"}}>
              Your words deserve
              <br/><GradientText>a better home.</GradientText>
            </h2>
            <p className="text-white/50 text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Join 5,000+ writers already building their audience on Quill.
              Free forever. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" className="text-base px-10 py-4 rounded-2xl">
                Create your account <ArrowRight size={16}/>
              </Button>
              <Button variant="secondary" className="text-base px-10 py-4 rounded-2xl">
                Read the docs <BookOpen size={16}/>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  const cols = [
    { heading: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
    { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
    { heading: "Resources", links: ["Docs", "API", "Community", "Status"] },
    { heading: "Legal", links: ["Privacy", "Terms", "Cookies", "Security"] },
  ];

  return (
    <footer className="border-t border-white/[0.04] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                <Feather size={14} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg" style={{fontFamily:"'Oxanium',sans-serif"}}>Quill<span className="text-cyan-400">.</span></span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed mb-5">
              The modern platform for writers who care about craft.
            </p>
            <div className="flex gap-3">
              {[<X size={14}/>, <Gift size={14}/>, <Rss size={14}/>].map((icon, i) => (
                <button key={i} className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all">
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {cols.map(col => (
            <div key={col.heading}>
              <h4 className="text-white font-semibold text-xs tracking-widest uppercase mb-4" style={{fontFamily:"'Oxanium',sans-serif"}}>{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-white/30 text-sm hover:text-white/70 transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">© 2025 Quill. All rights reserved.</p>
          <div className="flex items-center gap-2 text-white/20 text-xs">
            <Lock size={10}/>
            <span>SOC 2 Type II · GDPR Ready · 99.9% Uptime SLA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   ROOT PAGE
───────────────────────────────────────────── */
export default function App() {
  return (
    <div className="min-h-screen text-white"
      style={{
        backgroundColor: "#080b14",
        fontFamily: "'Space Mono', monospace",
      }}>
      {/* Load fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
      `}</style>

      <Navbar />
      <Hero />
      <LogoStrip />
      <Features />
      <HowItWorks />
      <BlogPreview />
      <Pricing />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  );
}
