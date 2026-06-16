import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import {
  Feather,
  LayoutDashboard,
  BookOpen,
  PenLine,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Menu,
  X,
  MoreHorizontal,
  Edit3,
  Trash2,
  ExternalLink,
  Globe,
  FileText,
  Clock,
  Tag,
  ChevronRight,
  Sparkles,
  Save,
  Hash,
  AlignLeft,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  AlertCircle,
  Filter,
  SortAsc,
  ChevronDown,
  Copy,
  Zap,
  Star,
  Activity,
  Users,
  Send,
  RefreshCw,
  Shield,
  BookMarked,
  Layers,
} from "lucide-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import CreateBlogPage from "./CreateBlogPage";
import ReadBlogsPage from "./ReadBlogsFeed";

/* ════════════════════════════════════════════════
   DESIGN TOKENS
════════════════════════════════════════════════ */
const T = {
  ox: "'VT323', monospace",
  mono: "'Space Mono', monospace",
  pixel: "'Silkscreen', monospace",
  bg: "#252525",
};

/* ════════════════════════════════════════════════
   MOCK DATA
════════════════════════════════════════════════ */
const BLOGS = [
  {
    id: 1,
    title: "Building Scalable APIs with Node.js",
    slug: "building-scalable-apis-nodejs",
    status: "published",
    views: 8241,
    created: "Jun 1, 2025",
    updated: "Jun 3, 2025",
    category: "Technology",
    likes: 432,
    comments: 38,
  },
  {
    id: 2,
    title: "The Art of Minimalist UI Design Systems",
    slug: "art-minimalist-ui-design",
    status: "published",
    views: 5712,
    created: "May 24, 2025",
    updated: "May 26, 2025",
    category: "Design",
    likes: 289,
    comments: 24,
  },
  {
    id: 3,
    title: "Mastering TypeScript Generics — Deep Dive",
    slug: "mastering-typescript-generics",
    status: "published",
    views: 10183,
    created: "May 18, 2025",
    updated: "May 20, 2025",
    category: "Dev",
    likes: 567,
    comments: 61,
  },
  {
    id: 4,
    title: "My Productivity Stack as a Solo Developer",
    slug: "my-productivity-stack",
    status: "draft",
    views: 0,
    created: "Jun 3, 2025",
    updated: "Jun 3, 2025",
    category: "Lifestyle",
    likes: 0,
    comments: 0,
  },
  {
    id: 5,
    title: "Why I Left React for Solid.js",
    slug: "why-i-left-react-solidjs",
    status: "published",
    views: 14500,
    created: "Apr 30, 2025",
    updated: "May 1, 2025",
    category: "Technology",
    likes: 921,
    comments: 95,
  },
  {
    id: 6,
    title: "CSS Container Queries Explained",
    slug: "css-container-queries",
    status: "draft",
    views: 0,
    created: "Jun 5, 2025",
    updated: "Jun 5, 2025",
    category: "Dev",
    likes: 0,
    comments: 0,
  },
];

const CHART_DATA = [
  { day: "Mon", views: 1200 },
  { day: "Tue", views: 2800 },
  { day: "Wed", views: 1900 },
  { day: "Thu", views: 4200 },
  { day: "Fri", views: 3100 },
  { day: "Sat", views: 5800 },
  { day: "Sun", views: 4600 },
];

const ACTIVITY = [
  {
    type: "publish",
    icon: <Globe size={12} />,
    color: "text-emerald-400 border-emerald-500/30 bg-[#242f27]",
    text: "Published 'Building Scalable APIs'",
    time: "2h ago",
  },
  {
    type: "edit",
    icon: <Edit3 size={12} />,
    color: "text-retro-accent border-retro-accent/30 bg-[#2b3a32]",
    text: "Edited 'Mastering TypeScript Generics'",
    time: "5h ago",
  },
  {
    type: "draft",
    icon: <Save size={12} />,
    color: "text-retro-amber border-retro-amber/30 bg-[#352c20]",
    text: "Saved draft 'Productivity Stack'",
    time: "1d ago",
  },
];

/* ════════════════════════════════════════════════
   ANIMATION VARIANTS (kept minimal / flat)
════════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};
const fadeLeft = {
  hidden: { opacity: 1, x: 0 },
  show: { opacity: 1, x: 0 },
};
const stagger = { show: { transition: { staggerChildren: 0.02 } } };
const pageVariants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 1, y: 0 },
};

/* ════════════════════════════════════════════════
   BACKGROUND
════════════════════════════════════════════════ */
function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0 bg-[#252525]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(#E8E8C6 1px, transparent 1px), linear-gradient(90deg, #E8E8C6 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />
      <div className="crt-overlay" />
      <div className="noise-overlay" />
    </div>
  );
}

/* ════════════════════════════════════════════════
   SPARKLINE
════════════════════════════════════════════════ */
function Sparkline({ data, color = "#E8E8C6", height = 40 }) {
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

/* ════════════════════════════════════════════════
   GLASS CARD -> RETRO PANEL CARD
════════════════════════════════════════════════ */
function GlassCard({ children, className = "", borderClass = "border-retro-border" }) {
  return (
    <div
      className={`border-2 ${borderClass} bg-retro-surface shadow-[4px_4px_0px_rgba(0,0,0,1)] overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════
   BADGE
════════════════════════════════════════════════ */
function Badge({ status }) {
  const map = {
    published: {
      cls: "border-emerald-400/30 text-emerald-400 bg-retro-bg",
      dot: "bg-emerald-400",
      label: "Published",
    },
    draft: {
      cls: "border-retro-amber/30  text-retro-amber  bg-retro-bg",
      dot: "bg-retro-amber",
      label: "Draft",
    },
    flagged: {
      cls: "border-red-400/30    text-red-400    bg-retro-bg",
      dot: "bg-red-400",
      label: "Flagged",
    },
  };
  const s = map[status] || map.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-pixel border ${s.cls}`}
      style={{ fontFamily: T.pixel }}
    >
      <span className={`w-1.5 h-1.5 ${s.dot}`} />
      {s.label.toUpperCase()}
    </span>
  );
}

function GradientBtn({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-retro-accent bg-retro-accent text-retro-bg font-pixel hover:bg-retro-accent/80 active:translate-y-[1px] shadow-[4px_4px_0px_rgba(0,0,0,1)] cursor-pointer select-none ${className}`}
      style={{
        fontFamily: T.pixel,
      }}
    >
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id: "dashboard", icon: <LayoutDashboard size={15} />, label: "Dashboard" },
  { id: "create", icon: <PenLine size={15} />, label: "Create Blog" },
  { id: "manage", icon: <BookMarked size={15} />, label: "Manage Blogs" },
  { id: "read", icon: <BookOpen size={15} />, label: "Read Blogs" },
];

function Sidebar({ page, setPage, open, setOpen, handleLogout }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-[#252525]/85 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-[220px] z-40 flex flex-col border-r-4 border-retro-accent bg-retro-bg transition-all duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 px-5 h-16 border-b-2 border-retro-border flex-shrink-0">
          <div className="w-8 h-8 bg-retro-accent border-2 border-retro-accent flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <Feather size={14} className="text-retro-bg" />
          </div>
          <span
            className="text-retro-accent font-black text-2xl tracking-widest uppercase"
            style={{ fontFamily: T.ox }}
          >
            Quill<span className="text-retro-accent">.</span>
          </span>
          <button
            className="ml-auto lg:hidden text-retro-text/60 hover:text-retro-accent border-2 border-retro-border p-1 bg-retro-surface"
            onClick={() => setOpen(false)}
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-5 pt-5 pb-2">
          <p
            className="text-retro-text/45 text-[10px] tracking-[0.2em] uppercase font-bold"
            style={{ fontFamily: T.pixel }}
          >
            Navigation
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setPage(item.id);
                  if (window.innerWidth < 1024) setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 group relative text-left ${
                  active
                    ? "bg-retro-surface border-2 border-retro-accent text-retro-accent"
                    : "text-retro-text/60 hover:text-retro-accent hover:bg-retro-surface/20 border border-transparent"
                }`}
              >
                <span
                  className={
                    active
                      ? "text-retro-accent"
                      : "group-hover:text-retro-accent/70 transition-colors"
                  }
                >
                  {item.icon}
                </span>
                <span
                  className="text-sm font-medium uppercase tracking-wider"
                  style={{ fontFamily: T.ox }}
                >
                  {item.label}
                </span>
                {active && (
                  <div className="ml-auto w-2 h-2 bg-retro-accent" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t-2 border-retro-border space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-retro-text/40 hover:text-retro-accent hover:bg-retro-surface/20 border border-transparent group relative text-left"
          >
            <LogOut size={15} />
            <span
              className="text-sm font-medium uppercase tracking-wider"
              style={{ fontFamily: T.ox }}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

/* ════════════════════════════════════════════════
   TOPBAR
════════════════════════════════════════════════ */
function Topbar({ setOpen, setPage, setEditingBlog }) {
  const [search, setSearch] = useState("");
  return (
    <div
      className="fixed top-0 right-0 left-[220px] max-lg:left-0 h-16 z-20 flex items-center px-5 gap-4 border-b-2 border-retro-border bg-retro-surface"
    >
      <button
        className="lg:hidden text-retro-text/60 hover:text-retro-accent p-1.5 border-2 border-retro-border bg-retro-bg transition-all"
        onClick={() => setOpen(true)}
      >
        <Menu size={17} />
      </button>

      <div className="relative flex-1 max-w-sm">
        <Search
          size={13}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-retro-text/30"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="how you doin'?…"
          className="w-full bg-retro-bg border-2 border-retro-border pl-9 pr-4 py-2 text-xs text-retro-text placeholder-retro-text/25 focus:outline-none focus:border-retro-accent transition-all font-terminal"
        />
      </div>

      <div className="flex items-center gap-2.5 ml-auto">
        <GradientBtn
          onClick={() => {
            if (setEditingBlog) setEditingBlog(null);
            setPage("create");
          }}
          className="hidden sm:flex text-xs px-4 py-2"
        >
          <Plus size={13} /> New Blog
        </GradientBtn>

        <button
          className="relative w-9 h-9 border-2 border-retro-border bg-retro-bg hover:bg-retro-surface/30 flex items-center justify-center text-retro-text/40 hover:text-retro-accent transition-all cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
        >
          <Bell size={15} />
          <span className="absolute -top-1.5 -right-1.5 px-1 bg-retro-accent border border-retro-bg text-[9px] font-pixel text-[#252525] flex items-center justify-center">
            3
          </span>
        </button>

        <div
          className="w-9 h-9 border-2 border-retro-accent bg-retro-accent flex items-center justify-center text-sm font-pixel text-retro-bg cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#E2E2D5] select-none"
          style={{ fontFamily: T.ox }}
        >
          KX
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   ANIMATED COUNTER
════════════════════════════════════════════════ */
function Counter({ target, duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(e * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return (
    <>{val >= 1000 ? `${(val / 1000).toFixed(val >= 10000 ? 0 : 1)}K` : val}</>
  );
}

/* ════════════════════════════════════════════════
   STAT CARD
════════════════════════════════════════════════ */
function StatCard({
  label,
  value,
  icon,
  gradFrom,
  gradTo,
  glowColor,
  trend,
  data,
  delay = 0,
}) {
  let borderClass = "border-retro-border";
  let textClass = "text-retro-accent";
  let sparkColor = "#E8E8C6";
  let iconCls = "bg-retro-bg border-retro-accent text-retro-accent";

  if (label === "Total Blogs") {
    borderClass = "border-retro-accent";
    textClass = "text-retro-accent";
    sparkColor = "#E8E8C6";
    iconCls = "bg-retro-bg border-retro-accent text-retro-accent";
  } else if (label === "Published Blogs") {
    borderClass = "border-emerald-500/60 hover:border-emerald-500";
    textClass = "text-emerald-400";
    sparkColor = "#34d399";
    iconCls = "bg-retro-bg border-emerald-500 text-emerald-400";
  } else if (label === "Draft Blogs") {
    borderClass = "border-retro-amber/60 hover:border-retro-amber";
    textClass = "text-retro-amber";
    sparkColor = "#D4A373";
    iconCls = "bg-retro-bg border-retro-amber text-retro-amber";
  } else {
    borderClass = "border-retro-sepia/60 hover:border-retro-sepia";
    textClass = "text-retro-sepia";
    sparkColor = "#A68A64";
    iconCls = "bg-retro-bg border-retro-sepia text-retro-sepia";
  }

  return (
    <div className={`relative border-2 ${borderClass} bg-retro-surface p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] group`}>
      <div className="flex items-start justify-between mb-4 relative">
        <div className={`w-10 h-10 border-2 flex items-center justify-center ${iconCls}`}>
          {icon}
        </div>
        <span
          className="flex items-center gap-1 text-[10px] font-pixel px-2 py-0.5 border border-retro-border bg-retro-bg text-retro-accent uppercase tracking-wider"
          style={{ fontFamily: T.pixel }}
        >
          {trend}
        </span>
      </div>

      <div className="relative">
        <p
          className={`text-5xl font-black ${textClass} mb-1`}
          style={{
            fontFamily: T.ox,
          }}
        >
          <Counter target={value} />
        </p>
        <p className="text-retro-text/60 text-xs mb-4 uppercase tracking-wider font-terminal" style={{ fontFamily: T.mono }}>
          {label}
        </p>
      </div>

      {data && (
        <div className="mt-4 h-10">
          <Sparkline data={Array.isArray(data) && data.length ? data.map(d => typeof d === 'object' ? d.views || 0 : d) : [10, 15, 12, 22, 18, 25]} color={sparkColor} />
        </div>
      )}

      <p className="text-retro-text/30 text-xs mt-2 font-terminal uppercase" style={{ fontFamily: T.mono }}>
        {trend}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════
   DASHBOARD PAGE
════════════════════════════════════════════════ */
function DashboardPage({ setPage, setEditingBlog, setReadAdminOnly, user }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get("/blogs");
        setBlogs(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch blogs in dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const startEdit = async (id) => {
    try {
      const res = await api.get(`/blogs/${id}`);
      setEditingBlog(res.data.data);
      setPage("create");
    } catch (error) {
      console.error(error);
      alert("Failed to load blog");
    }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await api.delete(`/blogs/${id}`);
      setBlogs((prev) => prev.filter((x) => x._id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete blog");
    }
  };

  const totalBlogs = blogs.length;
  const publishedBlogsCount = blogs.filter((b) => b.isPublished).length;
  const draftBlogsCount = blogs.filter((b) => !b.isPublished).length;
  const totalViews = blogs.reduce((acc, b) => acc + (b.views || 0), 0);

  const getNewBlogsThisMonth = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return blogs.filter((b) => new Date(b.createdAt) > oneMonthAgo).length;
  };

  const getNewPublishedThisMonth = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return blogs.filter((b) => b.isPublished && new Date(b.createdAt) > oneMonthAgo).length;
  };

  const stats = [
    {
      label: "Total Blogs",
      value: totalBlogs,
      icon: <BookOpen size={16} />,
      gradFrom: "#22d3ee",
      gradTo: "#67e8f9",
      glowColor: "#22d3ee",
      trend: `+${getNewBlogsThisMonth()} this month`,
      data: null,
      delay: 0,
    },
    {
      label: "Published Blogs",
      value: publishedBlogsCount,
      icon: <Globe size={16} />,
      gradFrom: "#34d399",
      gradTo: "#6ee7b7",
      glowColor: "#34d399",
      trend: `+${getNewPublishedThisMonth()} this month`,
      data: null,
      delay: 0.06,
    },
    {
      label: "Draft Blogs",
      value: draftBlogsCount,
      icon: <FileText size={16} />,
      gradFrom: "#fbbf24",
      gradTo: "#fde68a",
      glowColor: "#fbbf24",
      trend: "In progress",
      data: null,
      delay: 0.12,
    },
    {
      label: "Total Views",
      value: totalViews,
      icon: <Eye size={16} />,
      gradFrom: "#a78bfa",
      gradTo: "#c4b5fd",
      glowColor: "#a78bfa",
      trend: "+14.2%",
      data: CHART_DATA,
      delay: 0.18,
    },
  ];

  const recentBlogs = [...blogs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const dynamicActivities = () => {
    const acts = [];
    const sortedByUpdate = [...blogs]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5);

    sortedByUpdate.forEach((b) => {
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
          icon: <Globe size={12} />,
          color: "text-emerald-400 border-emerald-500/30 bg-[#242f27]",
          text: `Published '${b.title}'`,
          time: timeStr,
          timestamp: new Date(b.updatedAt || b.createdAt).getTime()
        });
      } else {
        acts.push({
          icon: <Save size={12} />,
          color: "text-retro-amber border-retro-amber/30 bg-[#352c20]",
          text: `Saved draft '${b.title}'`,
          time: timeStr,
          timestamp: new Date(b.updatedAt || b.createdAt).getTime()
        });
      }
    });

    blogs.forEach((b) => {
      if (b.views >= 100) {
        acts.push({
          icon: <TrendingUp size={12} />,
          color: "text-retro-accent border-retro-accent/30 bg-[#2b3a32]",
          text: `'${b.title}' crossed ${b.views >= 1000 ? `${(b.views / 1000).toFixed(0)}k` : b.views} views`,
          time: "Milestone",
          timestamp: new Date(b.updatedAt || b.createdAt).getTime() - 1000
        });
      }
    });

    return acts.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  };

  const activitiesList = dynamicActivities();

  return (
    <div className="space-y-6">
      <div>
        <div className="relative border-4 border-retro-accent bg-retro-surface p-6 sm:p-8 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-retro-accent" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 border-2 border-retro-accent bg-retro-accent text-retro-bg text-xs font-pixel"
                style={{ fontFamily: T.pixel }}
              >
                <Sparkles size={10} className="animate-spin" /> Admin Dashboard
              </div>
              <h1
                className="text-4xl font-black text-retro-accent tracking-widest uppercase"
                style={{ fontFamily: T.ox }}
              >
                {greeting.toUpperCase()}, {user?.username || "Admin"}<span className="text-retro-accent">.</span>
              </h1>
              <p
                className="text-retro-text/60 text-sm font-terminal"
                style={{ fontFamily: T.mono }}
              >
                @{user?.username || "admin"} · Writer since {user?.createdAt ? new Date(user.createdAt).getFullYear() : "2026"} · Admin
              </p>
            </div>
            <div>
              <button
                onClick={() => {
                  setEditingBlog(null);
                  setPage("create");
                }}
                className="flex items-center gap-2 px-5 py-2.5 border-2 border-retro-accent bg-retro-accent text-retro-bg text-sm font-pixel hover:bg-retro-accent/80 active:translate-y-[1px] shadow-[4px_4px_0px_rgba(0,0,0,1)] cursor-pointer select-none"
                style={{ fontFamily: T.pixel }}
              >
                <Plus size={15} /> CREATE NEW BLOG
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      <div className="grid xl:grid-cols-[1fr_300px] gap-5">
        <div>
          <GlassCard>
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-retro-border">
              <div>
                <h2
                  className="text-2xl font-black text-retro-accent uppercase tracking-wider"
                  style={{ fontFamily: T.ox }}
                >
                  Recent Blogs
                </h2>
                <p
                  className="text-retro-text/30 text-xs font-terminal uppercase mt-0.5"
                  style={{ fontFamily: T.mono }}
                >
                  {totalBlogs} total posts
                </p>
              </div>
              <button
                onClick={() => setPage("manage")}
                className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-retro-border hover:border-retro-accent text-retro-text/40 hover:text-retro-accent text-xs font-pixel uppercase tracking-wide cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
                style={{ fontFamily: T.pixel }}
              >
                Manage all <ChevronRight size={11} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {recentBlogs.map((b, i) => (
                <div
                  key={b._id}
                  className="group flex items-center gap-3 p-3 border-2 border-retro-border/40 hover:border-retro-accent hover:bg-retro-surface/30 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex-1 min-w-0" onClick={() => navigate(`/blog/${b._id}`)}>
                    <p
                      className="text-retro-text/75 text-sm font-semibold group-hover:text-retro-accent transition-colors uppercase tracking-wider font-pixel"
                      style={{ fontFamily: T.pixel }}
                    >
                      {b.title}
                    </p>
                    <p
                      className="text-retro-text/40 text-[10px] font-terminal uppercase mt-0.5"
                      style={{ fontFamily: T.mono }}
                    >
                      {b.category || "General"} · {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "June 2026"}
                    </p>
                  </div>
                  <Badge status={b.isPublished ? "published" : "draft"} />
                  {b.isPublished && (
                    <span
                      className="text-retro-text/40 text-xs flex items-center gap-1 flex-shrink-0 font-terminal uppercase"
                      style={{ fontFamily: T.mono }}
                    >
                      <Eye size={10} />
                      {b.views >= 1000 ? `${(b.views / 1000).toFixed(1)}K` : b.views || 0}
                    </span>
                  )}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); startEdit(b._id); }}
                      className="w-8 h-8 border-2 border-retro-border hover:border-retro-accent bg-retro-surface flex items-center justify-center text-retro-text/40 hover:text-retro-accent cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteBlog(b._id); }}
                      className="w-8 h-8 border-2 border-retro-border hover:border-red-400 bg-retro-surface flex items-center justify-center text-retro-text/40 hover:text-red-400 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {recentBlogs.length === 0 && (
                <div className="text-center py-8 text-retro-text/30 text-xs font-terminal uppercase" style={{ fontFamily: T.mono }}>
                  No blogs found.
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard className="p-5">
            <h2
              className="text-2xl font-black text-retro-accent uppercase tracking-wider mb-4"
              style={{ fontFamily: T.ox }}
            >
              Quick Actions
            </h2>
            <div className="space-y-2.5">
              {[
                {
                  icon: <PenLine size={14} />,
                  label: "Create Blog",
                  desc: "Start writing",
                  border: "border-retro-olive",
                  bg: "bg-[#343e2f]/50 hover:bg-[#343e2f]",
                  iconColor: "text-retro-olive",
                  action: () => { setEditingBlog(null); setPage("create"); },
                },
                {
                  icon: <Star size={14} />,
                  label: "Featured by Admin",
                  desc: "Admin picks",
                  border: "border-retro-sepia",
                  bg: "bg-[#3e3428]/50 hover:bg-[#3e3428]",
                  iconColor: "text-retro-sepia",
                  action: () => { setReadAdminOnly(true); setPage("read"); },
                },
                {
                  icon: <Send size={14} />,
                  label: "Publish Drafts",
                  desc: `${draftBlogsCount} drafts pending`,
                  border: "border-retro-amber",
                  bg: "bg-[#44382c]/50 hover:bg-[#44382c]",
                  iconColor: "text-retro-amber",
                  action: () => setPage("manage"),
                },
              ].map((a, i) => (
                <button
                  key={i}
                  onClick={a.action}
                  className={`w-full flex items-center gap-3 p-3 border-2 ${a.border} ${a.bg} hover:border-retro-accent text-retro-text transition-all duration-200 group active:translate-y-[1px] shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer`}
                >
                  <div
                    className={`w-8 h-8 border-2 border-retro-border bg-retro-bg flex items-center justify-center ${a.iconColor} flex-shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]`}
                  >
                    {a.icon}
                  </div>
                  <div>
                    <p
                      className="text-retro-text/75 text-xs font-semibold group-hover:text-retro-accent transition-colors font-pixel uppercase tracking-wide"
                      style={{ fontFamily: T.pixel }}
                    >
                      {a.label}
                    </p>
                    <p
                      className="text-retro-text/40 text-[10px] font-terminal uppercase mt-0.5"
                      style={{ fontFamily: T.mono }}
                    >
                      {a.desc}
                    </p>
                  </div>
                  <ArrowRight
                    size={12}
                    className="ml-auto text-retro-text/20 group-hover:text-retro-accent transition-colors"
                  />
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-retro-border">
              <h2
                className="text-2xl font-black text-retro-accent uppercase tracking-wider"
                style={{ fontFamily: T.ox }}
              >
                Activity
              </h2>
              <div
                className="flex items-center gap-1.5 text-xs font-terminal uppercase text-emerald-400"
                style={{ fontFamily: T.mono }}
              >
                <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
                Live
              </div>
            </div>
            <div className="p-4 space-y-2.5">
              {activitiesList.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-2.5 border-2 border-retro-border/40 hover:border-retro-accent transition-all duration-200 cursor-pointer group ${a.color.split(" ").slice(-1)[0]}`}
                >
                  <div
                    className={`w-6 h-6 border flex items-center justify-center flex-shrink-0 ${a.color}`}
                  >
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-retro-text/75 text-xs group-hover:text-retro-accent transition-colors leading-snug font-terminal uppercase"
                      style={{ fontFamily: T.mono }}
                    >
                      {a.text}
                    </p>
                  </div>
                  <span
                    className="text-retro-text/40 text-[10px] flex-shrink-0 mt-0.5 font-terminal uppercase"
                    style={{ fontFamily: T.mono }}
                  >
                    {a.time}
                  </span>
                </div>
              ))}
              {activitiesList.length === 0 && (
                <div className="text-center py-8 text-retro-text/30 text-xs font-terminal uppercase" style={{ fontFamily: T.mono }}>
                  No recent activity.
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   HELPERS — outside all components
════════════════════════════════════════════════ */
const toSlug = (v) =>
  v
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label
        className="block text-[10px] font-semibold text-white/30 tracking-widest uppercase"
        style={{ fontFamily: T.ox }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════
   CREATE BLOG PAGE
   KEY FIXES:
   1. All motion.div wrappers replaced with plain div — framer
      motion entry animations were re-triggering on every parent
      re-render and blurring the focused input.
   2. GlassCard no longer inherits variants={fadeUp} so it won't
      re-animate when AdminDashboard re-renders (e.g. sideOpen change).
════════════════════════════════════════════════ */
// CreateBlogPage is now imported from "./CreateBlogPage"

/* ════════════════════════════════════════════════
   MANAGE BLOGS PAGE
════════════════════════════════════════════════ */
function ManageBlogsPage({ setPage, setEditingBlog }) {
  const [blogs, setBlogs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [selected, setSelected] = useState([]);

  const navigate = useNavigate();


  // Fetch all blogs when the component mounts
  useEffect(() => {
    fetchBlogs();
  }, []);

  /**
   * Fetches all blogs from the database.
   * 
   * API Call:
   * - Endpoint: GET /blogs (in backend start/routes/blog.routes.js)
   */
  const fetchBlogs = async () => {
    try {
      const res = await api.get("/blogs");
      setBlogs(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = blogs
    .filter(
      (b) =>
        filter === "all" ||
        (filter === "published" && b.isPublished) ||
        (filter === "draft" && !b.isPublished),
    )
    .filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  const toggleAll = () =>
    setSelected((s) =>
      s.length === filtered.length ? [] : filtered.map((b) => b._id),
    );

  const deleteB = async (id) => {
    try {
      await api.delete(`/blogs/${id}`);
      setBlogs((b) => b.filter((x) => x._id !== id));
      setOpenMenu(null);
    } catch (error) {
      console.error(error);
      alert("Failed to delete blog");
    }
  };

  const startEdit = async (id) => {
    try {
      const res = await api.get(`/blogs/${id}`);
      setEditingBlog(res.data.data);
      setPage("create");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <GlassCard>
          <div className="flex flex-col md:flex-row gap-4 p-4 items-center justify-between border-b-2 border-retro-border">
            <div className="flex items-center gap-1 bg-retro-bg border-2 border-retro-border p-1">
              {["all", "published", "draft"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-pixel uppercase tracking-wide transition-all duration-200 ${
                    filter === f
                      ? "bg-retro-accent text-retro-bg"
                      : "text-retro-text/40 hover:text-retro-accent"
                  }`}
                  style={{ fontFamily: T.pixel }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="relative flex-1 w-full max-w-sm">
              <Search
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-retro-text/30"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or category…"
                className="w-full bg-retro-bg border-2 border-retro-border pl-9 pr-4 py-2 text-xs text-retro-text placeholder-retro-text/25 focus:outline-none focus:border-retro-accent transition-all font-terminal"
              />
            </div>

            {selected.length > 0 && (
              <button
                className="flex items-center gap-2 px-4 py-2 border-2 border-red-500 bg-red-950/20 text-red-400 text-xs font-pixel hover:bg-red-950/40 shadow-[2px_2px_0px_#000] active:translate-y-[1px] cursor-pointer"
                style={{ fontFamily: T.pixel }}
              >
                <Trash2 size={12} /> Delete ({selected.length})
              </button>
            )}
          </div>
        </GlassCard>
      </div>

      <div>
        <GlassCard className="overflow-hidden">
          <div className="grid grid-cols-[24px_1fr_120px_90px_100px_100px_100px] gap-3 px-4 py-3 border-b-2 border-retro-border bg-retro-bg/40 max-lg:hidden items-center">
            <input
              type="checkbox"
              checked={
                selected.length === filtered.length && filtered.length > 0
              }
              onChange={toggleAll}
              className="w-4 h-4 border-2 border-retro-border bg-retro-bg accent-retro-accent"
            />
            {["Title", "Status", "Views", "Created", "Updated", "Actions"].map(
              (h) => (
                <div
                  key={h}
                  className="text-[10px] font-pixel text-retro-text/30 uppercase tracking-wider"
                  style={{ fontFamily: T.pixel }}
                >
                  {h}
                </div>
              ),
            )}
          </div>

          <div className="divide-y-2 divide-retro-border">
            {filtered.map((b, i) => (
              <div
                key={b._id}
                className="group hover:bg-retro-bg/30 transition-all duration-200"
              >
                <div className="hidden lg:grid grid-cols-[24px_1fr_120px_90px_100px_100px_100px] gap-3 px-4 py-4 items-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(b._id)}
                    onChange={() => toggleSelect(b._id)}
                    className="w-4 h-4 border-2 border-retro-border bg-retro-bg accent-retro-accent"
                  />
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 border-2 border-retro-border bg-retro-bg flex items-center justify-center text-sm flex-shrink-0">
                      {b.isPublished ? "⚡" : "📝"}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-retro-text/75 text-xs font-semibold group-hover:text-retro-accent transition-colors truncate uppercase font-pixel tracking-wide"
                        style={{ fontFamily: T.pixel }}
                      >
                        {b.title}
                      </p>
                      <p
                        className="text-retro-text/30 text-[10px] font-terminal uppercase mt-0.5"
                        style={{ fontFamily: T.mono }}
                      >
                        {b.category || "General"}
                      </p>
                    </div>
                  </div>
                  <Badge status={b.isPublished ? "published" : "draft"} />
                  <span
                    className="text-retro-text/40 text-xs flex items-center gap-1 font-terminal uppercase"
                    style={{ fontFamily: T.mono }}
                  >
                    <Eye size={10} className="text-retro-accent" />
                    {b.isPublished
                      ? b.views >= 1000
                        ? `${(b.views / 1000).toFixed(1)}K`
                        : b.views
                      : "—"}
                  </span>
                  <span
                    className="text-retro-text/30 text-[10px] font-terminal uppercase"
                    style={{ fontFamily: T.mono }}
                  >
                    {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                  <span
                    className="text-retro-text/30 text-[10px] font-terminal uppercase"
                    style={{ fontFamily: T.mono }}
                  >
                    {new Date(b.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="relative">
                    <div className="flex items-center gap-1.5">
                      {[
                        {
                          icon: <Eye size={12} />,
                          title: "View",
                          action: () => navigate(`/blog/${b._id}`),
                        },
                        {
                          icon: <Edit3 size={12} />,
                          title: "Edit",
                          action: () => startEdit(b._id),
                        },
                        {
                          icon: <Trash2 size={12} />,
                          title: "Delete",
                          action: () => deleteB(b._id),
                        },
                      ].map((a, j) => (
                        <button
                          key={j}
                          title={a.title}
                          onClick={a.action}
                          className="w-7 h-7 border-2 border-retro-border hover:border-retro-accent bg-retro-surface flex items-center justify-center text-retro-text/40 hover:text-retro-accent cursor-pointer shadow-[1px_1px_0px_#000] active:translate-y-[1px]"
                        >
                          {a.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:hidden p-4 flex items-start gap-3">
                  <div className="w-10 h-10 border-2 border-retro-border bg-retro-bg flex items-center justify-center text-xl flex-shrink-0">
                    {b.isPublished ? "⚡" : "📝"}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <p
                      className="text-retro-text/75 text-sm font-semibold uppercase font-pixel tracking-wide"
                      style={{ fontFamily: T.pixel }}
                    >
                      {b.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge status={b.isPublished ? "published" : "draft"} />
                      <span
                        className="text-retro-text/30 text-[10px] font-terminal uppercase"
                        style={{ fontFamily: T.mono }}
                      >
                        {b.category || "General"}
                      </span>
                      {b.isPublished && (
                        <span
                          className="text-retro-accent text-[10px] flex items-center gap-1 font-terminal uppercase"
                          style={{ fontFamily: T.mono }}
                        >
                          <Eye size={10} />
                          {b.views >= 1000
                            ? `${(b.views / 1000).toFixed(1)}K`
                            : b.views}
                        </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {[
                          {
                            i: <Edit3 size={11} />,
                            c: "text-cyan-400",
                            fn: () => startEdit(b._id),
                          },
                          {
                            i: <Trash2 size={11} />,
                            c: "text-red-400",
                            fn: () => deleteB(b._id),
                          },
                        ].map((a, j) => (
                          <button
                            key={j}
                            onClick={a.fn}
                            className={`w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.04] flex items-center justify-center ${a.c} transition-all`}
                          >
                            {a.i}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <FileText size={32} className="text-retro-text/10 mx-auto mb-3" />
              <p
                className="text-retro-text/30 text-sm font-terminal uppercase"
                style={{ fontFamily: T.mono }}
              >
                No blogs match your filter
              </p>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3.5 border-t-2 border-retro-border bg-retro-bg/10">
              <p
                className="text-retro-text/30 text-[10px] font-terminal uppercase"
                style={{ fontFamily: T.mono }}
              >
                Showing {filtered.length} of {blogs.length} blogs
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    className={`w-7 h-7 border-2 text-xs font-pixel uppercase tracking-wide transition-all ${
                      p === 1
                        ? "bg-retro-accent text-retro-bg border-retro-accent"
                        : "border-retro-border text-retro-text/40 hover:text-retro-accent hover:border-retro-accent bg-retro-surface"
                    }`}
                    style={{ fontFamily: T.pixel }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   PLACEHOLDER PAGES
════════════════════════════════════════════════ */
function PlaceholderPage({ title, icon, desc }) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] text-center"
    >
      <div className="w-16 h-16 border-4 border-retro-accent bg-retro-surface flex items-center justify-center text-retro-accent mb-5 shadow-[4px_4px_0px_#000]">
        {icon}
      </div>
      <h2
        className="text-3xl font-black text-retro-accent uppercase tracking-widest mb-2"
        style={{ fontFamily: T.ox }}
      >
        {title}
        <span className="text-retro-accent">.</span>
      </h2>
      <p
        className="text-retro-text/40 text-sm max-w-xs font-terminal uppercase"
        style={{ fontFamily: T.mono }}
      >
        {desc}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════
   ROOT
════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [editingBlog, setEditingBlog] = useState(null);

  useEffect(() => {
    api
      .get("/users/current-user")
      .then((res) => {
        const currentUser = res.data.data;
        if (currentUser.role !== "admin") {
          navigate("/dashboard");
          return;
        }
        setUser(currentUser);
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const [page, setPage] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [readAdminOnly, setReadAdminOnly] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const check = () => {
      if (window.innerWidth >= 1024) setSideOpen(true);
      else setSideOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: T.bg, fontFamily: T.mono }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:8px;height:8px}
        ::-webkit-scrollbar-track{background:#252525}
        ::-webkit-scrollbar-thumb{background:#474744;border:2px solid #252525}
        ::-webkit-scrollbar-thumb:hover{background:#E8E8C6}
        input:-webkit-autofill,input:-webkit-autofill:focus{
          -webkit-box-shadow:0 0 0 1000px #252525 inset!important;
          -webkit-text-fill-color:#E8E8C6!important
        }
        select option{background:#474744;color:#E8E8C6}
      `}</style>

      <Background />
      <Sidebar
        page={page}
        setPage={setPage}
        open={sideOpen}
        setOpen={setSideOpen}
        handleLogout={handleLogout}
      />
      <Topbar
        setOpen={setSideOpen}
        setPage={setPage}
        setEditingBlog={setEditingBlog}
      />

      <main className="relative z-10 lg:pl-[220px] pt-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {page === "dashboard" && (
            <DashboardPage setPage={setPage} setEditingBlog={setEditingBlog} setReadAdminOnly={setReadAdminOnly} user={user} />
          )}
          {page === "manage" && (
            <ManageBlogsPage
              setPage={setPage}
              setEditingBlog={setEditingBlog}
            />
          )}
          {page === "read" && (
            <ReadBlogsPage adminOnly={readAdminOnly} />
          )}

          {/* Always mounted so state is never lost, hidden when not active */}
          <div style={{ display: page === "create" ? "block" : "none" }}>
            <CreateBlogPage
              editingBlog={editingBlog}
              setEditingBlog={setEditingBlog}
            />
          </div>
        </div>
      </main>

      <button
        onClick={() => {
          setEditingBlog(null);
          setPage("create");
        }}
        className="fixed bottom-6 right-6 lg:hidden flex items-center gap-2 px-5 py-3 border-2 border-retro-accent bg-retro-accent text-retro-bg font-pixel text-sm z-30 shadow-[4px_4px_0px_#000] active:translate-y-[1px] cursor-pointer"
        style={{
          fontFamily: T.pixel,
        }}
      >
        <Plus size={16} /> NEW BLOG
      </button>
    </div>
  );
}
