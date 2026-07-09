import { useState, useEffect, useRef } from "react";
import {
  Feather, LayoutDashboard, BookOpen, PenLine, BarChart3,
  Users, Settings, LogOut, Bell, Search, Plus, Eye, Heart,
  MessageSquare, TrendingUp, TrendingDown, ArrowRight, Menu, X,
  MoreHorizontal, Edit3, Trash2, ExternalLink, Star, Zap,
  Calendar, Clock, Tag, ChevronRight, ChevronUp, Sparkles,
  Globe, Lock, FileText, Activity, BookMarked, Save
} from "lucide-react";

import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import CreateBlogPage from "./CreateBlogPage";
import MyBlogsPage from "./UserOwnBlogs";
import ReadBlogsPage from "./ReadBlogsFeed";
import AIAssistantPage from "./AIAssistantPage";



/* ─────────────────── CONSTANTS ─────────────────── */
const ACCENT = { ox: "'VT323', monospace", mono: "'Space Mono', monospace", pixel: "'Silkscreen', monospace" };

const BLOGS = [
  { id: 1, title: "Building Scalable APIs with Node.js and Express", category: "Technology", status: "published", views: 8241, likes: 432, comments: 38, date: "Jun 1, 2025", readTime: "8 min", emoji: "⚡" },
  { id: 2, title: "The Art of Minimalist UI Design Systems", category: "Design", status: "published", views: 5712, likes: 289, comments: 24, date: "May 24, 2025", readTime: "6 min", emoji: "🎨" },
  { id: 3, title: "Mastering TypeScript Generics — A Deep Dive", category: "Dev", status: "published", views: 10183, likes: 567, comments: 61, date: "May 18, 2025", readTime: "12 min", emoji: "🔷" },
  { id: 4, title: "My Productivity Stack as a Solo Developer", category: "Lifestyle", status: "draft", views: 0, likes: 0, comments: 0, date: "Jun 3, 2025", readTime: "5 min", emoji: "🛠️" },
  { id: 5, title: "Why I Left React for Solo (And Came Back)", category: "Technology", status: "published", views: 14500, likes: 921, comments: 95, date: "Apr 30, 2025", readTime: "10 min", emoji: "🔄" }
];

/* ─────────────────── BACKGROUND ─────────────────── */
function Background() {
  return null; // The background grid is now handled globally in index.css body style
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
function Sparkline({ data, color = "#8F72FF", height = 40 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 120, h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h * 0.85 - h * 0.075;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────────────── SIDEBAR ─────────────────── */
function Sidebar({ active, setActive, collapsed, setCollapsed, setEditingBlog, handleNewBlog, handleLogout }) {
  const nav = [
    { id: "dashboard", icon: <LayoutDashboard size={16}/>, label: "Dashboard" },
    { id: "create",    icon: <PenLine size={16}/>,         label: "Create Blog" },
    { id: "ai-assistant", icon: <Sparkles size={16} className="text-[#FF728F] animate-pulse" />, label: "AI Assistant", isAi: true },
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setCollapsed(true)} />
      )}

      <aside className={`
        fixed top-4 left-4 h-[calc(100vh-32px)] z-40 flex flex-col
        border-2 border-retro-border bg-retro-surface rounded-2xl
        transition-all duration-300 ease-in-out shadow-[4px_4px_0px_0px_#1C1D2E]
        ${collapsed ? "-translate-x-full lg:translate-x-0 lg:w-[68px]" : "translate-x-0 w-[230px]"}
      `}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-retro-border/40 flex-shrink-0 ${collapsed ? "lg:justify-center" : ""}`}>
          <div className="w-8 h-8 bg-[#13141f] border border-retro-border flex items-center justify-center flex-shrink-0 rounded-lg shadow-[2px_2px_0px_0px_#1C1D2E]">
            <Feather size={14} className="text-retro-accent" />
          </div>
          {!collapsed && (
            <span className="text-retro-accent font-black text-lg tracking-widest uppercase whitespace-nowrap">
              QuillForge
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-grow p-3 space-y-1.5 overflow-hidden">
          {nav.map(item => {
            const isActive = active === item.id;

            return (
              <button key={item.id} onClick={() => { if (item.id === "create") { handleNewBlog(); } else { setActive(item.id); } setCollapsed(window.innerWidth < 1024 ? true : collapsed); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 group relative ${
                  item.isAi
                    ? isActive
                      ? "bg-[#FF728F] text-[#1C1D2E] border border-[#FF728F] rounded-xl shadow-[2px_2px_0px_0px_#1C1D2E]"
                      : "text-[#FF728F]/90 border border-dashed border-[#FF728F]/40 hover:bg-[#FF728F]/10 rounded-xl"
                    : isActive
                      ? "bg-retro-accent text-[#1C1D2E] border border-retro-accent rounded-xl shadow-[2px_2px_0px_0px_#1c1d2e]"
                      : "text-retro-text/60 hover:text-retro-accent hover:bg-[#13141f] rounded-xl border border-transparent"
                } ${collapsed ? "lg:justify-center lg:px-2" : ""}`}
              >
                <span className="flex-shrink-0">
                  {item.icon}
                </span>
                {!collapsed && (
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-xs font-pixel tracking-wider uppercase whitespace-nowrap">
                      {item.label}
                    </span>
                    {item.isAi && (
                      <span className="text-[7px] text-[#FF728F] font-pixel tracking-widest uppercase mt-0.5 block opacity-85">
                        ★ NEW FEATURE ★
                      </span>
                    )}
                  </div>
                )}
                {/* Tooltip for collapsed */}
                {collapsed && (
                  <div className={`absolute left-full ml-2 px-2.5 py-1.5 bg-retro-surface border text-[10px] rounded-lg uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 hidden lg:block shadow-[2px_2px_0px_0px_#1C1D2E] ${
                    item.isAi ? "border-[#FF728F] text-[#FF728F]" : "border-retro-border text-retro-accent"
                  }`}>
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-retro-border/40 space-y-1">
          {bottom.map(item => (
            <button key={item.id}
              onClick={() => {
                if (item.id === "logout") {
                  handleLogout();
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 text-retro-text/40 hover:text-retro-accent hover:bg-[#13141f] rounded-xl border border-transparent group relative ${collapsed ? "lg:justify-center lg:px-2" : ""}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="text-xs font-pixel tracking-wider uppercase whitespace-nowrap">{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-retro-surface border border-retro-border text-retro-accent text-[10px] rounded-lg uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 hidden lg:block shadow-[2px_2px_0px_0px_#1C1D2E]">
                  {item.label}
                </div>
              )}
            </button>
          ))}

          {/* Collapse toggle — desktop only */}
          <button onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 text-retro-text/30 hover:text-retro-accent hover:bg-[#13141f] rounded-xl border border-transparent justify-center mt-1 cursor-pointer">
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
    <header className="fixed top-4 right-4 h-16 z-20 border-2 border-retro-border bg-retro-surface rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E] flex items-center px-4 gap-4 transition-all duration-300"
      style={{ left: collapsed ? "calc(68px + 32px)" : "calc(230px + 32px)" }}>

      {/* Mobile hamburger */}
      <button className="lg:hidden text-retro-text/60 hover:text-retro-accent p-1.5 border-2 border-retro-border bg-[#13141f] rounded-xl transition-all"
        onClick={() => setCollapsed(!collapsed)}>
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-retro-text/30" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search blogs, drafts..."
          className="w-full bg-[#13141f] border-2 border-retro-border rounded-xl pl-9 pr-4 py-2 text-sm text-retro-text placeholder-retro-text/30 focus:outline-none focus:border-retro-accent transition-all font-terminal"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* New blog shortcut */}
        <button onClick={handleNewBlog} className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-retro-border bg-retro-accent text-[#1C1D2E] rounded-xl text-sm font-pixel hover:bg-retro-accent/80 transition-all duration-200 active:translate-y-[1px] shadow-[2px_2px_0px_#1C1D2E] cursor-pointer select-none">
          <Plus size={13} /> New Blog
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 border-2 border-retro-border bg-[#13141f] rounded-xl hover:bg-retro-surface/30 flex items-center justify-center text-retro-text/40 hover:text-retro-accent transition-all cursor-pointer shadow-[2px_2px_0px_#1C1D2E] active:translate-y-[1px]">
          <Bell size={15} />
          {notifs > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-1 bg-retro-accent border border-retro-border text-[9px] font-pixel text-[#1C1D2E] rounded-full flex items-center justify-center">
              {notifs}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 border-2 border-retro-border bg-retro-accent rounded-xl flex items-center justify-center text-sm font-pixel text-[#1C1D2E] cursor-pointer shadow-[2px_2px_0px_#1C1D2E] hover:bg-retro-accent/80 select-none">
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
      <div className="relative border-2 border-retro-border bg-retro-surface p-6 sm:p-8 rounded-2xl shadow-[6px_6px_0px_0px_#1C1D2E] overflow-hidden">
        
        {/* Title bar decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-retro-accent" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-retro-border bg-retro-accent text-[#1C1D2E] text-xs font-pixel rounded-lg">
              <Sparkles size={11} className="animate-spin" /> {greeting.toUpperCase()}
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-retro-accent tracking-widest uppercase font-heading">
              {user?.username || "Loading..."}<span className="text-retro-accent">.</span>
            </h1>
            <p className="text-retro-text/60 text-xs font-terminal">
              @{user?.username || "loading"} · forced to lock in, born to write
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3">
            <button onClick={handleNewBlog} className="flex items-center gap-2 px-5 py-2.5 border-2 border-retro-border bg-retro-accent text-[#1C1D2E] rounded-xl text-sm font-pixel hover:bg-retro-accent/80 transition-all duration-200 active:translate-y-[1px] shadow-[4px_4px_0px_#1C1D2E] cursor-pointer select-none">
              <Plus size={14} /> CREATE NEW BLOG
            </button>
            <div className="flex items-center gap-2 text-xs text-retro-accent max-w-[240px] font-terminal">
              <Zap size={12} className="text-retro-accent flex-shrink-0 animate-bounce" />
              <span>{tip}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── STAT CARDS ─────────────────── */
function StatCards({ visible, userBlogs }) {
  const totalBlogs = userBlogs ? userBlogs.length : 0;
  const totalViews = userBlogs ? userBlogs.reduce((sum, b) => sum + (b.views || 0), 0) : 0;
  const totalLikes = userBlogs ? userBlogs.reduce((sum, b) => sum + (Array.isArray(b.likes) ? b.likes.length : (b.likes || 0)), 0) : 0;

  const getNewBlogsThisMonth = () => {
    if (!userBlogs) return 0;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return userBlogs.filter((b) => new Date(b.createdAt) > oneMonthAgo).length;
  };

  const cards = [
    {
      label: "Total Blogs",
      value: totalBlogs,
      icon: <FileText size={18}/>,
      iconBg: "bg-[#13141f] border-retro-border text-retro-accent rounded-xl shadow-[2px_2px_0px_0px_#1C1D2E]",
      cardBorder: "border-retro-border",
      valueColor: "text-retro-accent",
      trend: `+${getNewBlogsThisMonth()} this month`,
      up: true,
      sparkColor: "#8F72FF",
      data: [1,2,2,3,3,4,4,4,5,5,5,5],
      suffix: "",
    },
    {
      label: "Total Views",
      value: totalViews,
      icon: <Eye size={18}/>,
      iconBg: "bg-[#13141f] border-retro-border text-cyan-400 rounded-xl shadow-[2px_2px_0px_0px_#1C1D2E]",
      cardBorder: "border-retro-border",
      valueColor: "text-cyan-400",
      trend: "+14.2% vs last month",
      up: true,
      sparkColor: "#2ac3de",
      data: [1200, 2800, 1900, 4200, 3100, 5800, 4600],
      suffix: "",
    },
    {
      label: "Total Likes",
      value: totalLikes,
      icon: <Heart size={18}/>,
      iconBg: "bg-[#13141f] border-retro-border text-orange-400 rounded-xl shadow-[2px_2px_0px_0px_#1C1D2E]",
      cardBorder: "border-retro-border",
      valueColor: "text-orange-400",
      trend: "+8.7% vs last month",
      up: true,
      sparkColor: "#ff9e64",
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
          <div className="relative border-2 border-retro-border bg-retro-surface transition-all duration-300 p-5 rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E] group hover:-translate-y-1">

            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 border flex items-center justify-center ${c.iconBg}`}>
                {c.icon}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-pixel px-2 py-0.5 border border-retro-border bg-[#13141f] text-retro-accent uppercase tracking-wider rounded-lg">
                {c.up ? "+" : "-"}{c.trend.split(" ")[0].replace("+","").replace("-","")}
              </div>
            </div>

            <div className={`text-5xl font-black ${c.valueColor} mb-1 font-heading`}>
              <AnimatedNumber target={c.value} />
            </div>
            <p className="text-retro-text/60 text-xs mb-4 uppercase tracking-wider font-terminal">{c.label}</p>

            <Sparkline data={c.data} color={c.sparkColor} />

            <p className="text-retro-text/30 text-xs mt-2 font-terminal uppercase">{c.trend}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────── STATUS BADGE ─────────────────── */
function StatusBadge({ status }) {
  const map = {
    published: "text-emerald-400 bg-[#13141f] border-emerald-400/30",
    draft:     "text-retro-accent bg-[#13141f] border-retro-accent/30",
    flagged:   "text-red-400    bg-[#13141f]    border-red-400/30",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-pixel border rounded-lg ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "published" ? "bg-emerald-400" : status === "draft" ? "bg-retro-accent" : "bg-red-400"}`} />
      {status.toUpperCase()}
    </span>
  );
}

/* ─────────────────── BLOG ROW ─────────────────── */
/* ─────────────────── BLOG ROW ─────────────────── */
function BlogRow({ blog, index, visible, setActive }) {
  const navigate = useNavigate();

  // Support both mock and real database formats
  const displayTitle = blog.title;
  const displayCategory = blog.category || "General";
  const displayStatus = blog.status || (blog.isPublished ? "published" : "draft");
  const displayViews = blog.views || 0;
  const displayLikes = Array.isArray(blog.likes) ? blog.likes.length : (typeof blog.likes === "number" ? blog.likes : 0);
  const displayComments = blog.comments || 0;
  const displayDate = blog.date || (blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "Jun 1, 2025");
  const displayReadTime = blog.readTime || "5 min";
  const displayEmoji = blog.emoji || (blog.isPublished ? "⚡" : "📝");

  const handleView = () => {
    if (blog._id) {
      navigate(`/blog/${blog._id}`);
    } else {
      alert("Mock posts cannot be viewed.");
    }
  };

  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-2 border-retro-border bg-[#13141f] hover:border-retro-accent transition-all duration-200 rounded-2xl shadow-[2px_2px_0px_0px_#1C1D2E] ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}`}
      style={{ transitionDelay: `${index * 80}ms`, transitionDuration: "600ms" }}>

      {/* Emoji thumb */}
      <div className="w-10 h-10 border border-retro-border bg-retro-surface flex items-center justify-center text-xl flex-shrink-0 rounded-xl">
        {displayEmoji}
      </div>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <p className="text-retro-accent text-base font-bold truncate group-hover:text-retro-accent/80 transition-colors">
            {displayTitle}
          </p>
          <StatusBadge status={displayStatus} />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-retro-text/40 font-terminal">
          <span className="flex items-center gap-1"><Tag size={11}/>{displayCategory.toUpperCase()}</span>
          <span className="flex items-center gap-1"><Clock size={11}/>{displayReadTime.toUpperCase()}</span>
          <span className="flex items-center gap-1"><Calendar size={11}/>{displayDate.toUpperCase()}</span>
        </div>
      </div>

      {/* Stats */}
      {displayStatus === "published" && (
        <div className="flex items-center gap-4 text-xs flex-shrink-0 font-terminal">
          <div className="text-center">
            <p className="text-retro-text/60 font-semibold">
              {displayViews >= 1000 ? `${(displayViews / 1000).toFixed(1)}K` : displayViews}
            </p>
            <p className="text-retro-text/30 text-[9px] flex items-center gap-1 justify-center"><Eye size={10}/>VIEWS</p>
          </div>
          <div className="text-center">
            <p className="text-orange-400 font-semibold">{displayLikes}</p>
            <p className="text-retro-text/30 text-[9px] flex items-center gap-1 justify-center"><Heart size={10}/>LIKES</p>
          </div>
          <div className="text-center">
            <p className="text-retro-accent font-semibold">{displayComments}</p>
            <p className="text-retro-text/30 text-[9px] flex items-center gap-1 justify-center"><MessageSquare size={10}/>COMMENTS</p>
          </div>
        </div>
      )}

      {/* Direct View Action */}
      <button 
        onClick={handleView}
        title="View Post"
        className="w-8 h-8 border border-retro-border hover:border-retro-accent bg-retro-surface flex items-center justify-center text-retro-text/40 hover:text-retro-accent transition-all flex-shrink-0 cursor-pointer rounded-xl shadow-[2px_2px_0px_#1C1D2E] active:translate-y-[1px]"
      >
        <ExternalLink size={14}/>
      </button>
    </div>
  );
}

/* ─────────────────── RECENT BLOGS ─────────────────── */
function RecentBlogs({ visible, setActive, userBlogs }) {
  const [filter, setFilter] = useState("all");
  const filters = ["all", "published", "draft"];

  const filtered = filter === "all"
    ? userBlogs
    : userBlogs.filter(b => {
        const status = b.status || (b.isPublished ? "published" : "draft");
        return status === filter;
      });

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: "300ms" }}>
      <div className="border-2 border-retro-border bg-retro-surface rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E] overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b border-retro-border/40">
          <div>
            <h2 className="text-xl font-bold text-retro-accent uppercase tracking-wider font-heading">Recent Blogs</h2>
            <p className="text-retro-text/30 text-xs font-terminal uppercase mt-0.5">{userBlogs.length} total posts</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter tabs */}
            <div className="flex items-center gap-1 bg-[#13141f] border border-retro-border p-1 rounded-xl">
              {filters.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-pixel uppercase tracking-wide transition-all duration-200 rounded-lg ${
                    filter === f
                      ? "bg-retro-accent text-[#1C1D2E]"
                      : "text-retro-text/40 hover:text-retro-accent"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
            <button onClick={() => setActive("read")} className="hidden sm:flex items-center gap-1.5 px-3 py-2 border border-retro-border hover:border-retro-accent text-retro-text/40 hover:text-retro-accent text-xs font-pixel uppercase tracking-wide cursor-pointer select-none rounded-xl shadow-[2px_2px_0px_#1C1D2E] active:translate-y-[1px]">
              View all <ChevronRight size={12}/>
            </button>
          </div>
        </div>

        {/* Blog list */}
        <div className="p-4 space-y-3">
          {filtered.map((blog, i) => (
            <BlogRow key={blog._id || blog.id} blog={blog} index={i} visible={visible} setActive={setActive} />
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <FileText size={28} className="text-retro-text/10 mx-auto mb-3" />
              <p className="text-retro-text/30 text-sm font-terminal uppercase">No {filter} blogs yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── ACTIVITY FEED ─────────────────── */
function ActivityFeed({ visible, userBlogs }) {
  const getDynamicActivities = () => {
    if (!userBlogs) return [];
    const acts = [];
    userBlogs.forEach(b => {
      const timeDiff = Date.now() - new Date(b.updatedAt || b.createdAt).getTime();
      let timeStr = "Just now";
      const minutes = Math.floor(timeDiff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      if (days > 0) timeStr = `${days}d ago`;
      else if (hours > 0) timeStr = `${hours}h ago`;
      else if (minutes > 0) timeStr = `${minutes}m ago`;

      if (b.isPublished) {
        acts.push({
          icon: <Globe size={12}/>,
          color: "text-emerald-400 border-emerald-500/20 bg-emerald-950/20",
          text: `You published '${b.title}'`,
          time: timeStr,
          timestamp: new Date(b.updatedAt || b.createdAt).getTime()
        });
      } else {
        acts.push({
          icon: <Save size={12}/>,
          color: "text-retro-accent border-retro-accent/20 bg-retro-accent/5",
          text: `You saved draft '${b.title}'`,
          time: timeStr,
          timestamp: new Date(b.updatedAt || b.createdAt).getTime()
        });
      }

      if (b.views >= 50) {
        acts.push({
          icon: <TrendingUp size={12}/>,
          color: "text-cyan-400 border-cyan-500/20 bg-cyan-950/20",
          text: `'${b.title}' crossed ${b.views} views`,
          time: "Milestone",
          timestamp: new Date(b.updatedAt || b.createdAt).getTime() - 500
        });
      }
    });

    return acts.sort((a,b) => b.timestamp - a.timestamp).slice(0, 5);
  };

  const activitiesList = getDynamicActivities();

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: "400ms" }}>
      <div className="border-2 border-retro-border bg-retro-surface rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-retro-border/40">
          <div>
            <h2 className="text-xl font-bold text-retro-accent uppercase tracking-wider font-heading">Activity</h2>
            <p className="text-retro-text/30 text-xs font-terminal uppercase mt-0.5">Recent notifications</p>
          </div>
          <div className="w-2.5 h-2.5 bg-retro-accent rounded-full animate-pulse" />
        </div>
        <div className="p-4 space-y-2.5">
          {activitiesList.map((item, i) => (
            <div key={i}
              className="flex items-start gap-3 p-3 border border-retro-border/40 hover:border-retro-accent transition-all duration-200 cursor-pointer group rounded-xl bg-[#13141f]"
              style={{ transitionDelay: `${400 + i * 60}ms`, transitionDuration: "500ms" }}>
              <div className={`w-7 h-7 border flex items-center justify-center flex-shrink-0 rounded-lg ${item.color}`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-retro-text/75 text-xs group-hover:text-retro-accent transition-colors font-terminal">
                  {item.text.toUpperCase()}
                </p>
              </div>
              <span className="text-retro-text/40 text-[10px] flex-shrink-0 mt-0.5 font-terminal">
                {item.time.toUpperCase()}
              </span>
            </div>
          ))}
          {activitiesList.length === 0 && (
            <div className="py-8 text-center text-retro-text/30 text-xs font-terminal uppercase">
              No recent activities
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── QUICK ACTIONS ─────────────────── */
function QuickActions({ visible, setActive, setEditingBlog, handleNewBlog, setReadAdminOnly, userBlogs }) {
  const draftCount = userBlogs ? userBlogs.filter(b => !b.isPublished).length : 0;

  const actions = [
    { icon: <PenLine size={16}/>, label: "New Blog", desc: "Start writing", border: "border-retro-border", bg: "bg-[#13141f] hover:bg-[#1C1D2E]", iconColor: "text-emerald-400", onClick: handleNewBlog },
    {
      icon: <Star size={16}/>,
      label: "Featured",
      desc: "Admin picks",
      border: "border-retro-border",
      bg: "bg-[#13141f] hover:bg-[#1C1D2E]",
      iconColor: "text-orange-400",
      onClick: () => { setReadAdminOnly(true); setActive("read"); }
    },
    { icon: <Globe size={16}/>, label: "Go Live", desc: `${draftCount} drafts`, border: "border-retro-border", bg: "bg-[#13141f] hover:bg-[#1C1D2E]", iconColor: "text-retro-accent", onClick: () => setActive("blogs") },
  ];

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: "500ms" }}>
      <div className="border-2 border-retro-border bg-retro-surface rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E] overflow-hidden">
        <div className="px-5 py-4 border-b border-retro-border/40">
          <h2 className="text-xl font-bold text-retro-accent uppercase tracking-wider font-heading">Quick Actions</h2>
        </div>
        <div className="p-4 grid grid-cols-3 gap-3">
          {actions.map((a, i) => (
            <button key={i} onClick={a.onClick}
              className={`flex flex-col items-center gap-2 p-4 border-2 ${a.border} ${a.bg} hover:border-retro-accent text-retro-text transition-all duration-200 group active:translate-y-[1px] shadow-[2px_2px_0px_0px_#1C1D2E] cursor-pointer select-none rounded-2xl`}>
              <div className={`w-10 h-10 border border-retro-border bg-retro-surface flex items-center justify-center ${a.iconColor} shadow-[2px_2px_0px_0px_#1C1D2E] rounded-xl transition-all`}>
                {a.icon}
              </div>
              <div className="text-center">
                <p className="text-retro-text/75 text-xs font-semibold group-hover:text-retro-accent transition-colors font-pixel uppercase tracking-wide">{a.label}</p>
                <p className="text-retro-text/40 text-[9px] font-terminal uppercase mt-0.5">{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── WRITING STREAK ─────────────────── */
function WritingStreak({ visible, userBlogs }) {
  const weeks = 12;
  const levels = ["bg-[#13141f] border border-retro-border/20 rounded", "bg-emerald-800 rounded", "bg-emerald-600 rounded", "bg-emerald-400 rounded", "bg-retro-accent rounded"];

  const calculateStreak = () => {
    if (!userBlogs || userBlogs.length === 0) return 0;
    
    // Get unique creation dates
    const dates = new Set(userBlogs.map(b => new Date(b.createdAt).toDateString()));
    let streak = 0;
    let checkDate = new Date();
    
    if (!dates.has(checkDate.toDateString())) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    while (dates.has(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  };

  const getHeatmapData = () => {
    const daysData = [];
    const datesMap = {};
    
    if (userBlogs) {
      userBlogs.forEach(b => {
        const dStr = new Date(b.createdAt).toDateString();
        datesMap[dStr] = (datesMap[dStr] || 0) + 1;
      });
    }
    
    for (let i = 83; i >= 0; i--) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const count = datesMap[checkDate.toDateString()] || 0;
      daysData.push({ val: count });
    }
    return daysData;
  };

  const streak = calculateStreak();
  const heatmapData = getHeatmapData();

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: "600ms" }}>
      <div className="border-2 border-retro-border bg-retro-surface rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-retro-border/40">
          <div>
            <h2 className="text-xl font-bold text-retro-accent uppercase tracking-wider font-heading">Writing Streak</h2>
            <p className="text-retro-text/30 text-xs font-terminal uppercase mt-0.5">12-week activity heatmap</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-pixel tracking-wider border border-retro-border bg-[#13141f] px-2.5 py-1 text-retro-accent rounded-lg">
            <Activity size={12} className="text-retro-accent" />
            <span>{streak} DAY STREAK</span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex gap-1.5 overflow-x-auto pb-1.5">
            {Array.from({ length: weeks }, (_, w) => (
              <div key={w} className="flex flex-col gap-1.5 flex-shrink-0">
                {Array.from({ length: 7 }, (_, d) => {
                  const cell = heatmapData[w * 7 + d] || { val: 0 };
                  const clampedVal = Math.min(cell.val, levels.length - 1);
                  return (
                    <div key={d} title={`${cell.val} post${cell.val !== 1 ? "s" : ""}`}
                      className={`w-3.5 h-3.5 transition-all hover:scale-110 cursor-pointer ${levels[clampedVal]}`} />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2.5 mt-4 text-xs font-terminal uppercase text-retro-text/30">
            <span>Less</span>
            {levels.map((l, i) => <div key={i} className={`w-3.5 h-3.5 ${l}`} />)}
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
  const [aiDraft, setAiDraft] = useState(null); // AI-generated draft passed directly to editor

  // New state for user's blogs
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);

  /**
   * Resets editing state and redirects active viewport focus to the blog editor screen.
   * Why: Ensures the editor launches with blank inputs instead of lingering edit session data.
   */
  const handleNewBlog = () => {
    setEditingBlog(null);
    setActive("create");
    setCreateKey(prev => prev + 1);
  };

  /**
   * Receives generated content from AI assistant and passes it directly to the editor.
   * Uses aiDraft state prop instead of localStorage to avoid race conditions on remount.
   */
  const handleAILoad = (draft) => {
    setEditingBlog(null);
    setAiDraft(draft);
    setActive("create");
  };

  /**
   * Performs an asynchronous user logout request and wipes authorization tokens.
   * API CALL: POST `/users/logout` (in backend start/routes/user.routes.js)
   * Why: Destroys server-side and client-side session contexts, then redirects user to home.
   */
  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /**
   * Side effect to retrieve profile information of the currently logged-in user.
   * API CALL: GET `/users/current-user` (in backend start/routes/user.routes.js)
   * Why: Validates active session and obtains user details to customize dashboard headers.
   */
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

  /**
   * Side effect to reload all blog posts to synchronize metrics, streak, and recent lists.
   * API CALL: GET `/blogs` (in backend start/routes/blog.routes.js)
   * Why: Keeps analytics dials current, updates writing activity, and updates lists on changes.
   */
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get("/blogs");
        setBlogs(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch blogs in dashboard:", err);
      } finally {
        setBlogsLoading(false);
      }
    };
    fetchBlogs();
  }, [active]);

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

  /**
   * Destroys a user's blog post by its unique database ID.
   * API CALL: DELETE `/blogs/:id` (in backend start/routes/blog.routes.js)
   * Why: Removes the post object permanently from the server and local list state.
   */
  const handleDeleteBlog = async (id) => {
    try {
      await api.delete(`/blogs/${id}`);
      setBlogs(prev => prev.filter(b => (b._id || b.id) !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete blog");
    }
  };

  const userBlogs = blogs.filter((b) => {
    if (!user) return false;
    if (!b.author) return false;
    const authorId = typeof b.author === "object" ? b.author?._id : b.author;
    return authorId === user._id;
  });

  const availableBlogs = blogs.filter((b) => {
    const isPub = b.isPublished || b.status === "published";
    if (isPub) return true;
    if (!user) return false;
    const authorId = typeof b.author === "object" ? b.author?._id : b.author;
    return authorId === user._id;
  });

  const sideW = collapsed ? 0 : 230;

  return (
    <div className="min-h-screen bg-retro-bg text-retro-text relative overflow-x-hidden">
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #171825; }
        ::-webkit-scrollbar-thumb { background: #1c1d2e; border: 2px solid #171825; }
        ::-webkit-scrollbar-thumb:hover { background: #8F72FF; }
        input:-webkit-autofill, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #13141f inset !important;
          -webkit-text-fill-color: #E2E2F5 !important;
        }
      `}</style>

      <Background />

      <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} setEditingBlog={setEditingBlog} handleNewBlog={handleNewBlog} handleLogout={handleLogout} />
      <Topbar collapsed={collapsed} setCollapsed={setCollapsed} user={user} setActive={setActive} setEditingBlog={setEditingBlog} handleNewBlog={handleNewBlog} />

      {/* Main content */}
      <main
        className="relative z-10 min-h-screen pt-24 pb-8 pr-4 transition-all duration-300"
        style={{ paddingLeft: window.innerWidth >= 1024 ? (collapsed ? "100px" : "262px") : "16px" }}
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
              <StatCards visible={visible} userBlogs={userBlogs} />

              {/* Main two-col grid */}
              <div className="grid xl:grid-cols-[1fr_320px] gap-6">
                {/* Left column */}
                <div className="space-y-6 min-w-0">
                  <RecentBlogs visible={visible} setActive={setActive} userBlogs={availableBlogs} />
                  <WritingStreak visible={visible} userBlogs={userBlogs} />
                </div>

                {/* Right column */}
                <div className="space-y-5">
                  <QuickActions visible={visible} setActive={setActive} setEditingBlog={setEditingBlog} handleNewBlog={handleNewBlog} setReadAdminOnly={setReadAdminOnly} userBlogs={userBlogs} />
                  <ActivityFeed visible={visible} userBlogs={userBlogs} />
                </div>
              </div>
            </>
          )}

          {/* Create Blog Page */}
          <div style={{ display: active === "create" ? "block" : "none" }}>
            <CreateBlogPage
              key={editingBlog ? `edit-${editingBlog._id}` : `new-${createKey}`}
              editingBlog={editingBlog}
              setEditingBlog={setEditingBlog}
              aiDraft={aiDraft}
              clearAiDraft={() => setAiDraft(null)}
            />
          </div>

          {/* AI Assistant Page */}
          <div style={{ display: active === "ai-assistant" ? "block" : "none" }}>
            <AIAssistantPage onGenerateSuccess={handleAILoad} />
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
          {active !== "dashboard" && active !== "create" && active !== "ai-assistant" && active !== "blogs" && active !== "read" && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="border-2 border-retro-border bg-retro-surface p-8 shadow-[6px_6px_0px_0px_#1C1D2E] rounded-2xl text-center max-w-md mx-auto">
                <div className="w-16 h-16 border border-retro-border bg-[#13141f] rounded-xl flex items-center justify-center text-retro-accent mx-auto mb-5 shadow-[3px_3px_0px_0px_#1C1D2E]">
                  {active === "analytics" ? <BarChart3 size={24} /> : <Users size={24} />}
                </div>
                <h2 className="text-3xl font-black text-retro-accent mb-2 uppercase tracking-widest font-heading">
                  {active.toUpperCase()}
                </h2>
                <p className="text-retro-text/60 text-sm font-terminal uppercase">
                  {active === "analytics" ? "Detailed performance analytics coming soon." : "Connect with the community here."}
                </p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Mobile FAB */}
      <button
        onClick={handleNewBlog}
        className="fixed bottom-6 right-6 lg:hidden flex items-center gap-2 px-5 py-3 border-2 border-retro-border bg-retro-accent text-[#1C1D2E] text-sm font-pixel rounded-xl shadow-[4px_4px_0px_#1C1D2E] active:translate-y-[1px] active:shadow-none z-30">
        <Plus size={16} /> NEW BLOG
      </button>
    </div>
  );
}
