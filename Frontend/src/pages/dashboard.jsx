import { useState, useEffect, useRef } from "react";
import {
  Feather, LayoutDashboard, BookOpen, PenLine, BarChart3,
  Users, Settings, LogOut, Bell, Search, Plus, Eye, Heart,
  MessageSquare, TrendingUp, TrendingDown, ArrowRight, Menu, X,
  MoreHorizontal, Edit3, Trash2, ExternalLink, Star, Zap,
  Calendar, Clock, Tag, ChevronRight, ChevronUp, Sparkles,
  Globe, Lock, FileText, Activity, BookMarked
} from "lucide-react";

import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import CreateBlogPage from "./CreateBlogPage";
import MyBlogsPage from "./UserOwnBlogs";
import ReadBlogsPage from "./ReadBlogsFeed";



/* ─────────────────── CONSTANTS ─────────────────── */
const ACCENT = { ox: "'Oxanium',sans-serif", mono: "'Space Mono',monospace" };

const BLOGS = [
  { id: 1, title: "Building Scalable APIs with Node.js and Express", category: "Technology", status: "published", views: 8241, likes: 432, comments: 38, date: "Jun 1, 2025", readTime: "8 min", emoji: "⚡" },
  { id: 2, title: "The Art of Minimalist UI Design Systems", category: "Design", status: "published", views: 5712, likes: 289, comments: 24, date: "May 24, 2025", readTime: "6 min", emoji: "🎨" },
  { id: 3, title: "Mastering TypeScript Generics — A Deep Dive", category: "Dev", status: "published", views: 10183, likes: 567, comments: 61, date: "May 18, 2025", readTime: "12 min", emoji: "🔷" },
  { id: 4, title: "My Productivity Stack as a Solo Developer", category: "Lifestyle", status: "draft", views: 0, likes: 0, comments: 0, date: "Jun 3, 2025", readTime: "5 min", emoji: "🛠️" },
  { id: 5, title: "Why I Left React for Solid.js (And Came Back)", category: "Technology", status: "published", views: 14500, likes: 921, comments: 95, date: "Apr 30, 2025", readTime: "10 min", emoji: "🚀" },
];

const SPARKLINE_DATA = [18, 32, 27, 45, 38, 60, 52, 78, 65, 82, 70, 94];

/* ─────────────────── BACKGROUND ─────────────────── */
function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(99,102,241,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.035) 1px,transparent 1px)`,
        backgroundSize: "72px 72px",
      }} />
      <div className="absolute -top-40 right-0 w-[700px] h-[700px] bg-violet-600/8 rounded-full blur-[130px]" />
      <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-cyan-500/6 rounded-full blur-[110px]" />
      <div className="absolute -bottom-40 right-1/3 w-[500px] h-[400px] bg-pink-600/5 rounded-full blur-[110px]" />
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px",
      }} />
    </div>
  );
}

/* ─────────────────── ANIMATED COUNTER ─────────────────── */
function AnimatedNumber({ target, duration = 1400, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  useEffect(() => {
    startRef.current = performance.now();
    const tick = (now) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  const formatted = display >= 1000 ? `${(display / 1000).toFixed(display >= 10000 ? 0 : 1)}K` : display.toString();
  return <>{formatted}{suffix}</>;
}

/* ─────────────────── SPARKLINE ─────────────────── */
function Sparkline({ data, color = "#22d3ee", height = 40 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 120, h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h * 0.85 - h * 0.075;
    return `${x},${y}`;
  }).join(" ");
  const area = `M0,${h} L${pts.split(" ").map(p => p).join(" L")} L${w},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace("#","")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────────────── SIDEBAR ─────────────────── */
function Sidebar({ active, setActive, collapsed, setCollapsed, setEditingBlog, handleNewBlog, handleLogout }) {
  const nav = [
    { id: "dashboard", icon: <LayoutDashboard size={16}/>, label: "Dashboard" },
    { id: "create",    icon: <PenLine size={16}/>,         label: "Create Blog" },
    { id: "blogs",     icon: <BookMarked size={16}/>,      label: "My Blogs" },
    { id: "read",      icon: <BookOpen size={16}/>,        label: "Read Blogs" },
    { id: "community", icon: <Users size={16}/>,           label: "Community" },
  ];
  const bottom = [
    { id: "logout",   icon: <LogOut size={16}/>,   label: "Logout" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setCollapsed(true)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        border-r border-white/[0.06] bg-[#080b14]/95 backdrop-blur-xl
        transition-all duration-300 ease-in-out
        ${collapsed ? "-translate-x-full lg:translate-x-0 lg:w-[68px]" : "translate-x-0 w-[230px]"}
      `}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/[0.06] flex-shrink-0 ${collapsed ? "lg:justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
            <Feather size={14} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-white font-black text-lg tracking-tight whitespace-nowrap" style={{ fontFamily: ACCENT.ox }}>
              Quill<span className="text-cyan-400">.</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-hidden">
          {nav.map(item => {
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => { if (item.id === "create") { handleNewBlog(); } else { setActive(item.id); } setCollapsed(window.innerWidth < 1024 ? true : collapsed); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/15 to-violet-500/10 border border-cyan-500/25 text-white"
                    : "text-white/35 hover:text-white/70 hover:bg-white/[0.04] border border-transparent"
                } ${collapsed ? "lg:justify-center lg:px-2" : ""}`}
              >
                <span className={`flex-shrink-0 transition-colors ${isActive ? "text-cyan-400" : "group-hover:text-cyan-400/70"}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="text-xs font-medium whitespace-nowrap" style={{ fontFamily: ACCENT.ox }}>
                    {item.label}
                  </span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1 h-1 rounded-full bg-cyan-400" />
                )}
                {/* Tooltip for collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 hidden lg:block"
                    style={{ fontFamily: ACCENT.ox }}>
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/[0.06] space-y-1">
          {bottom.map(item => (
            <button key={item.id}
              onClick={() => {
                if (item.id === "logout") {
                  handleLogout();
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-white/30 hover:text-white/60 hover:bg-white/[0.04] group relative ${collapsed ? "lg:justify-center lg:px-2" : ""}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="text-xs font-medium whitespace-nowrap" style={{ fontFamily: ACCENT.ox }}>{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 hidden lg:block"
                  style={{ fontFamily: ACCENT.ox }}>
                  {item.label}
                </div>
              )}
            </button>
          ))}

          {/* Collapse toggle — desktop only */}
          <button onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all duration-200 justify-center mt-1">
            <ChevronRight size={14} className={`transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
          </button>
        </div>
      </aside>
    </>
  );
}

/* ─────────────────── TOPBAR ─────────────────── */
function Topbar({ collapsed, setCollapsed, user, setActive, setEditingBlog, handleNewBlog }) {
  const [search, setSearch] = useState("");
  const [notifs, setNotifs] = useState(3);

  return (
    <header className="fixed top-0 right-0 left-0 h-16 z-20 border-b border-white/[0.06] bg-[#080b14]/80 backdrop-blur-xl flex items-center px-4 gap-4"
      style={{ paddingLeft: collapsed ? "calc(68px + 16px)" : "calc(230px + 16px)", transition: "padding 300ms ease" }}>

      {/* Mobile hamburger */}
      <button className="lg:hidden text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-all"
        onClick={() => setCollapsed(!collapsed)}>
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search blogs, drafts..."
          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.06] transition-all"
          style={{ fontFamily: ACCENT.mono }}
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* New blog shortcut */}
        <button onClick={handleNewBlog} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg,#22d3ee 0%,#7c3aed 100%)", fontFamily: ACCENT.ox }}>
          <Plus size={13} /> New Blog
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.07] flex items-center justify-center text-white/40 hover:text-white transition-all">
          <Bell size={15} />
          {notifs > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-[9px] font-bold text-white flex items-center justify-center">
              {notifs}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-xs font-black text-white cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
          style={{ fontFamily: ACCENT.ox }}>
          {user?.username?.slice(0,2).toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
}

/* ─────────────────── WELCOME ─────────────────── */
function WelcomeSection({ visible, user, setActive, setEditingBlog, handleNewBlog }) {
    console.log("WELCOME USER:", user);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const tips = [
    "Your last post got 2× more views than average 🚀",
    "Tuesday posts get 34% more engagement on Quill",
    "Add 3 tags to boost discoverability by 60%",
  ];
  const [tip] = useState(tips[Math.floor(Math.random() * tips.length)]);

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-cyan-500/8 via-violet-500/6 to-transparent p-6 sm:p-8">
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/25 bg-cyan-400/8 text-cyan-300 text-xs font-medium"
              style={{ fontFamily: ACCENT.ox }}>
              <Sparkles size={9} /> {greeting}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight" style={{ fontFamily: ACCENT.ox }}>
              {user?.username || "Loading..."}<span className="text-cyan-400">.</span>
            </h1>
            <p className="text-white/35 text-sm" style={{ fontFamily: ACCENT.mono }}>
              @{user?.username || "loading"} · Writer since Jan 2024
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3">
            <button onClick={handleNewBlog} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.3)] hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg,#22d3ee 0%,#7c3aed 100%)", fontFamily: ACCENT.ox }}>
              <Plus size={14} /> Create New Blog
            </button>
            <div className="flex items-center gap-2 text-xs text-white/30 max-w-[240px]" style={{ fontFamily: ACCENT.mono }}>
              <Zap size={10} className="text-amber-400 flex-shrink-0" />
              <span>{tip}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── STAT CARDS ─────────────────── */
function StatCards({ visible }) {
  const cards = [
    {
      label: "Total Blogs",
      value: 5,
      icon: <FileText size={18}/>,
      iconBg: "bg-cyan-400/10 border-cyan-400/20 text-cyan-400",
      trend: "+2 this month",
      up: true,
      color: "from-cyan-400 to-cyan-300",
      sparkColor: "#22d3ee",
      data: [1,2,2,3,3,4,4,4,5,5,5,5],
      suffix: "",
    },
    {
      label: "Total Views",
      value: 38636,
      icon: <Eye size={18}/>,
      iconBg: "bg-violet-400/10 border-violet-400/20 text-violet-400",
      trend: "+14.2% vs last month",
      up: true,
      color: "from-violet-400 to-violet-300",
      sparkColor: "#a78bfa",
      data: SPARKLINE_DATA,
      suffix: "",
    },
    {
      label: "Total Likes",
      value: 2209,
      icon: <Heart size={18}/>,
      iconBg: "bg-pink-400/10 border-pink-400/20 text-pink-400",
      trend: "+8.7% vs last month",
      up: true,
      color: "from-pink-400 to-pink-300",
      sparkColor: "#f472b6",
      data: [20,35,28,45,38,55,48,72,60,80,68,90],
      suffix: "",
    },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {cards.map((c, i) => (
        <div key={i}
          className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionDelay: `${i * 100}ms` }}>
          <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.13] hover:bg-white/[0.04] transition-all duration-300 p-5 overflow-hidden group">
            {/* Hover glow */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
              style={{ background: `radial-gradient(circle at 0% 0%, ${c.sparkColor}08, transparent 70%)` }} />

            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${c.iconBg}`}>
                {c.icon}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full ${
                c.up ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20" : "text-red-400 bg-red-400/10 border border-red-400/20"
              }`} style={{ fontFamily: ACCENT.ox }}>
                {c.up ? <ChevronUp size={9}/> : <TrendingDown size={9}/>}
                {c.trend.split(" ")[0]}
              </div>
            </div>

            <div className={`text-3xl font-black bg-gradient-to-r ${c.color} bg-clip-text text-transparent mb-1`}
              style={{ fontFamily: ACCENT.ox }}>
              <AnimatedNumber target={c.value} />
            </div>
            <p className="text-white/35 text-xs mb-4" style={{ fontFamily: ACCENT.mono }}>{c.label}</p>

            <Sparkline data={c.data} color={c.sparkColor} />

            <p className="text-white/20 text-[10px] mt-2" style={{ fontFamily: ACCENT.mono }}>{c.trend}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────── STATUS BADGE ─────────────────── */
function StatusBadge({ status }) {
  const map = {
    published: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
    draft:     "text-amber-400  bg-amber-400/10  border-amber-400/25",
    flagged:   "text-red-400    bg-red-400/10    border-red-400/25",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${map[status]}`}
      style={{ fontFamily: ACCENT.ox }}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "published" ? "bg-emerald-400" : status === "draft" ? "bg-amber-400" : "bg-red-400"}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

/* ─────────────────── BLOG ROW ─────────────────── */
function BlogRow({ blog, index, visible, setActive, setEditingBlog, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Support both mock and real database formats
  const displayTitle = blog.title;
  const displayCategory = blog.category || "General";
  const displayStatus = blog.status || (blog.isPublished ? "published" : "draft");
  const displayViews = blog.views || 0;
  const displayLikes = blog.likes || 0;
  const displayComments = blog.comments || 0;
  const displayDate = blog.date || (blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "Jun 1, 2025");
  const displayReadTime = blog.readTime || "5 min";
  const displayEmoji = blog.emoji || (blog.isPublished ? "⚡" : "📝");

  const handleEdit = async () => {
    if (blog._id) {
      try {
        const res = await api.get(`/blogs/${blog._id}`);
        setEditingBlog(res.data.data);
        setActive("create");
      } catch (err) {
        console.error("Failed to load blog for editing:", err);
        alert("Failed to load blog");
      }
    } else {
      setEditingBlog(blog);
      setActive("create");
    }
  };

  const handleView = () => {
    if (blog._id) {
      navigate(`/blog/${blog._id}`);
    } else {
      alert("Mock posts cannot be viewed.");
    }
  };

  const handleDelete = async () => {
    if (blog._id) {
      if (window.confirm("Are you sure you want to delete this blog?")) {
        try {
          await api.delete(`/blogs/${blog._id}`);
          onDelete(blog._id);
        } catch (err) {
          console.error("Failed to delete blog:", err);
          alert("Failed to delete blog");
        }
      }
    } else {
      onDelete(blog.id);
    }
  };

  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-white/[0.05] hover:border-cyan-400/20 hover:bg-white/[0.03] transition-all duration-300 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
      style={{ transitionDelay: `${index * 80}ms`, transitionDuration: "600ms" }}>

      {/* Emoji thumb */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/[0.07] flex items-center justify-center text-xl flex-shrink-0">
        {displayEmoji}
      </div>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-white/85 text-sm font-semibold truncate group-hover:text-white transition-colors"
            style={{ fontFamily: ACCENT.ox }}>
            {displayTitle}
          </p>
          <StatusBadge status={displayStatus} />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-white/25" style={{ fontFamily: ACCENT.mono }}>
          <span className="flex items-center gap-1"><Tag size={9}/>{displayCategory}</span>
          <span className="flex items-center gap-1"><Clock size={9}/>{displayReadTime}</span>
          <span className="flex items-center gap-1"><Calendar size={9}/>{displayDate}</span>
        </div>
      </div>

      {/* Stats */}
      {displayStatus === "published" && (
        <div className="flex items-center gap-4 text-xs flex-shrink-0">
          <div className="text-center">
            <p className="text-white/60 font-semibold" style={{ fontFamily: ACCENT.ox }}>
              {displayViews >= 1000 ? `${(displayViews / 1000).toFixed(1)}K` : displayViews}
            </p>
            <p className="text-white/20 text-[9px] flex items-center gap-1 justify-center" style={{ fontFamily: ACCENT.mono }}><Eye size={8}/>Views</p>
          </div>
          <div className="text-center">
            <p className="text-pink-400 font-semibold" style={{ fontFamily: ACCENT.ox }}>{displayLikes}</p>
            <p className="text-white/20 text-[9px] flex items-center gap-1 justify-center" style={{ fontFamily: ACCENT.mono }}><Heart size={8}/>Likes</p>
          </div>
          <div className="text-center">
            <p className="text-violet-400 font-semibold" style={{ fontFamily: ACCENT.ox }}>{displayComments}</p>
            <p className="text-white/20 text-[9px] flex items-center gap-1 justify-center" style={{ fontFamily: ACCENT.mono }}><MessageSquare size={8}/>Comments</p>
          </div>
        </div>
      )}

      {/* Action menu */}
      <div className="relative flex-shrink-0">
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="w-8 h-8 rounded-lg border border-white/[0.06] hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.07] flex items-center justify-center text-white/30 hover:text-white transition-all">
          <MoreHorizontal size={14}/>
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1.5 w-36 rounded-xl border border-white/[0.09] bg-[#0d1220] backdrop-blur-xl shadow-2xl shadow-black/50 z-20 overflow-hidden py-1">
              {[
                { icon: <Edit3 size={12}/>, label: "Edit", color: "text-white/60", action: handleEdit },
                { icon: <ExternalLink size={12}/>, label: "View Post", color: "text-white/60", action: handleView },
                { icon: <Trash2 size={12}/>, label: "Delete", color: "text-red-400/80", action: handleDelete },
              ].map((a, i) => (
                <button key={i} onClick={() => { setMenuOpen(false); a.action(); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs ${a.color} hover:bg-white/[0.05] transition-all`}
                  style={{ fontFamily: ACCENT.mono }}>
                  {a.icon}{a.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────── RECENT BLOGS ─────────────────── */
function RecentBlogs({ visible, setActive, setEditingBlog, currentUser }) {
  const [blogs, setBlogs] = useState([]);
  const [filter, setFilter] = useState("all");
  const filters = ["all", "published", "draft"];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get("/blogs");
        if (res.data && res.data.data && res.data.data.length > 0) {
          setBlogs(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch blogs in dashboard:", err);
      }
    };
    fetchBlogs();
  }, []);

  const handleDeleteBlog = (id) => {
    setBlogs(prev => prev.filter(b => (b._id || b.id) !== id));
  };

  // Keep only the blogs authored by the current user
  const userBlogs = blogs.filter((b) => {
    if (!currentUser) return false;
    if (!b.author) return false;
    const authorId = typeof b.author === "object" ? b.author?._id : b.author;
    return authorId === currentUser._id;
  });

  const filtered = filter === "all"
    ? userBlogs
    : userBlogs.filter(b => {
        const status = b.status || (b.isPublished ? "published" : "draft");
        return status === filter;
      });

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: "300ms" }}>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-base font-black text-white" style={{ fontFamily: ACCENT.ox }}>Recent Blogs</h2>
            <p className="text-white/25 text-xs mt-0.5" style={{ fontFamily: ACCENT.mono }}>{userBlogs.length} total posts</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1">
              {filters.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                    filter === f
                      ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/15 border border-cyan-500/25 text-white"
                      : "text-white/30 hover:text-white/60"
                  }`} style={{ fontFamily: ACCENT.ox }}>
                  {f}
                </button>
              ))}
            </div>
            <button onClick={() => setActive("blogs")} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.07] hover:border-white/20 text-white/40 hover:text-white text-xs transition-all"
              style={{ fontFamily: ACCENT.ox }}>
              View all <ChevronRight size={12}/>
            </button>
          </div>
        </div>

        {/* Blog list */}
        <div className="p-4 space-y-2">
          {filtered.map((blog, i) => (
            <BlogRow key={blog._id || blog.id} blog={blog} index={i} visible={visible} setActive={setActive} setEditingBlog={setEditingBlog} onDelete={handleDeleteBlog} />
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <FileText size={28} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/25 text-sm" style={{ fontFamily: ACCENT.mono }}>No {filter} blogs yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── ACTIVITY FEED ─────────────────── */
function ActivityFeed({ visible }) {
  const items = [
    { icon: <Heart size={12}/>, color: "text-pink-400 bg-pink-400/10 border-pink-400/20", text: "Sarah liked your post", sub: "TypeScript Generics", time: "2m ago" },
    { icon: <MessageSquare size={12}/>, color: "text-violet-400 bg-violet-400/10 border-violet-400/20", text: "New comment from Mike", sub: "Scalable APIs post", time: "18m ago" },
    { icon: <Eye size={12}/>, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20", text: "Your post is trending", sub: "800+ views today", time: "1h ago" },
    { icon: <Users size={12}/>, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", text: "14 new followers", sub: "This week", time: "3h ago" },
    { icon: <Star size={12}/>, color: "text-amber-400 bg-amber-400/10 border-amber-400/20", text: "Featured on homepage", sub: "Minimalist UI post", time: "1d ago" },
  ];

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: "400ms" }}>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-base font-black text-white" style={{ fontFamily: ACCENT.ox }}>Activity</h2>
            <p className="text-white/25 text-xs mt-0.5" style={{ fontFamily: ACCENT.mono }}>Recent notifications</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div className="p-4 space-y-2.5">
          {items.map((item, i) => (
            <div key={i}
              className={`flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200 cursor-pointer group ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
              style={{ transitionDelay: `${400 + i * 60}ms`, transitionDuration: "500ms" }}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center border flex-shrink-0 ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/70 text-xs group-hover:text-white transition-colors" style={{ fontFamily: ACCENT.mono }}>
                  {item.text}
                </p>
                <p className="text-white/25 text-[10px] mt-0.5 truncate" style={{ fontFamily: ACCENT.mono }}>
                  {item.sub}
                </p>
              </div>
              <span className="text-white/20 text-[10px] flex-shrink-0 mt-0.5" style={{ fontFamily: ACCENT.mono }}>
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── QUICK ACTIONS ─────────────────── */
function QuickActions({ visible, setActive, setEditingBlog, handleNewBlog, setReadAdminOnly }) {
  const actions = [
    { icon: <PenLine size={16}/>, label: "New Blog", desc: "Start writing", gradient: "from-cyan-500 to-violet-500", shadow: "shadow-cyan-500/20", onClick: handleNewBlog },
    {
      icon: <Star size={16}/>,
      label: "Featured by Admin",
      desc: "Admin picks",
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/20",
      onClick: () => { setReadAdminOnly(true); setActive("read"); }
    },
    { icon: <Globe size={16}/>, label: "Go Live", desc: "Publish draft", gradient: "from-emerald-500 to-cyan-500", shadow: "shadow-emerald-500/20", onClick: () => setActive("blogs") },
  ];

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: "500ms" }}>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-base font-black text-white" style={{ fontFamily: ACCENT.ox }}>Quick Actions</h2>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3">
          {actions.map((a, i) => (
            <button key={i} onClick={a.onClick}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 group hover:scale-[1.02] active:scale-[0.98]">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-white shadow-lg ${a.shadow} group-hover:shadow-xl transition-all`}>
                {a.icon}
              </div>
              <div className="text-center">
                <p className="text-white/70 text-xs font-semibold group-hover:text-white transition-colors" style={{ fontFamily: ACCENT.ox }}>{a.label}</p>
                <p className="text-white/25 text-[9px]" style={{ fontFamily: ACCENT.mono }}>{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── WRITING STREAK ─────────────────── */
function WritingStreak({ visible }) {
  const weeks = 12;
  const days = Array.from({ length: weeks * 7 }, (_, i) => ({
    val: Math.random() > 0.45 ? Math.floor(Math.random() * 4) + 1 : 0,
  }));
  const levels = ["bg-white/[0.05]", "bg-cyan-900/60", "bg-cyan-700/70", "bg-cyan-500/80", "bg-cyan-400"];

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: "600ms" }}>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-base font-black text-white" style={{ fontFamily: ACCENT.ox }}>Writing Streak</h2>
            <p className="text-white/25 text-xs mt-0.5" style={{ fontFamily: ACCENT.mono }}>12-week activity heatmap</p>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ fontFamily: ACCENT.ox }}>
            <Activity size={12} className="text-cyan-400" />
            <span className="text-cyan-400 font-bold">5 day streak</span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {Array.from({ length: weeks }, (_, w) => (
              <div key={w} className="flex flex-col gap-1 flex-shrink-0">
                {Array.from({ length: 7 }, (_, d) => {
                  const cell = days[w * 7 + d];
                  return (
                    <div key={d} title={`${cell.val} post${cell.val !== 1 ? "s" : ""}`}
                      className={`w-3 h-3 rounded-sm ${levels[cell.val]} transition-all hover:scale-125 cursor-pointer`} />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 text-[10px] text-white/20" style={{ fontFamily: ACCENT.mono }}>
            <span>Less</span>
            {levels.map((l, i) => <div key={i} className={`w-3 h-3 rounded-sm ${l}`} />)}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── MAIN PAGE ─────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(true);
  const [visible, setVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  const [createKey, setCreateKey] = useState(0);
  const [readAdminOnly, setReadAdminOnly] = useState(false);

  const handleNewBlog = () => {
    setEditingBlog(null);
    setActive("create");
    setCreateKey(prev => prev + 1);
  };

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/current-user");
        console.log(res.data);
        setUser(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
    }, 120);

    return () => clearTimeout(t);
  }, []);

  /* auto-expand sidebar on desktop */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setCollapsed(false);
      else setCollapsed(true);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const sideW = collapsed ? 0 : 230;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#080b14" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(34,211,238,0.3); }
        input:-webkit-autofill, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #0d1220 inset !important;
          -webkit-text-fill-color: white !important;
        }
      `}</style>

      <Background />

      <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} setEditingBlog={setEditingBlog} handleNewBlog={handleNewBlog} handleLogout={handleLogout} />
      <Topbar collapsed={collapsed} setCollapsed={setCollapsed} user={user} setActive={setActive} setEditingBlog={setEditingBlog} handleNewBlog={handleNewBlog} />

      {/* Main content */}
      <main
        className="relative z-10 min-h-screen pt-16 transition-all duration-300"
        style={{ paddingLeft: `${window.innerWidth >= 1024 ? (collapsed ? 68 : 230) : 0}px` }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Conditional Rendering of Views */}
          {active === "dashboard" && (
            <>
              {/* Welcome */}
              <WelcomeSection 
                visible={visible}
                user={user}
                setActive={setActive}
                setEditingBlog={setEditingBlog}
                handleNewBlog={handleNewBlog}
              />

              {/* Stats */}
              <StatCards visible={visible} />

              {/* Main two-col grid */}
              <div className="grid xl:grid-cols-[1fr_320px] gap-6">
                {/* Left column */}
                <div className="space-y-6 min-w-0">
                  <RecentBlogs visible={visible} setActive={setActive} setEditingBlog={setEditingBlog} currentUser={user} />
                  <WritingStreak visible={visible} />
                </div>

                {/* Right column */}
                <div className="space-y-5">
                  <QuickActions visible={visible} setActive={setActive} setEditingBlog={setEditingBlog} handleNewBlog={handleNewBlog} setReadAdminOnly={setReadAdminOnly} />
                  <ActivityFeed visible={visible} />
                </div>
              </div>
            </>
          )}

          {/* Create Blog Page */}
          <div style={{ display: active === "create" ? "block" : "none" }}>
            <CreateBlogPage key={editingBlog ? `edit-${editingBlog._id}` : `new-${createKey}`} editingBlog={editingBlog} setEditingBlog={setEditingBlog} />
          </div>

          {/* My Blogs Page */}
          <div style={{ display: active === "blogs" ? "block" : "none" }}>
            <MyBlogsPage setActive={setActive} setEditingBlog={setEditingBlog} currentUser={user} />
          </div>

          {/* Read Blogs Page */}
          <div style={{ display: active === "read" ? "block" : "none" }}>
            <ReadBlogsPage adminOnly={readAdminOnly} />
          </div>

          {/* Placeholder/Alternative Pages */}
          {active !== "dashboard" && active !== "create" && active !== "blogs" && active !== "read" && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-violet-500/15 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                {active === "analytics" ? <BarChart3 size={24} /> : <Users size={24} />}
              </div>
              <h2 className="text-2xl font-black text-white mb-2" style={{ fontFamily: ACCENT.ox }}>
                {active.charAt(0).toUpperCase() + active.slice(1)}
                <span className="text-cyan-400">.</span>
              </h2>
              <p className="text-white/25 text-sm max-w-xs" style={{ fontFamily: ACCENT.mono }}>
                {active === "analytics" ? "Detailed performance analytics coming soon." : "Connect with the community here."}
              </p>
            </div>
          )}

        </div>
      </main>

      {/* Mobile FAB */}
      <button
        onClick={handleNewBlog}
        className="fixed bottom-6 right-6 lg:hidden flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all duration-300 z-30"
        style={{ background: "linear-gradient(135deg,#22d3ee 0%,#7c3aed 100%)", fontFamily: ACCENT.ox }}>
        <Plus size={16} /> New Blog
      </button>
    </div>
  );
}
