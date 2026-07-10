import { useState, useEffect } from "react";
import {
  Feather,
  LayoutDashboard,
  BookOpen,
  PenLine,
  LogOut,
  Bell,
  Search,
  Plus,
  Eye,
  TrendingUp,
  ArrowRight,
  Menu,
  Edit3,
  Trash2,
  Globe,
  FileText,
  Save,
  ChevronRight,
  Star,
  Shield,
  BookMarked,
  Send,
  Sparkles,
} from "lucide-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import CreateBlogPage from "./CreateBlogPage";
import ReadBlogsPage from "./ReadBlogsFeed";
import AIAssistantPage from "./AIAssistantPage";

// Font stack constants (used by inline style overrides in JSX)
// eslint-disable-next-line no-unused-vars
const ACCENT = { ox: "'VT323', monospace", mono: "'Space Mono', monospace", pixel: "'Silkscreen', monospace" };

const CHART_DATA = [
  { day: "Mon", views: 1200 },
  { day: "Tue", views: 2800 },
  { day: "Wed", views: 1900 },
  { day: "Thu", views: 4200 },
  { day: "Fri", views: 3100 },
  { day: "Sat", views: 5800 },
  { day: "Sun", views: 4600 },
];

/* ════════════════════════════════════════════════
   BACKGROUND
   ════════════════════════════════════════════════ */
function Background() {
  return null; // Global background is handled in index.css body style
}

/* ════════════════════════════════════════════════
   SPARKLINE
   ════════════════════════════════════════════════ */
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

/* ════════════════════════════════════════════════
   GLASS CARD -> RETRO PANEL CARD
   ════════════════════════════════════════════════ */
function GlassCard({ children, className = "", borderClass = "border-retro-border" }) {
  return (
    <div className={`border-2 ${borderClass} bg-retro-surface rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E] overflow-hidden ${className}`}>
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
      cls: "border-emerald-400/30 text-emerald-400 bg-[#13141f]",
      dot: "bg-emerald-400",
      label: "Published",
    },
    draft: {
      cls: "border-retro-accent/30  text-retro-accent  bg-[#13141f]",
      dot: "bg-retro-accent",
      label: "Draft",
    },
    flagged: {
      cls: "border-red-400/30    text-red-400    bg-[#13141f]",
      dot: "bg-red-400",
      label: "Flagged",
    },
  };
  const s = map[status] || map.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-pixel border rounded-lg ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label.toUpperCase()}
    </span>
  );
}

function GradientBtn({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-retro-border bg-retro-accent text-[#1C1D2E] font-pixel hover:bg-retro-accent/80 active:translate-y-[1px] shadow-[2px_2px_0px_#1C1D2E] cursor-pointer rounded-xl select-none ${className}`}
    >
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════════
   SIDEBAR
   ════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id: "dashboard", icon: <LayoutDashboard size={16}/>, label: "Dashboard" },
  { id: "create",    icon: <PenLine size={16}/>,         label: "Create Blog" },
  { id: "ai-assistant", icon: <Sparkles size={16} className="text-[#FF728F] animate-pulse" />, label: "AI Assistant", isAi: true },
  { id: "manage",    icon: <BookMarked size={16}/>,      label: "My Blogs" },
  { id: "read",      icon: <BookOpen size={16}/>,        label: "Read Blogs" },
];

function Sidebar({ page, setPage, collapsed, setCollapsed, setEditingBlog, handleLogout }) {
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
          {NAV_ITEMS.map(item => {
            const isActive = page === item.id;
            return (
              <button key={item.id} onClick={() => { if (item.id === "create") { if (setEditingBlog) setEditingBlog(null); setPage("create"); } else { setPage(item.id); } setCollapsed(window.innerWidth < 1024 ? true : collapsed); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 group relative text-left cursor-pointer ${
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 text-retro-text/40 hover:text-retro-accent hover:bg-[#13141f] rounded-xl border border-transparent group relative cursor-pointer ${collapsed ? "lg:justify-center lg:px-2" : ""}`}
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

/* ════════════════════════════════════════════════
   TOPBAR
   ════════════════════════════════════════════════ */
function Topbar({ collapsed, setCollapsed, setPage, setEditingBlog, user }) {
  const [search, setSearch] = useState("");
  return (
    <header className="fixed top-4 right-4 h-16 z-20 border-2 border-retro-border bg-retro-surface rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E] flex items-center px-4 gap-4 transition-all duration-300"
      style={{ left: collapsed ? "calc(68px + 32px)" : "calc(230px + 32px)" }}>
      
      <button
        className="lg:hidden text-retro-text/60 hover:text-retro-accent p-1.5 border border-retro-border bg-[#13141f] rounded-lg transition-all"
        onClick={() => setCollapsed(false)}
      >
        <Menu size={17} />
      </button>

      <div className="relative flex-1 max-w-sm">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-retro-text/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="how you doin'?…"
          className="w-full bg-[#13141f] border border-retro-border rounded-xl pl-9 pr-4 py-2 text-xs text-retro-text placeholder-retro-text/25 focus:outline-none focus:border-retro-accent transition-all font-terminal"
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

        <button className="relative w-9 h-9 border border-retro-border bg-[#13141f] hover:bg-retro-surface flex items-center justify-center text-retro-text/40 hover:text-retro-accent rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_#1C1D2E] active:translate-y-[1px]">
          <Bell size={15} />
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-retro-accent text-[9px] font-pixel text-[#1C1D2E] rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        <div className="w-9 h-9 border border-retro-accent bg-retro-accent rounded-xl flex items-center justify-center text-xs font-pixel text-[#1C1D2E] cursor-pointer shadow-[2px_2px_0px_#1C1D2E] hover:bg-retro-accent/80 transition-colors select-none">
          {user ? user.username?.substring(0,2).toUpperCase() : "AD"}
        </div>
      </div>
    </header>
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
  trend,
  data,
}) {
  let borderClass = "border-retro-border";
  let textClass = "text-retro-accent";
  let sparkColor = "#8F72FF";
  let iconCls = "bg-[#13141f] border-retro-accent text-retro-accent";

  if (label === "Total Blogs") {
    borderClass = "border-retro-border";
    textClass = "text-retro-accent";
    sparkColor = "#8F72FF";
    iconCls = "bg-[#13141f] border-retro-accent text-retro-accent";
  } else if (label === "Published Blogs") {
    borderClass = "border-retro-border";
    textClass = "text-emerald-400";
    sparkColor = "#34d399";
    iconCls = "bg-[#13141f] border-emerald-500 text-emerald-400";
  } else if (label === "Draft Blogs") {
    borderClass = "border-retro-border";
    textClass = "text-retro-accent";
    sparkColor = "#8F72FF";
    iconCls = "bg-[#13141f] border-retro-border text-retro-accent";
  } else {
    borderClass = "border-retro-border";
    textClass = "text-orange-400";
    sparkColor = "#fb923c";
    iconCls = "bg-[#13141f] border-orange-400 text-orange-400";
  }

  return (
    <div className={`relative border-2 ${borderClass} bg-retro-surface p-5 rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E] group`}>
      <div className="flex items-start justify-between mb-4 relative">
        <div className={`w-10 h-10 border border-retro-border rounded-xl flex items-center justify-center ${iconCls}`}>
          {icon}
        </div>
        <span className="flex items-center gap-1 text-[9px] font-pixel px-2 py-0.5 border border-retro-border rounded-lg bg-[#13141f] text-retro-accent uppercase tracking-wider">
          {trend}
        </span>
      </div>

      <div className="relative">
        <p className={`text-4xl font-black ${textClass} mb-1 font-heading`}>
          <Counter target={value} />
        </p>
        <p className="text-retro-text/60 text-xs mb-4 uppercase tracking-wider font-terminal">
          {label}
        </p>
      </div>

      {data && (
        <div className="mt-4 h-10">
          <Sparkline data={Array.isArray(data) && data.length ? data.map(d => typeof d === 'object' ? d.views || 0 : d) : [10, 15, 12, 22, 18, 25]} color={sparkColor} />
        </div>
      )}

      <p className="text-retro-text/30 text-[10px] mt-2 font-terminal uppercase">
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
  const [loading, setLoading] = useState(true); // eslint-disable-line no-unused-vars
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
      trend: `+${getNewBlogsThisMonth()} this month`,
      data: null,
    },
    {
      label: "Published Blogs",
      value: publishedBlogsCount,
      icon: <Globe size={16} />,
      trend: `+${getNewPublishedThisMonth()} this month`,
      data: null,
    },
    {
      label: "Draft Blogs",
      value: draftBlogsCount,
      icon: <FileText size={16} />,
      trend: "In progress",
      data: null,
    },
    {
      label: "Total Views",
      value: totalViews,
      icon: <Eye size={16} />,
      trend: "+14.2%",
      data: CHART_DATA,
    },
  ];

  const recentBlogs = [...blogs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Views bucketed by creation month over the last 6 months, for the platform chart
  const monthlyViews = (() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString("default", { month: "short" }),
        views: 0
      });
    }
    blogs.forEach(b => {
      const d = new Date(b.createdAt);
      const bucket = months.find(m => m.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (bucket) bucket.views += b.views || 0;
    });
    return months;
  })();

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
          color: "text-emerald-400 border-emerald-500/30 bg-[#13141f]",
          text: `Published '${b.title}'`,
          time: timeStr,
          timestamp: new Date(b.updatedAt || b.createdAt).getTime()
        });
      } else {
        acts.push({
          icon: <Save size={12} />,
          color: "text-retro-accent border-retro-accent/30 bg-[#13141f]",
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
          color: "text-orange-400 border-orange-400/30 bg-[#13141f]",
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
        <div className="relative border-2 border-retro-border bg-retro-surface p-6 sm:p-8 rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E]">
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-retro-accent bg-[#13141f] text-retro-accent text-[10px] font-pixel rounded-lg">
                <Shield size={10} className="animate-pulse text-retro-accent" /> Admin Dashboard
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-retro-accent tracking-widest uppercase font-heading">
                {greeting.toUpperCase()}, {user?.username || "Admin"}<span className="text-retro-accent">.</span>
              </h1>
              <p className="text-retro-text/60 text-xs font-terminal">
                @{user?.username || "admin"} · Writer since {user?.createdAt ? new Date(user.createdAt).getFullYear() : "2026"} · Admin
              </p>
            </div>
            <div>
              <button
                onClick={() => {
                  setEditingBlog(null);
                  setPage("create");
                }}
                className="flex items-center gap-2 px-5 py-2.5 border border-retro-border bg-retro-accent text-[#1C1D2E] text-xs font-pixel rounded-xl hover:bg-retro-accent/80 active:translate-y-[1px] shadow-[2px_2px_0px_#1C1D2E] cursor-pointer select-none"
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
            <div className="flex items-center justify-between px-5 py-4 border-b border-retro-border/20 bg-[#13141f]">
              <div>
                <h2 className="text-xl font-bold text-retro-accent uppercase tracking-wider font-heading">
                  Recent Blogs
                </h2>
                <p className="text-retro-text/30 text-[10px] font-terminal uppercase mt-0.5">
                  {totalBlogs} total posts
                </p>
              </div>
              <button
                onClick={() => setPage("manage")}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-retro-border rounded-xl hover:border-retro-accent text-retro-text/40 hover:text-retro-accent text-xs font-pixel uppercase tracking-wide cursor-pointer shadow-[2px_2px_0px_#1C1D2E] active:translate-y-[1px] transition-all"
              >
                Manage all <ChevronRight size={11} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {recentBlogs.map((b) => (
                <div
                  key={b._id}
                  className="group flex items-center gap-3 p-3 border border-retro-border/40 bg-[#13141f]/15 hover:border-retro-accent hover:bg-[#13141f]/30 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  <div className="flex-1 min-w-0" onClick={() => navigate(`/blog/${b._id}`)}>
                    <p className="text-retro-text/75 text-sm font-semibold group-hover:text-retro-accent transition-colors uppercase tracking-wider font-terminal">
                      {b.title}
                    </p>
                    <p className="text-retro-text/40 text-[10px] font-terminal uppercase mt-0.5">
                      {b.category || "General"} · {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "June 2026"}
                    </p>
                  </div>
                  <Badge status={b.isPublished ? "published" : "draft"} />
                  {b.isPublished && (
                    <span className="text-retro-text/40 text-xs flex items-center gap-1 flex-shrink-0 font-terminal uppercase">
                      <Eye size={10} />
                      {b.views >= 1000 ? `${(b.views / 1000).toFixed(1)}K` : b.views || 0}
                    </span>
                  )}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); startEdit(b._id); }}
                      className="w-8 h-8 border border-retro-border hover:border-retro-accent bg-retro-surface rounded-lg flex items-center justify-center text-retro-text/40 hover:text-retro-accent cursor-pointer shadow-[1px_1px_0px_#1C1D2E] active:translate-y-[1px]"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteBlog(b._id); }}
                      className="w-8 h-8 border border-retro-border hover:border-red-400 bg-retro-surface rounded-lg flex items-center justify-center text-retro-text/40 hover:text-red-400 cursor-pointer shadow-[1px_1px_0px_#1C1D2E] active:translate-y-[1px]"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {recentBlogs.length === 0 && (
                <div className="text-center py-8 text-retro-text/30 text-xs font-terminal uppercase">
                  No blogs found.
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard className="p-5 space-y-4">
            <h2 className="text-xl font-bold text-retro-accent uppercase tracking-wider font-heading">
              Quick Actions
            </h2>
            <div className="space-y-2.5">
              {[
                {
                  icon: <PenLine size={14} />,
                  label: "Create Blog",
                  desc: "Start writing",
                  border: "border-retro-border",
                  bg: "bg-[#13141f]",
                  iconColor: "text-retro-accent",
                  action: () => { setEditingBlog(null); setPage("create"); },
                },
                {
                  icon: <Star size={14} />,
                  label: "Featured by Admin",
                  desc: "Admin picks",
                  border: "border-retro-border",
                  bg: "bg-[#13141f]",
                  iconColor: "text-orange-400",
                  action: () => { setReadAdminOnly(true); setPage("read"); },
                },
                {
                  icon: <Send size={14} />,
                  label: "Publish Drafts",
                  desc: `${draftBlogsCount} drafts pending`,
                  border: "border-retro-border",
                  bg: "bg-[#13141f]",
                  iconColor: "text-emerald-400",
                  action: () => setPage("manage"),
                },
              ].map((a, i) => (
                <button
                  key={i}
                  onClick={a.action}
                  className={`w-full flex items-center gap-3 p-3 border rounded-xl ${a.border} ${a.bg} hover:border-retro-accent text-retro-text transition-all duration-200 group active:translate-y-[1px] shadow-[2px_2px_0px_#1C1D2E] cursor-pointer`}
                >
                  <div className={`w-8 h-8 border border-retro-border bg-retro-surface flex items-center justify-center rounded-lg ${a.iconColor} flex-shrink-0 shadow-[1px_1px_0px_#1C1D2E]`}>
                    {a.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-retro-text/75 text-xs font-semibold group-hover:text-retro-accent transition-colors font-pixel uppercase tracking-wide">
                      {a.label}
                    </p>
                    <p className="text-retro-text/40 text-[10px] font-terminal uppercase mt-0.5">
                      {a.desc}
                    </p>
                  </div>
                  <ArrowRight size={12} className="ml-auto text-retro-text/20 group-hover:text-retro-accent transition-colors" />
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-retro-border/20 bg-[#13141f]">
              <h2 className="text-xl font-bold text-retro-accent uppercase tracking-wider font-heading">
                Activity
              </h2>
              <div className="flex items-center gap-1.5 text-xs font-terminal uppercase text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Live
              </div>
            </div>
            <div className="p-4 space-y-2.5">
              {activitiesList.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2.5 border border-retro-border/40 rounded-xl hover:border-retro-accent bg-[#13141f]/20 transition-all duration-200 cursor-pointer group"
                >
                  <div className={`w-6 h-6 border border-retro-border rounded-lg flex items-center justify-center flex-shrink-0 ${a.color}`}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-retro-text/75 text-xs group-hover:text-retro-accent transition-colors leading-snug font-terminal uppercase">
                      {a.text}
                    </p>
                  </div>
                  <span className="text-retro-text/40 text-[9px] flex-shrink-0 mt-0.5 font-terminal uppercase">
                    {a.time}
                  </span>
                </div>
              ))}
              {activitiesList.length === 0 && (
                <div className="text-center py-8 text-retro-text/30 text-xs font-terminal uppercase">
                  No recent activity.
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Platform analytics — fills the lower dashboard area with real data */}
      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-retro-border/20 bg-[#13141f]">
          <div>
            <h2 className="text-xl font-bold text-retro-accent uppercase tracking-wider font-heading">
              Platform Views
            </h2>
            <p className="text-retro-text/30 text-[10px] font-terminal uppercase mt-0.5">
              Views across all posts, by month
            </p>
          </div>
          <span className="text-retro-text/40 text-xs font-terminal uppercase">
            {blogs.reduce((s, b) => s + (b.views || 0), 0)} total views
          </span>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyViews} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="adminViewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8F72FF" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#8F72FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C1D2E" />
              <XAxis dataKey="label" stroke="#E2E2F5" tick={{ fontSize: 11, fontFamily: "monospace" }} />
              <YAxis stroke="#E2E2F5" tick={{ fontSize: 11, fontFamily: "monospace" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#13141f", border: "1px solid #1C1D2E", borderRadius: "8px", fontSize: "12px", color: "#E2E2F5" }} />
              <Area type="monotone" dataKey="views" stroke="#8F72FF" strokeWidth={2} fill="url(#adminViewsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MANAGE BLOGS PAGE
   ════════════════════════════════════════════════ */
function ManageBlogsPage({ setPage, setEditingBlog }) {
  const [blogs, setBlogs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

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
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await api.delete(`/blogs/${id}`);
      setBlogs((b) => b.filter((x) => x._id !== id));
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
          <div className="flex flex-col md:flex-row gap-4 p-4 items-center justify-between border-b border-retro-border/20 bg-[#13141f]">
            <div className="flex items-center gap-1 bg-[#13141f] border border-retro-border rounded-xl p-1">
              {["all", "published", "draft"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-pixel uppercase tracking-wide transition-all duration-200 rounded-lg ${
                    filter === f
                      ? "bg-retro-accent text-[#1C1D2E]"
                      : "text-retro-text/40 hover:text-retro-accent"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="relative flex-1 w-full max-w-sm">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-retro-text/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or category…"
                className="w-full bg-[#13141f] border border-retro-border rounded-xl pl-9 pr-4 py-2 text-xs text-retro-text placeholder-retro-text/25 focus:outline-none focus:border-retro-accent transition-all font-terminal"
              />
            </div>

            {selected.length > 0 && (
              <button className="flex items-center gap-2 px-4 py-2 border border-red-500 bg-red-950/20 text-red-400 text-xs font-pixel rounded-xl hover:bg-red-950/40 shadow-[2px_2px_0px_#1C1D2E] active:translate-y-[1px] cursor-pointer">
                <Trash2 size={12} /> Delete ({selected.length})
              </button>
            )}
          </div>
        </GlassCard>
      </div>

      <div>
        <GlassCard className="overflow-hidden">
          <div className="grid grid-cols-[24px_1fr_120px_90px_100px_100px_100px] gap-3 px-4 py-3 border-b border-retro-border/20 bg-[#13141f] max-lg:hidden items-center">
            <input
              type="checkbox"
              checked={
                selected.length === filtered.length && filtered.length > 0
              }
              onChange={toggleAll}
              className="w-4 h-4 rounded accent-retro-accent cursor-pointer"
            />
            {["Title", "Status", "Views", "Created", "Updated", "Actions"].map(
              (h) => (
                <div key={h} className="text-[10px] font-pixel text-retro-text/30 uppercase tracking-wider">
                  {h}
                </div>
              ),
            )}
          </div>

          <div className="divide-y divide-retro-border/20">
            {filtered.map((b) => (
              <div key={b._id} className="group hover:bg-[#13141f]/35 transition-all duration-200">
                <div className="hidden lg:grid grid-cols-[24px_1fr_120px_90px_100px_100px_100px] gap-3 px-4 py-4 items-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(b._id)}
                    onChange={() => toggleSelect(b._id)}
                    className="w-4 h-4 rounded accent-retro-accent cursor-pointer"
                  />
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 border border-retro-border bg-[#13141f] rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                      {b.isPublished ? "⚡" : "📝"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-retro-text/75 text-xs font-semibold group-hover:text-retro-accent transition-colors truncate uppercase font-terminal tracking-wide">
                        {b.title}
                      </p>
                      <p className="text-retro-text/30 text-[10px] font-terminal uppercase mt-0.5">
                        {b.category || "General"}
                      </p>
                    </div>
                  </div>
                  <Badge status={b.isPublished ? "published" : "draft"} />
                  <span className="text-retro-text/40 text-xs flex items-center gap-1 font-terminal uppercase">
                    <Eye size={10} className="text-retro-accent" />
                    {b.isPublished
                      ? b.views >= 1000
                        ? `${(b.views / 1000).toFixed(1)}K`
                        : b.views
                      : "—"}
                  </span>
                  <span className="text-retro-text/30 text-[10px] font-terminal uppercase">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-retro-text/30 text-[10px] font-terminal uppercase">
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
                          className="w-7 h-7 border border-retro-border hover:border-retro-accent bg-retro-surface rounded-lg flex items-center justify-center text-retro-text/40 hover:text-retro-accent cursor-pointer shadow-[1px_1px_0px_#1C1D2E] active:translate-y-[1px]"
                        >
                          {a.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:hidden p-4 flex items-start gap-3">
                  <div className="w-10 h-10 border border-retro-border bg-[#13141f] rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    {b.isPublished ? "⚡" : "📝"}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-retro-text/75 text-sm font-semibold uppercase font-terminal tracking-wide">
                      {b.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge status={b.isPublished ? "published" : "draft"} />
                      <span className="text-retro-text/30 text-[10px] font-terminal uppercase">
                        {b.category || "General"}
                      </span>
                      {b.isPublished && (
                        <span className="text-retro-accent text-[10px] flex items-center gap-1 font-terminal uppercase">
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
                          c: "text-retro-accent",
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
                          className={`w-8 h-8 border border-retro-border bg-retro-surface rounded-lg flex items-center justify-center ${a.c} transition-all cursor-pointer`}
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
              <p className="text-retro-text/30 text-sm font-terminal uppercase">
                No blogs match your filter
              </p>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3.5 border-t border-retro-border/20 bg-[#13141f]">
              <p className="text-retro-text/30 text-[10px] font-terminal uppercase">
                Showing {filtered.length} of {blogs.length} blogs
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    className={`w-7 h-7 border text-xs font-pixel uppercase tracking-wide transition-all rounded-lg ${
                      p === 1
                        ? "bg-retro-accent text-[#1C1D2E] border-retro-accent"
                        : "border-retro-border text-retro-text/40 hover:text-retro-accent hover:border-retro-accent bg-retro-surface"
                    }`}
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
  const [collapsed, setCollapsed] = useState(false);
  const [readAdminOnly, setReadAdminOnly] = useState(false);
  const [createKey, setCreateKey] = useState(0);

  const handleAILoad = (aiDraft) => {
    localStorage.setItem("quillforge_draft", JSON.stringify(aiDraft));
    setEditingBlog(null);
    setCreateKey(prev => prev + 1);
    setPage("create");
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
    const check = () => {
      if (window.innerWidth >= 1024) setCollapsed(false);
      else setCollapsed(true);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (loading) return <div className="text-center py-20 text-retro-text/30 font-terminal uppercase">Loading...</div>;

  return (
    <div className="min-h-screen bg-retro-bg">
      <Background />
      <Sidebar
        page={page}
        setPage={setPage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        setEditingBlog={setEditingBlog}
        handleLogout={handleLogout}
      />
      <Topbar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        setPage={setPage}
        setEditingBlog={setEditingBlog}
        user={user}
      />

      <main
        className="relative z-10 min-h-screen pt-24 pb-8 pr-4 transition-all duration-300"
        style={{ paddingLeft: window.innerWidth >= 1024 ? (collapsed ? "100px" : "262px") : "16px" }}
      >
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
          {page === "ai-assistant" && (
            <AIAssistantPage onGenerateSuccess={handleAILoad} />
          )}
          {page === "read" && (
            <ReadBlogsPage adminOnly={readAdminOnly} />
          )}

          {/* Always mounted so state is never lost, hidden when not active */}
          <div style={{ display: page === "create" ? "block" : "none" }}>
            <CreateBlogPage
              key={editingBlog ? `edit-${editingBlog._id}` : `new-${createKey}`}
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
        className="fixed bottom-6 right-6 lg:hidden flex items-center gap-2 px-5 py-3 border border-retro-border bg-retro-accent text-[#1C1D2E] font-pixel text-xs z-30 shadow-[2px_2px_0px_#1C1D2E] active:translate-y-[1px] cursor-pointer rounded-xl"
      >
        <Plus size={16} /> NEW BLOG
      </button>
    </div>
  );
}
