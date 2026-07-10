// ============================================================================
// pages/home.jsx — PUBLIC LANDING PAGE  (route: /)
// ----------------------------------------------------------------------------
// The publicly accessible marketing / blog-discovery page. No authentication
// required. Composed of self-contained section components:
//
//   Navbar       — Fixed top bar with nav links (smooth scroll) and CTA buttons.
//   Hero         — Hero banner with pixel artwork, tagline, and call-to-action.
//   Ticker       — Auto-scrolling retro-terminal marquee strip.
//   Features     — Six feature cards (MODULE_01..06.SYS).
//   HowItWorks   — Four-step terminal workflow cards.
//   BlogPreview  — Fetches GET /api/v1/blogs and displays up to 5 published
//                  posts in a magazine layout (featured large + 4 sidebar).
//                  Falls back to hardcoded mock posts if the API is unavailable.
//   Pricing      — Three subscription tier cards (Hobbyist / Pro / Publication).
//   CTABanner    — System-dialog styled final call-to-action.
//   Footer       — Column links + social buttons.
//
// API CALLS:
//   GET /api/v1/blogs → BlogPreview fetches published posts on mount.
//     Only published (isPublished: true) posts are shown to public visitors.
//
// DESIGN:
//   Retro pixel / vaporwave aesthetic. Pixel art images live in /public/.
//   All components use the same CSS tokens as the dashboard (retro-accent, etc.)
// ============================================================================

import { useState, useEffect } from "react";
import {
  ArrowRight, X, Menu,
  Eye, Heart, Coffee, Globe, Award,
  Gamepad2, Compass, ChevronRight
} from "lucide-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   REUSABLE RETRO COMPONENTS
───────────────────────────────────────────── */
function RetroCard({ children, className = "", hover = true, titleBar }) {
  return (
    <div className={`
      aesthetic-card
      ${hover ? "aesthetic-card-hover" : ""}
      ${className}
    `}>
      {titleBar && (
        <div className="border-b-2 border-retro-border bg-[#13141f] px-4 py-2 flex items-center justify-between text-[10px] font-pixel tracking-wider text-retro-accent rounded-t-[16px]">
          <span>{titleBar}</span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 border border-retro-border bg-retro-accent/20" />
            <span className="w-1.5 h-1.5 border border-retro-border bg-retro-accent/40" />
          </div>
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

function RetroButton({ children, variant = "primary", className = "", onClick }) {
  const base = "aesthetic-btn select-none";
  const variants = {
    primary: "aesthetic-btn-primary",
    secondary: "aesthetic-btn-secondary",
    ghost: "border-transparent text-retro-text hover:text-retro-accent",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function RetroBadge({ children }) {
  return (
    <span className="aesthetic-badge">
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────
   GRID BACKGROUND
───────────────────────────────────────────── */
function GridBackground() {
  return null; // The background grid is now handled globally in index.css body style
}

const scrollToSection = (id) => {
  const sectionName = id.toLowerCase().replace(/ /g, "-");
  const element = document.getElementById(sectionName);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = ["Features", "How It Works", "Blog", "Pricing"];

  return (
    <nav className="fixed top-4 inset-x-4 z-50 transition-all duration-300 max-w-7xl mx-auto bg-retro-surface/90 backdrop-blur-md border-2 border-retro-border rounded-2xl shadow-[4px_4px_0px_0px_#1c1d2e] px-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with Rocket Icon */}
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-retro-accent fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L9 9H15L12 2ZM9 11H15V19H9V11ZM6 11H8V15H6V11ZM16 11H18V15H16V11ZM12 21H12.01V21.01H12V21Z" />
            </svg>
            <span className="text-retro-accent font-pixel text-sm tracking-widest uppercase">
              QuillForge
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 font-pixel text-[11px]">
            {links.map(l => (
              <button
                key={l}
                onClick={() => scrollToSection(l)}
                className="text-retro-text/70 hover:text-retro-accent uppercase tracking-wider transition-colors cursor-pointer"
              >
                {l}
              </button>
            ))}
          </div>

          {/* Color Swatches and CTA */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-[9px] font-pixel border border-retro-border/40 p-1 bg-[#13141f] rounded-lg">
              <span className="w-3 h-3 bg-[#8F72FF] rounded" title="Violet Accent" />
              <span className="w-3 h-3 bg-[#171825] rounded" title="Deep Navy Card" />
              <span className="w-3 h-3 bg-[#C8CAE8] rounded" title="Soft Lavender" />
            </div>
            <RetroButton
              variant="secondary"
              className="py-1 px-3"
              onClick={() => navigate("/login")}
            >
              Sign in
            </RetroButton>
            <RetroButton
              variant="primary"
              className="py-1 px-3"
              onClick={() => navigate("/register")}
            >
              Write
            </RetroButton>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-retro-accent border-2 border-retro-border bg-[#13141f] rounded-xl p-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-retro-surface border-t border-retro-border/40 px-4 py-4 space-y-3 font-pixel text-xs text-center rounded-b-2xl">
          {links.map(l => (
            <button
              key={l}
              onClick={() => { scrollToSection(l); setMenuOpen(false); }}
              className="block w-full py-2 text-retro-text/70 hover:text-retro-accent uppercase"
            >
              {l}
            </button>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <RetroButton variant="secondary" onClick={() => { setMenuOpen(false); navigate("/login"); }}>
              Sign In
            </RetroButton>
            <RetroButton variant="primary" onClick={() => { setMenuOpen(false); navigate("/register"); }}>
              Write
            </RetroButton>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero({ onWatchDemo }) {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-28 pb-16 overflow-hidden">
      <GridBackground />

      {/* Title */}
      <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-heading text-retro-accent tracking-widest uppercase leading-none mt-8 drop-shadow-[2px_2px_0px_#1C1D2E]">
        QUILLFORGE
      </h1>

      {/* Cozy Sub-Header Box */}
      <div className="mt-6 max-w-xl bg-retro-surface border-2 border-retro-border p-4 rounded-2xl shadow-[4px_4px_0px_0px_#1c1d2e]">
        <p className="text-xs sm:text-sm font-terminal text-retro-text/95 leading-relaxed">
          A handcrafted digital studio for writers who care about the craft. 
          No algorithms, no corporate noise, just raw thoughts on a virtual canvas.
        </p>
      </div>

      {/* Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
        <RetroButton variant="primary" onClick={() => navigate("/register")}>
          Become an author <ArrowRight size={12} />
        </RetroButton>
        <RetroButton variant="secondary" onClick={() => scrollToSection("blog")}>
          Go to library
        </RetroButton>
      </div>

      {/* Main Hero Showcase */}
      <div className="mt-16 w-full max-w-5xl px-4">
        {/* Frame container */}
        <div className="border-2 border-retro-border bg-retro-surface p-1 rounded-2xl shadow-[6px_6px_0px_0px_#1c1d2e] overflow-hidden">
          {/* Header block of frame */}
          <div className="border-b border-retro-border bg-retro-accent px-4 py-2 flex items-center justify-between text-xs font-pixel text-[#1C1D2E]">
            <span>SYSTEM_WORKSPACE_PREVIEW.EXE</span>
            <div className="flex gap-2">
              <span className="w-3 h-3 border border-[#1C1D2E] rounded-sm" />
              <span className="w-3 h-3 border border-[#1C1D2E] rounded-sm" />
            </div>
          </div>
          {/* Hero Image */}
          <img
            src="/hero-pixel.png"
            alt="Cozy Pixel Writer Workspace"
            className="w-full h-auto object-cover border-b border-retro-border"
          />
          {/* Icon bar at bottom */}
          <div className="bg-[#13141f] py-3 px-6 flex justify-around items-center text-retro-accent">
            <Coffee size={18} className="hover:scale-110 hover:text-retro-accent/80 transition-transform cursor-pointer" />
            <Gamepad2 size={18} className="hover:scale-110 hover:text-retro-accent/80 transition-transform cursor-pointer" />
            <Compass size={18} className="hover:scale-110 hover:text-retro-accent/80 transition-transform cursor-pointer" />
            <Award size={18} className="hover:scale-110 hover:text-retro-accent/80 transition-transform cursor-pointer" />
            <Globe size={18} className="hover:scale-110 hover:text-retro-accent/80 transition-transform cursor-pointer" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   BLOG PREVIEW / GALLERY
───────────────────────────────────────────── */
function BlogPreview() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  const fallbackPosts = [
    { _id: "mock1", emoji: "⚡", tag: "Technology", title: "The Return of Handcrafted Web Interfaces", author: "Keshav Kakani", read: "5 min", views: "12K", likesCount: 891, isMock: true, image: "/stars-pixel.png" },
    { _id: "mock2", emoji: "🎨", tag: "Design", title: "Why Pixel-Art Evokes Cozy digital Nostalgia", author: "Sara Kim", read: "8 min", views: "9K", likesCount: 723, isMock: true, image: "/typewriter-pixel.png" },
    { _id: "mock3", emoji: "🚀", tag: "Indie Web", title: "Escaping the Corporate Algorithm Bubbles", author: "Mike Torres", read: "12 min", views: "31K", likesCount: 2100, isMock: true, image: "/hero-pixel.png" },
    { _id: "mock4", emoji: "🧠", tag: "Tech", title: "Building Lightweight Web Apps in 2026", author: "Priya Nair", read: "10 min", views: "18K", likesCount: 1340, isMock: true, image: "/stars-pixel.png" },
    { _id: "mock5", emoji: "📐", tag: "Dev", title: "Writing Simple C++ Compilers from Scratch", author: "James Wu", read: "15 min", views: "7K", likesCount: 610, isMock: true, image: "/typewriter-pixel.png" },
  ];

  useEffect(() => {
    api.get("/blogs")
      .then(res => {
        const published = (res.data.data || []).filter(b => b.isPublished);
        if (published.length > 0) {
          // Merge real posts with mock images for consistent retro look
          const merged = published.map((p, idx) => ({
            ...p,
            image: [ "/stars-pixel.png", "/typewriter-pixel.png", "/hero-pixel.png" ][idx % 3]
          }));
          setPosts(merged.slice(0, 5));
        } else {
          setPosts(fallbackPosts);
        }
      })
      .catch(() => {
        setPosts(fallbackPosts);
      });
    // fallbackPosts is a static constant defined outside the component —
    // it will never change, so it is safe to omit from the dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const featuredPost = posts[0] || fallbackPosts[0];
  const sidePosts = posts.slice(1);

  return (
    <section id="blog" className="py-24 px-4 max-w-7xl mx-auto border-t-2 border-retro-border">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
        <div>
          <RetroBadge>Explore</RetroBadge>
          <h2 className="text-4xl md:text-5xl font-heading text-retro-accent uppercase mt-3 tracking-widest">
            the best stories this month
          </h2>
        </div>
        <RetroButton variant="secondary" onClick={() => navigate("/login")}>
          to the index <ChevronRight size={12} />
        </RetroButton>
      </div>

      {/* Gallery Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Large Featured Post */}
        <div className="lg:col-span-7">
          <RetroCard 
            titleBar={`FEATURED_STORY // BY ${featuredPost.author?.username || featuredPost.author || "ANONYMOUS"}`}
            hover={true}
            className="h-full flex flex-col"
          >
            <div 
              className="w-full aspect-video border-2 border-retro-border mb-4 overflow-hidden cursor-pointer"
              onClick={() => navigate(featuredPost.isMock ? "/login" : `/blog/${featuredPost._id}`)}
            >
              <img 
                src={featuredPost.image || "/stars-pixel.png"} 
                alt={featuredPost.title}
                className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
              />
            </div>
            <RetroBadge>{featuredPost.category || featuredPost.tag || "General"}</RetroBadge>
            <h3 
              className="text-2xl font-heading text-retro-accent uppercase tracking-wider mt-3 mb-2 hover:text-[#E2E2D5] cursor-pointer"
              onClick={() => navigate(featuredPost.isMock ? "/login" : `/blog/${featuredPost._id}`)}
            >
              {featuredPost.title}
            </h3>
            <p className="text-xs text-retro-text/60 font-terminal leading-relaxed mb-6">
              {featuredPost.content ? (featuredPost.content.substring(0, 180) + "...") : "Discover high-quality development diaries, engineering breakdowns, and creative essays hosted on QuillForge."}
            </p>
            <div className="mt-auto pt-4 border-t border-retro-border/50 flex justify-between items-center text-[10px] font-pixel text-retro-text/40">
              <span>{featuredPost.readTime || featuredPost.read || "5 MIN"} READ</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Eye size={10}/> {featuredPost.views || 0}</span>
                <span className="flex items-center gap-1"><Heart size={10}/> {featuredPost.likesCount || (featuredPost.likes || []).length}</span>
              </div>
            </div>
          </RetroCard>
        </div>

        {/* Right Side: Grid of 4 Smaller Cards */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {sidePosts.map((p, idx) => (
            <div 
              key={p._id || idx}
              onClick={() => navigate(p.isMock ? "/login" : `/blog/${p._id}`)}
              className="group border-2 border-retro-border bg-retro-surface hover:border-retro-accent p-3 flex gap-4 transition-all duration-300 cursor-pointer"
            >
              <div className="w-24 h-20 border border-retro-border overflow-hidden flex-shrink-0 bg-retro-bg">
                <img 
                  src={p.image || "/typewriter-pixel.png"} 
                  alt={p.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <span className="text-[9px] font-pixel text-retro-accent uppercase">{p.category || p.tag || "General"}</span>
                  <h4 className="text-sm font-heading text-retro-text group-hover:text-retro-accent uppercase tracking-wide truncate mt-1">
                    {p.title}
                  </h4>
                </div>
                <div className="flex justify-between items-center text-[9px] font-pixel text-retro-text/40 pt-2 border-t border-retro-border/20">
                  <span>BY {p.author?.username || p.author || "WRITER"}</span>
                  <span className="flex items-center gap-1"><Heart size={8}/> {p.likesCount || (p.likes || []).length}</span>
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
   FEATURES SECTION
───────────────────────────────────────────── */
function Features() {
  const features = [
    { icon: "⚡", title: "Bitmapped Markdown Editor", desc: "A clean monospace writing pad with instant local storage backups and responsive formatting controllers." },
    { icon: "📊", title: "Terminal Analytics", desc: "No complex Google tracking. Simple, server-incremented click counters and like logs mapped inside terminal panels." },
    { icon: "🛡️", title: "Secure Session Locks", desc: "Encrypted JWT session keys and quick Google OAuth bridges providing industry-standard secure user flows." },
    { icon: "🌐", title: "Built-in Site indexing", desc: "Pre-rendered sitemaps and clean meta headers optimized for direct discoverability across search directories." },
    { icon: "👥", title: "Cozy community boards", desc: "Granular profile cards, RSS feeds, bookmark hooks, and linear nested response threads." },
    { icon: "☕", title: "Zero ad monetization", desc: "Implement direct tip hooks or newsletter signups without corporate platform middlemen." },
  ];

  return (
    <section id="features" className="py-24 px-4 border-t-2 border-retro-border bg-retro-surface/10">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <RetroBadge>Capabilities</RetroBadge>
        <h2 className="text-4xl md:text-5xl font-heading text-retro-accent uppercase mt-3 tracking-widest">
          EVERYTHING A WRITER NEEDS
        </h2>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <RetroCard key={i} titleBar={`MODULE_0${i + 1}.SYS`} hover={true}>
            <div className="text-2xl mb-4">{f.icon}</div>
            <h3 className="text-lg font-heading text-retro-accent uppercase tracking-wider mb-2">{f.title}</h3>
            <p className="text-xs text-retro-text/60 font-terminal leading-relaxed">{f.desc}</p>
          </RetroCard>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { cmd: "quill --register", desc: "Set up your retro publishing profile card in seconds." },
    { cmd: "quill --create-post", desc: "Draft with clean Markdown in our distraction-free space." },
    { cmd: "quill --publish", desc: "Deploy your post to the global feed and explore boards." },
    { cmd: "quill --track-stats", desc: "Monitor view graphs and likes inside your profile terminal." },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 border-t-2 border-retro-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <RetroBadge>Terminal workflow</RetroBadge>
          <h2 className="text-4xl md:text-5xl font-heading text-retro-accent uppercase mt-3 tracking-widest">
            Simple Command Sequence
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="border-2 border-retro-border bg-retro-surface p-5 rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E]">
              <div className="font-pixel text-[10px] text-retro-accent mb-3">STEP_0{i + 1}.EXE</div>
              <div className="font-terminal text-xs text-retro-accent bg-[#13141f] p-2.5 border border-retro-border/50 mb-3 truncate rounded-lg">
                $ {s.cmd}
              </div>
              <p className="text-xs text-retro-text/75 font-terminal leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PRICING
───────────────────────────────────────────── */
function Pricing() {
  const plans = [
    { name: "HOBBYIST", price: "0", desc: "For casual writers", features: ["5 blog posts / mo", "Basic terminal analytics", "Standard markdown pad", "Public card profile"] },
    { name: "PRO WRITER", price: "9", desc: "For serious creators", features: ["Unlimited posts", "Complete click analytics", "Custom domain binding", "RSS subscriber tools", "Priority support channels"] },
    { name: "PUBLICATION", price: "29", desc: "For editorial teams", features: ["Everything in Pro", "Up to 10 author profiles", "Team analytics logs", "Admin dashboard panel", "API access hooks"] }
  ];

  return (
    <section id="pricing" className="py-24 px-4 border-t-2 border-retro-border bg-retro-surface/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <RetroBadge>Monetization</RetroBadge>
          <h2 className="text-4xl md:text-5xl font-heading text-retro-accent uppercase mt-3 tracking-widest">
            TRANSPARENT SUBSCRIPTIONS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((p, i) => (
            <div 
              key={i} 
              className={`border-2 border-retro-border p-6 flex flex-col rounded-2xl transition-all duration-300 ${
                i === 1 ? "bg-retro-surface border-retro-accent shadow-[6px_6px_0px_0px_#1C1D2E] lg:-translate-y-3" : "bg-retro-surface/90 shadow-[4px_4px_0px_0px_#1C1D2E]"
              }`}
            >
              <h3 className="font-heading text-2xl text-retro-accent uppercase tracking-wider">{p.name}</h3>
              <p className="text-[10px] font-pixel text-retro-text/40 mt-1">{p.desc}</p>
              
              <div className="my-6 flex items-baseline gap-1 font-heading text-4xl text-retro-accent">
                <span>${p.price}</span>
                {p.price !== "0" && <span className="text-xs font-pixel text-retro-text/30">/MO</span>}
              </div>

              <ul className="space-y-3 flex-1 mb-8 text-xs font-terminal text-retro-text/75 border-t border-retro-border/20 pt-4">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <span className="text-retro-accent">▶</span> {f}
                  </li>
                ))}
              </ul>

              <RetroButton 
                variant={i === 1 ? "primary" : "secondary"}
                className="w-full justify-center"
                onClick={() => {
                  if (p.name === "PUBLICATION") {
                    window.location.href = "mailto:kkakani160@gmail.com?subject=QuillForge Enterprise Plan Inquiry";
                  } else {
                    window.location.href = "/register";
                  }
                }}
              >
                SELECT PLAN
              </RetroButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   SYSTEM DIALOG / CTA BANNER
───────────────────────────────────────────── */
function CTABanner() {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 max-w-4xl mx-auto">
      <div className="border-2 border-retro-border bg-retro-surface p-1 rounded-2xl shadow-[6px_6px_0px_0px_#1c1d2e] overflow-hidden">
        {/* Title bar */}
        <div className="border-b border-retro-border bg-retro-accent px-4 py-2 flex items-center justify-between text-xs font-pixel text-[#1C1D2E]">
          <span>ALERT_SYSTEM_CONFIRM.EXE</span>
          <span className="font-bold cursor-pointer">X</span>
        </div>
        {/* Dialog body */}
        <div className="p-8 text-center flex flex-col items-center">
          <svg className="w-12 h-12 text-retro-accent fill-current mb-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" />
          </svg>
          <h3 className="text-3xl font-heading text-retro-accent uppercase tracking-wider mb-2">
            YOUR WORDS DESERVE A COZY HOME
          </h3>
          <p className="text-xs text-retro-text/60 font-terminal max-w-md mb-8 leading-relaxed">
            Join thousands of writers sharing their journals, code logs, and pixel guides. 
            Free forever. No credit cards, trackers, or cookies required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <RetroButton variant="primary" onClick={() => navigate("/register")}>
              CREATE PROFILE
            </RetroButton>
            <RetroButton variant="secondary" onClick={() => window.open("https://github.com/unitedtechlab/QUillForge_", "_blank")}>
              READ DOCS
            </RetroButton>
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
    { heading: "Studio", links: ["Features", "Pricing", "Changelog"] },
    { heading: "Creators", links: ["Browse", "Profiles", "Activity"] },
    { heading: "Archives", links: ["Documentation", "API Spec", "Source"] },
    { heading: "Protocol", links: ["Privacy Log", "Terms.txt", "Security"] }
  ];

  return (
    <footer className="border-t-2 border-retro-border py-16 px-4 bg-retro-surface text-retro-text">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4 text-retro-accent font-pixel text-xs tracking-wider">
              <span>QUILLFORGE</span>
            </div>
            <p className="text-retro-text/60 text-xs font-terminal leading-relaxed mb-6">
              A writing studio where thoughts are compiled like beautiful retro software.
            </p>
            <div className="flex gap-2">
              {["GH", "RSS", "MAIL"].map((text) => (
                <button 
                  key={text} 
                  className="px-2 py-1 border border-retro-border rounded text-[9px] font-pixel text-retro-text/60 hover:text-retro-accent hover:border-retro-accent transition-colors"
                  onClick={() => window.open("https://github.com/unitedtechlab/QUillForge_", "_blank")}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.heading}>
              <h4 className="text-retro-accent font-pixel text-[10px] uppercase tracking-wider mb-4">{col.heading}</h4>
              <ul className="space-y-2 font-terminal text-xs text-retro-text/50">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="/" className="hover:text-retro-accent transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-retro-border/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-pixel text-retro-text/40">
          <span>© 1998-2026 QUILLFORGE PROTOCOL.</span>
          <div className="flex items-center gap-2">
            <span>SOC2 BYPASS · COOKIE-FREE ZONE · uptime: 99.9%</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Home() {
  const [showDemo, setShowDemo] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-retro-text font-terminal selection:bg-retro-accent selection:text-[#1c1d2e]">
      {/* Preamble Reset */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
      `}</style>

      <Navbar />
      <Hero onWatchDemo={() => setShowDemo(true)} />
      
      {/* Logo Strip replaced with pixel terminal ticker */}
      <section className="relative py-4 border-y-2 border-retro-border bg-[#13141f] overflow-hidden font-pixel text-[10px] text-retro-accent">
        <div className="flex gap-12 animate-[scroll_25s_linear_infinite] whitespace-nowrap">
          {Array(8).fill("SYSTEM RUNNING // ZERO COOKIES // HOSTED ON DECENTRALIZED PROTOCOLS // WRITE WITHOUT DISTRACTIONS").map((text, idx) => (
            <span key={idx} className="uppercase tracking-widest">{text}</span>
          ))}
        </div>
        <style>{`
          @keyframes scroll {
            from { transform: translateX(0) }
            to { transform: translateX(-50%) }
          }
        `}</style>
      </section>

      <Features />
      <HowItWorks />
      <BlogPreview />
      <Pricing />
      <CTABanner />
      <Footer />

      {/* Demo Modal Styled as alert system dialog */}
      {showDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative w-full max-w-lg border-2 border-retro-border bg-retro-surface rounded-2xl shadow-[6px_6px_0px_0px_#1C1D2E] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-retro-border bg-retro-accent text-xs font-pixel text-[#1C1D2E]">
              <span>WALKTHROUGH_MODULE.EXE</span>
              <button className="font-bold hover:scale-110" onClick={() => setShowDemo(false)}>
                X
              </button>
            </div>
            <div className="p-6 text-center flex flex-col items-center">
              <div className="w-12 h-12 border-2 border-retro-accent flex items-center justify-center text-retro-accent font-pixel text-xl mb-4 rounded-xl">
                !
              </div>
              <h3 className="text-xl font-heading text-retro-accent uppercase tracking-wider mb-2">Walkthrough Coming Soon</h3>
              <p className="text-xs text-retro-text/60 font-terminal mb-6 max-w-sm">
                Our core systems are compiling this module. Access the studio by registering your card profile now!
              </p>
              <RetroButton variant="primary" className="text-xs" onClick={() => { setShowDemo(false); navigate("/register"); }}>
                SIGN UP NOW <ArrowRight size={10} />
              </RetroButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
