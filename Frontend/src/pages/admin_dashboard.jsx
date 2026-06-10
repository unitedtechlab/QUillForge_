
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip
} from "recharts";
import {
  Feather, LayoutDashboard, BookOpen, PenLine, BarChart3,
  Settings, LogOut, Bell, Search, Plus, Eye, Heart,
  MessageSquare, TrendingUp, ArrowRight, Menu, X,
  MoreHorizontal, Edit3, Trash2, ExternalLink, Globe,
  FileText, Clock, Tag, ChevronRight, Sparkles, Save,
  Hash, AlignLeft, ToggleLeft, ToggleRight, CheckCircle2,
  AlertCircle, Filter, SortAsc, ChevronDown, Copy, Zap,
  Star, Activity, Users, Send, RefreshCw, Shield,
  BookMarked, Layers
} from "lucide-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

/* ════════════════════════════════════════════════
   DESIGN TOKENS
════════════════════════════════════════════════ */
const T = {
  ox:   "'Oxanium',sans-serif",
  mono: "'Space Mono',monospace",
  bg:   "#050816",
};

/* ════════════════════════════════════════════════
   MOCK DATA
════════════════════════════════════════════════ */
const BLOGS = [
  { id:1, title:"Building Scalable APIs with Node.js",       slug:"building-scalable-apis-nodejs",  status:"published", views:8241,  created:"Jun 1, 2025",  updated:"Jun 3, 2025",  category:"Technology", likes:432, comments:38  },
  { id:2, title:"The Art of Minimalist UI Design Systems",   slug:"art-minimalist-ui-design",       status:"published", views:5712,  created:"May 24, 2025", updated:"May 26, 2025", category:"Design",     likes:289, comments:24  },
  { id:3, title:"Mastering TypeScript Generics — Deep Dive", slug:"mastering-typescript-generics",  status:"published", views:10183, created:"May 18, 2025", updated:"May 20, 2025", category:"Dev",        likes:567, comments:61  },
  { id:4, title:"My Productivity Stack as a Solo Developer", slug:"my-productivity-stack",          status:"draft",     views:0,     created:"Jun 3, 2025",  updated:"Jun 3, 2025",  category:"Lifestyle",  likes:0,   comments:0   },
  { id:5, title:"Why I Left React for Solid.js",             slug:"why-i-left-react-solidjs",       status:"published", views:14500, created:"Apr 30, 2025", updated:"May 1, 2025",  category:"Technology", likes:921, comments:95  },
  { id:6, title:"CSS Container Queries Explained",           slug:"css-container-queries",          status:"draft",     views:0,     created:"Jun 5, 2025",  updated:"Jun 5, 2025",  category:"Dev",        likes:0,   comments:0   },
];

const CHART_DATA = [
  { day:"Mon",views:1200 },{ day:"Tue",views:2800 },{ day:"Wed",views:1900 },
  { day:"Thu",views:4200 },{ day:"Fri",views:3100 },{ day:"Sat",views:5800 },
  { day:"Sun",views:4600 },
];

const ACTIVITY = [
  { type:"publish", icon:<Globe size={12}/>,       color:"text-emerald-400 bg-emerald-400/10 border-emerald-400/20", text:"Published 'Building Scalable APIs'",     time:"2h ago"  },
  { type:"edit",    icon:<Edit3 size={12}/>,        color:"text-cyan-400    bg-cyan-400/10    border-cyan-400/20",    text:"Edited 'Mastering TypeScript Generics'", time:"5h ago"  },
  { type:"draft",   icon:<Save size={12}/>,         color:"text-amber-400   bg-amber-400/10   border-amber-400/20",   text:"Saved draft 'Productivity Stack'",       time:"1d ago"  },
  { type:"views",   icon:<TrendingUp size={12}/>,   color:"text-violet-400  bg-violet-400/10  border-violet-400/20",  text:"Post crossed 10K views milestone",       time:"2d ago"  },
  { type:"comment", icon:<MessageSquare size={12}/>,color:"text-pink-400    bg-pink-400/10    border-pink-400/20",    text:"New comment on 'Minimalist UI Design'",   time:"3d ago"  },
];

/* ════════════════════════════════════════════════
   ANIMATION VARIANTS
════════════════════════════════════════════════ */
const fadeUp   = { hidden:{opacity:0,y:20}, show:{opacity:1,y:0,transition:{duration:0.45,ease:[0.16,1,0.3,1]}} };
const fadeLeft = { hidden:{opacity:0,x:24}, show:{opacity:1,x:0,transition:{duration:0.45,ease:[0.16,1,0.3,1]}} };
const stagger  = { show:{ transition:{ staggerChildren:0.07 }} };
const pageVariants = {
  initial:{ opacity:0, y:12 },
  animate:{ opacity:1, y:0,  transition:{ duration:0.4, ease:[0.16,1,0.3,1] } },
  exit:   { opacity:0, y:-8, transition:{ duration:0.25 } },
};

/* ════════════════════════════════════════════════
   BACKGROUND
════════════════════════════════════════════════ */
function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0" style={{
        backgroundImage:`linear-gradient(rgba(99,102,241,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.035) 1px,transparent 1px)`,
        backgroundSize:"72px 72px",
      }}/>
      <div className="absolute -top-40 right-0       w-[700px] h-[700px] bg-violet-600/10  rounded-full blur-[150px]"/>
      <div className="absolute top-1/2  -left-40      w-[500px] h-[500px] bg-cyan-500/7     rounded-full blur-[120px]"/>
      <div className="absolute -bottom-40 right-1/4  w-[500px] h-[400px] bg-pink-600/6     rounded-full blur-[120px]"/>
      <div className="absolute inset-0 opacity-[0.018]" style={{
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize:"200px",
      }}/>
    </div>
  );
}

/* ════════════════════════════════════════════════
   SHARED ATOMS
   FIX: GlassCard no longer uses variants={fadeUp} which was
   causing Framer Motion to re-animate and steal focus on every
   parent re-render. It now only animates on hover.
════════════════════════════════════════════════ */
function GlassCard({ children, className="", glow="" }) {
  return (
    <motion.div
      whileHover={{ borderColor: glow || "rgba(34,211,238,0.25)", boxShadow: glow ? `0 0 40px ${glow}18` : "0 0 40px rgba(34,211,238,0.08)" }}
      transition={{ duration:0.25 }}
      className={`relative rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-md overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Badge({ status }) {
  const map = {
    published:{ cls:"border-emerald-400/30 text-emerald-300 bg-emerald-400/10", dot:"bg-emerald-400", label:"Published" },
    draft:    { cls:"border-amber-400/30  text-amber-300  bg-amber-400/10",     dot:"bg-amber-400",  label:"Draft"     },
    flagged:  { cls:"border-red-400/30    text-red-300    bg-red-400/10",       dot:"bg-red-400",    label:"Flagged"   },
  };
  const s = map[status] || map.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${s.cls}`} style={{fontFamily:T.ox}}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`}/>
      {s.label}
    </span>
  );
}

function GradientBtn({ children, onClick, className="" }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale:1.02, boxShadow:"0 0 28px rgba(34,211,238,0.35)" }}
      whileTap={{ scale:0.97 }}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white ${className}`}
      style={{ background:"linear-gradient(135deg,#22d3ee 0%,#7c3aed 100%)", fontFamily:T.ox }}
    >
      {children}
    </motion.button>
  );
}

/* ════════════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id:"dashboard",   icon:<LayoutDashboard size={15}/>, label:"Dashboard"   },
  { id:"create",      icon:<PenLine         size={15}/>, label:"Create Blog" },
  { id:"manage",      icon:<BookOpen        size={15}/>, label:"Manage Blogs"},
  { id:"analytics",   icon:<BarChart3       size={15}/>, label:"Analytics"   },
  { id:"settings",    icon:<Settings        size={15}/>, label:"Settings"    },
];

function Sidebar({ page, setPage, open, setOpen }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={()=>setOpen(false)}/>}
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : (typeof window!=="undefined" && window.innerWidth<1024 ? -240 : 0) }}
        className="fixed top-0 left-0 h-full w-[220px] z-40 flex flex-col border-r border-white/[0.06] backdrop-blur-xl"
        style={{ backgroundColor:"rgba(5,8,22,0.97)" }}
      >
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06] flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 flex-shrink-0">
            <Feather size={14} className="text-white"/>
          </div>
          <span className="text-white font-black text-lg tracking-tight" style={{fontFamily:T.ox}}>
            Quill<span className="text-cyan-400">.</span>
          </span>
          <button className="ml-auto lg:hidden text-white/40 hover:text-white" onClick={()=>setOpen(false)}>
            <X size={15}/>
          </button>
        </div>

        <div className="px-5 pt-5 pb-2">
          <p className="text-white/20 text-[9px] tracking-[0.2em] uppercase font-medium" style={{fontFamily:T.mono}}>Navigation</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item=>{
            const active = page===item.id;
            return (
              <motion.button
                key={item.id}
                onClick={()=>{ setPage(item.id); if(window.innerWidth<1024) setOpen(false); }}
                whileHover={{ x: active ? 0 : 3 }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative text-left ${
                  active
                  ? "bg-gradient-to-r from-cyan-500/15 to-violet-500/10 border border-cyan-500/25 text-white"
                  : "text-white/30 hover:text-white/70 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  />
                )}
                <span className={active ? "text-cyan-400" : "group-hover:text-cyan-400/60 transition-colors"}>{item.icon}</span>
                <span className="text-xs font-semibold" style={{fontFamily:T.ox}}>{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.9)]"/>}
              </motion.button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.06] space-y-0.5">
          <motion.button whileHover={{x:3}} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all border border-transparent text-left">
            <LogOut size={15}/><span className="text-xs font-semibold" style={{fontFamily:T.ox}}>Logout</span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}

/* ════════════════════════════════════════════════
   TOPBAR
════════════════════════════════════════════════ */
function Topbar({ setOpen, setPage }) {
  const [search, setSearch] = useState("");
  return (
    <div className="fixed top-0 right-0 left-[220px] max-lg:left-0 h-16 z-20 flex items-center px-5 gap-4 border-b border-white/[0.06]"
      style={{ backgroundColor:"rgba(5,8,22,0.85)", backdropFilter:"blur(20px)" }}>
      <button className="lg:hidden text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-all" onClick={()=>setOpen(true)}>
        <Menu size={17}/>
      </button>

      <div className="relative flex-1 max-w-sm">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20"/>
        <input
          value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search blogs, drafts, users…"
          className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/18 focus:outline-none focus:border-cyan-400/40 transition-all"
          style={{fontFamily:T.mono}}
        />
      </div>

      <div className="flex items-center gap-2.5 ml-auto">
        <GradientBtn onClick={()=>setPage("create")} className="hidden sm:flex text-xs px-4 py-2">
          <Plus size={13}/> New Blog
        </GradientBtn>

        <motion.button whileHover={{scale:1.05}} className="relative w-9 h-9 rounded-xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-white/35 hover:text-white transition-all">
          <Bell size={15}/>
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-[9px] font-bold text-white flex items-center justify-center">3</span>
        </motion.button>

        <motion.div whileHover={{scale:1.05}} className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-xs font-black text-white cursor-pointer shadow-lg shadow-cyan-500/20" style={{fontFamily:T.ox}}>
          KX
        </motion.div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   ANIMATED COUNTER
════════════════════════════════════════════════ */
function Counter({ target, duration=1200 }) {
  const [val, setVal] = useState(0);
  useEffect(()=>{
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now-start)/duration,1);
      const e = 1-Math.pow(1-p,3);
      setVal(Math.round(e*target));
      if(p<1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },[target,duration]);
  return <>{val>=1000?`${(val/1000).toFixed(val>=10000?0:1)}K`:val}</>;
}

/* ════════════════════════════════════════════════
   STAT CARD
════════════════════════════════════════════════ */
function StatCard({ label, value, icon, gradFrom, gradTo, glowColor, trend, data, delay=0 }) {
  return (
    <motion.div variants={fadeUp} transition={{delay}}>
      <motion.div
        whileHover={{ y:-4, boxShadow:`0 20px 60px ${glowColor}20` }}
        transition={{ duration:0.25 }}
        className="relative rounded-2xl border border-white/[0.07] p-5 overflow-hidden group cursor-default"
        style={{ background:"rgba(255,255,255,0.025)", backdropFilter:"blur(12px)" }}
      >
        <motion.div
          initial={{ opacity:0 }} whileHover={{ opacity:1 }} transition={{ duration:0.3 }}
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none"
          style={{ background:`radial-gradient(circle,${glowColor}30,transparent 70%)` }}
        />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background:`linear-gradient(90deg,transparent,${glowColor}60,transparent)` }}/>

        <div className="flex items-start justify-between mb-4 relative">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border`}
            style={{ background:`${glowColor}12`, borderColor:`${glowColor}30`, color:glowColor }}>
            {icon}
          </div>
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border text-emerald-300 bg-emerald-400/10 border-emerald-400/20" style={{fontFamily:T.ox}}>
            <TrendingUp size={8}/>{trend}
          </span>
        </div>

        <div className="relative">
          <p className="text-3xl font-black mb-0.5" style={{ fontFamily:T.ox, background:`linear-gradient(135deg,${gradFrom},${gradTo})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            <Counter target={value}/>
          </p>
          <p className="text-white/30 text-xs" style={{fontFamily:T.mono}}>{label}</p>
        </div>

        {data && (
          <div className="mt-4 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{top:0,right:0,bottom:0,left:0}}>
                <defs>
                  <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={glowColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={glowColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="views" stroke={glowColor} strokeWidth={1.5} fill={`url(#g-${label})`} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════
   DASHBOARD PAGE
════════════════════════════════════════════════ */
function DashboardPage({ setPage }) {
  const stats = [
    { label:"Total Blogs",     value:6,     icon:<BookOpen size={16}/>,  gradFrom:"#22d3ee", gradTo:"#67e8f9", glowColor:"#22d3ee", trend:"+2 this month", data:null,       delay:0    },
    { label:"Published Blogs", value:4,     icon:<Globe size={16}/>,     gradFrom:"#34d399", gradTo:"#6ee7b7", glowColor:"#34d399", trend:"+1 this month", data:null,       delay:0.06 },
    { label:"Draft Blogs",     value:2,     icon:<FileText size={16}/>,  gradFrom:"#fbbf24", gradTo:"#fde68a", glowColor:"#fbbf24", trend:"In progress",   data:null,       delay:0.12 },
    { label:"Total Views",     value:38636, icon:<Eye size={16}/>,       gradFrom:"#a78bfa", gradTo:"#c4b5fd", glowColor:"#a78bfa", trend:"+14.2%",        data:CHART_DATA, delay:0.18 },
  ];

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} className="space-y-6">

      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] p-6 sm:p-8"
          style={{ background:"linear-gradient(135deg,rgba(34,211,238,0.07),rgba(124,58,237,0.06),transparent)" }}>
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"/>
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"/>

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <motion.div initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:0.1}}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/8 text-cyan-300 text-xs font-medium" style={{fontFamily:T.ox}}>
                <Sparkles size={10}/> Admin Dashboard
              </motion.div>
              <motion.h1 initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.18}}
                className="text-3xl sm:text-4xl font-black text-white tracking-tight" style={{fontFamily:T.ox}}>
                Good Morning, Keshav<span className="text-cyan-400">.</span>
              </motion.h1>
              <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.26}}
                className="text-white/30 text-sm" style={{fontFamily:T.mono}}>
                @keshav · Writer since 2026 · Admin
              </motion.p>
            </div>
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{delay:0.32}}>
              <GradientBtn onClick={()=>setPage("create")} className="px-6 py-3 text-sm">
                <Plus size={15}/> Create New Blog
              </GradientBtn>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s,i)=><StatCard key={i} {...s}/>)}
      </motion.div>

      <div className="grid xl:grid-cols-[1fr_300px] gap-5">
        <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{delay:0.25}}>
          <GlassCard>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div>
                <h2 className="text-sm font-black text-white" style={{fontFamily:T.ox}}>Recent Blogs</h2>
                <p className="text-white/20 text-[10px] mt-0.5" style={{fontFamily:T.mono}}>{BLOGS.length} total posts</p>
              </div>
              <button onClick={()=>setPage("manage")}
                className="flex items-center gap-1.5 text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors border border-cyan-400/20 hover:border-cyan-400/40 px-3 py-1.5 rounded-lg"
                style={{fontFamily:T.ox}}>
                Manage all <ChevronRight size={11}/>
              </button>
            </div>
            <div className="p-4 space-y-1.5">
              {BLOGS.map((b,i)=>(
                <motion.div key={b._id} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:0.3+i*0.06}}
                  className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/[0.07] transition-all cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/75 text-xs font-medium truncate group-hover:text-white transition-colors" style={{fontFamily:T.ox}}>{b.title}</p>
                    <p className="text-white/20 text-[10px] mt-0.5" style={{fontFamily:T.mono}}>{"General"} · {new Date(b.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge status={b.isPublished ? "published" : "draft"}/>
                  {b.isPublished ? "published" : "draft"==="published" && (
                    <span className="text-white/25 text-[10px] flex items-center gap-1 flex-shrink-0" style={{fontFamily:T.mono}}>
                      <Eye size={9}/>{(b.views/1000).toFixed(1)}K
                    </span>
                  )}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button className="w-6 h-6 rounded-lg bg-white/[0.05] hover:bg-cyan-400/10 hover:text-cyan-400 text-white/30 flex items-center justify-center transition-all">
                      <Edit3 size={10}/>
                    </button>
                    <button className="w-6 h-6 rounded-lg bg-white/[0.05] hover:bg-red-400/10 hover:text-red-400 text-white/30 flex items-center justify-center transition-all">
                      <Trash2 size={10}/>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <div className="space-y-4">
          <motion.div variants={fadeLeft} initial="hidden" animate="show" transition={{delay:0.3}}>
            <GlassCard className="p-5">
              <h2 className="text-sm font-black text-white mb-4" style={{fontFamily:T.ox}}>Quick Actions</h2>
              <div className="space-y-2.5">
                {[
                  { icon:<PenLine size={14}/>,    label:"Create Blog",     desc:"Start writing",       grad:"from-cyan-500 to-violet-500", action:()=>setPage("create") },
                  { icon:<BarChart3 size={14}/>,   label:"View Analytics",  desc:"See performance",     grad:"from-violet-500 to-pink-500", action:()=>setPage("analytics") },
                  { icon:<Send size={14}/>,        label:"Publish Drafts",  desc:"2 drafts pending",    grad:"from-amber-500 to-orange-500",action:()=>setPage("manage") },
                ].map((a,i)=>(
                  <motion.button key={i} onClick={a.action} whileHover={{x:4,scale:1.01}} whileTap={{scale:0.98}}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all text-left group">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${a.grad} flex items-center justify-center text-white flex-shrink-0 shadow-md`}>{a.icon}</div>
                    <div>
                      <p className="text-white/75 text-xs font-semibold group-hover:text-white transition-colors" style={{fontFamily:T.ox}}>{a.label}</p>
                      <p className="text-white/25 text-[10px]" style={{fontFamily:T.mono}}>{a.desc}</p>
                    </div>
                    <ArrowRight size={12} className="ml-auto text-white/15 group-hover:text-white/40 transition-colors"/>
                  </motion.button>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeLeft} initial="hidden" animate="show" transition={{delay:0.38}}>
            <GlassCard className="overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <h2 className="text-sm font-black text-white" style={{fontFamily:T.ox}}>Activity</h2>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400" style={{fontFamily:T.mono}}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>Live
                </div>
              </div>
              <div className="p-4 space-y-2">
                {ACTIVITY.map((a,i)=>(
                  <motion.div key={i} initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{delay:0.4+i*0.07}}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer group">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border flex-shrink-0 ${a.color}`}>{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/60 text-[11px] group-hover:text-white/80 transition-colors leading-snug" style={{fontFamily:T.mono}}>{a.text}</p>
                    </div>
                    <span className="text-white/20 text-[9px] flex-shrink-0 mt-0.5" style={{fontFamily:T.mono}}>{a.time}</span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════
   HELPERS — outside all components
════════════════════════════════════════════════ */
const toSlug = v => v.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-semibold text-white/30 tracking-widest uppercase" style={{fontFamily:T.ox}}>
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
function CreateBlogPage() {
  const [title,    setTitle]   = useState("");
  const [slug,     setSlug]    = useState("");
  const [excerpt,  setExcerpt] = useState("");
  const [content,  setContent] = useState("");
  const [category, setCategory]= useState("Technology");
  const [tags,     setTags]    = useState("");
  const [pub,      setPub]     = useState(false);
  const [saving,   setSaving]  = useState(false);
  const [saved,    setSaved]   = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  useEffect(()=>{ setSlug(toSlug(title)); },[title]);

  const handleSave = async (publish = false) => {
    try {
      setSaving(true);
      const res = await api.post("/blogs", {
        title, excerpt, content, isPublished: publish
      });
      console.log("BLOG CREATED:", res.data);
      setSaved(true);
      setTimeout(()=>setSaved(false), 3000);
      if (publish) setPub(true);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to create blog");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.05] transition-all";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white" style={{fontFamily:T.ox}}>Create New Blog<span className="text-cyan-400">.</span></h1>
          <p className="text-white/25 text-xs mt-1" style={{fontFamily:T.mono}}>Draft autosaves every 30 seconds</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-emerald-400 text-xs border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 rounded-xl" style={{fontFamily:T.mono}}>
            <CheckCircle2 size={12}/> Saved successfully
          </div>
        )}
      </div>

      <div className="grid xl:grid-cols-[1fr_280px] gap-5">
        {/* Main editor — plain div, no motion */}
        <div className="space-y-4">
          <GlassCard className="p-6 space-y-5">

            <Field label="Blog Title">
              {/* <input
                value={title}
                onChange={e=>setTitle(e.target.value)}
                placeholder="Write a compelling title…"
                className={`${inputCls} text-lg font-bold`}
                style={{fontFamily:T.ox}}
              /> */}
              <input
  value={title}
  onChange={(e) => {
    console.log("typing", e.target.value);
    setTitle(e.target.value);
  }}
  className={`${inputCls} text-lg font-bold`}
/>
            </Field>

            <Field label="URL Slug">
              <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-white/[0.08] focus-within:border-cyan-400/50 transition-all">
                <span className="px-3 py-3 text-xs text-white/20 bg-white/[0.03] border-r border-white/[0.08] flex-shrink-0 flex items-center gap-1.5" style={{fontFamily:T.mono}}>
                  <Hash size={11}/> quill.io/blog/
                </span>
                <input value={slug} onChange={e=>setSlug(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-cyan-400/80 placeholder-white/15 focus:outline-none" style={{fontFamily:T.mono}}/>
                <button onClick={()=>navigator.clipboard?.writeText(`quill.io/blog/${slug}`)}
                  className="px-3 text-white/20 hover:text-white/60 transition-colors">
                  <Copy size={13}/>
                </button>
              </div>
            </Field>

            <Field label="Excerpt / Meta Description">
              <textarea value={excerpt} onChange={e=>setExcerpt(e.target.value)} rows={2}
                placeholder="A short summary shown in search results and blog cards…"
                className={`${inputCls} resize-none`} style={{fontFamily:T.mono}}/>
              <p className="text-right text-white/15 text-[9px]" style={{fontFamily:T.mono}}>{excerpt.length}/160 chars</p>
            </Field>

            <Field label="Content">
              <div className="flex items-center gap-1 flex-wrap mb-2 p-2 bg-white/[0.03] border border-white/[0.07] rounded-t-xl border-b-0">
                {[["B","font-bold"],["I","italic"],["U","underline"]].map(([l,cls])=>(
                  <button key={l} className={`w-7 h-7 rounded-md text-white/40 hover:text-white hover:bg-white/[0.07] text-xs transition-all ${cls}`} style={{fontFamily:T.ox}}>{l}</button>
                ))}
                <div className="w-px h-4 bg-white/[0.08] mx-1"/>
                {[
                  { icon:<Hash size={11}/>,        title:"Heading" },
                  { icon:<AlignLeft size={11}/>,    title:"Align"   },
                  { icon:<Layers size={11}/>,       title:"List"    },
                  { icon:<ExternalLink size={11}/>, title:"Link"    },
                ].map((t,i)=>(
                  <button key={i} title={t.title}
                    className="w-7 h-7 rounded-md text-white/30 hover:text-white hover:bg-white/[0.07] flex items-center justify-center transition-all">
                    {t.icon}
                  </button>
                ))}
                <div className="ml-auto text-white/15 text-[9px] pr-1" style={{fontFamily:T.mono}}>
                  {content.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>
              <textarea value={content} onChange={e=>setContent(e.target.value)} rows={16}
                placeholder="Start writing your blog post here…&#10;&#10;Use markdown formatting:&#10;# Heading 1&#10;## Heading 2&#10;**bold**, *italic*, `code`&#10;&#10;> Blockquote"
                className="w-full bg-white/[0.025] border border-white/[0.07] rounded-b-xl px-5 py-4 text-sm text-white/80 placeholder-white/10 focus:outline-none focus:border-cyan-400/40 transition-all resize-none leading-relaxed"
                style={{fontFamily:T.mono}}/>
            </Field>

          </GlassCard>
        </div>

        {/* Sidebar — plain div, no motion */}
        <div className="space-y-4">

          <GlassCard className="p-5 space-y-4">
            <h3 className="text-xs font-black text-white" style={{fontFamily:T.ox}}>Publish Settings</h3>

            <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <div>
                <p className="text-white/70 text-xs font-semibold" style={{fontFamily:T.ox}}>Status</p>
                <p className="text-white/25 text-[10px]" style={{fontFamily:T.mono}}>{pub?"Live on site":"Draft"}</p>
              </div>
              <motion.button onClick={()=>setPub(!pub)} whileTap={{scale:0.95}}
                className={`relative w-11 h-6 rounded-full border transition-all duration-300 ${pub?"bg-cyan-500/20 border-cyan-400/40":"bg-white/[0.05] border-white/10"}`}>
                <motion.div animate={{ x: pub ? 20 : 2 }} transition={{ type:"spring", stiffness:500, damping:30 }}
                  className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md ${pub?"bg-gradient-to-br from-cyan-400 to-violet-500":"bg-white/30"}`}/>
              </motion.button>
            </div>

            <div className="space-y-2.5">
              <motion.button onClick={()=>handleSave(false)} disabled={saving}
                whileHover={{scale:1.01}} whileTap={{scale:0.97}}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-bold transition-all disabled:opacity-50"
                style={{fontFamily:T.ox}}>
                {saving ? <><RefreshCw size={12} className="animate-spin"/>Saving…</> : <><Save size={12}/>Save Draft</>}
              </motion.button>
              <GradientBtn onClick={()=>handleSave(true)} className="w-full py-3 text-xs">
                <Send size={12}/> Publish Blog
              </GradientBtn>
            </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-3">
            <h3 className="text-xs font-black text-white" style={{fontFamily:T.ox}}>Category</h3>
            <div className="relative">
              <select value={category} onChange={e=>setCategory(e.target.value)}
                className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 focus:outline-none focus:border-cyan-400/40 transition-all cursor-pointer"
                style={{fontFamily:T.mono}}>
                {["Technology","Design","Dev","Lifestyle","Business","Opinion"].map(c=>(
                  <option key={c} value={c} style={{background:"#050816"}}>{c}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"/>
            </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-3">
            <h3 className="text-xs font-black text-white" style={{fontFamily:T.ox}}>Tags</h3>
            <input value={tags} onChange={e=>setTags(e.target.value)}
              placeholder="react, node.js, tutorial"
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-xs text-white/70 placeholder-white/15 focus:outline-none focus:border-cyan-400/40 transition-all"
              style={{fontFamily:T.mono}}/>
            {tags && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.split(",").map(t=>t.trim()).filter(Boolean).map((t,i)=>(
                  <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] border border-cyan-400/20 text-cyan-400/70 bg-cyan-400/8" style={{fontFamily:T.ox}}>{t}</span>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={12} className="text-amber-400"/>
              <h3 className="text-xs font-black text-white" style={{fontFamily:T.ox}}>Writing Tips</h3>
            </div>
            <ul className="space-y-2">
              {["Aim for 1,000+ words for better SEO","Add 3-5 relevant tags","Use a compelling excerpt","Include a clear call to action"].map((tip,i)=>(
                <li key={i} className="flex items-start gap-2 text-[10px] text-white/30" style={{fontFamily:T.mono}}>
                  <div className="w-1 h-1 rounded-full bg-cyan-400/40 mt-1.5 flex-shrink-0"/>
                  {tip}
                </li>
              ))}
            </ul>
          </GlassCard>

        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MANAGE BLOGS PAGE
════════════════════════════════════════════════ */
function ManageBlogsPage() {

  const [blogs, setBlogs]       = useState([]);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [selected, setSelected] = useState([]);


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
    b =>
      filter === "all" ||
      (filter === "published" && b.isPublished) ||
      (filter === "draft" && !b.isPublished)
  )
  .filter(
    b =>
      b.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = id => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);
  const toggleAll    = () => setSelected(s => s.length===filtered.length ? [] : filtered.map(b=>b._id));
const deleteB = async (id) => {
  try {

    await api.delete(`/blogs/${id}`);

    setBlogs(b =>
      b.filter(x => x._id !== id)
    );

    setOpenMenu(null);

  } catch (error) {

    console.error(error);
    alert("Failed to delete blog");

  }
};

const startEdit = (blog) => {

  setEditingBlog(blog);

  setTitle(blog.title);
  setExcerpt(blog.excerpt);
  setContent(blog.content);
  setPublished(blog.isPublished);

  setCurrentPage("create");
};

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} className="space-y-5">

      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white" style={{fontFamily:T.ox}}>Manage Blogs<span className="text-cyan-400">.</span></h1>
            <p className="text-white/25 text-xs mt-1" style={{fontFamily:T.mono}}>{blogs.length} total · {blogs.filter(b=>b.isPublished).length} published · {blogs.filter(b=>!b.isPublished).length} drafts</p>
          </div>
          <GradientBtn className="self-start text-xs px-4 py-2.5"><Plus size={13}/> New Blog</GradientBtn>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{delay:0.08}}>
        <GlassCard className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 flex-shrink-0">
              {["all","published","draft"].map(f=>(
                <motion.button key={f} onClick={()=>setFilter(f)} whileTap={{scale:0.95}}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
                    filter===f
                      ?"bg-gradient-to-r from-cyan-500/20 to-violet-500/15 border border-cyan-500/25 text-white"
                      :"text-white/30 hover:text-white/60"
                  }`} style={{fontFamily:T.ox}}>
                  {f} {f!=="all"&&`(${blogs.filter(
  b =>
    (f === "published" && b.isPublished) ||
    (f === "draft" && !b.isPublished)
).length})`}
                </motion.button>
              ))}
            </div>

            <div className="relative flex-1">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title or category…"
                className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/15 focus:outline-none focus:border-cyan-400/40 transition-all" style={{fontFamily:T.mono}}/>
            </div>

            {selected.length>0 && (
              <motion.button initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-400/30 bg-red-400/8 text-red-400 text-xs font-semibold transition-all hover:bg-red-400/15"
                style={{fontFamily:T.ox}}>
                <Trash2 size={12}/> Delete ({selected.length})
              </motion.button>
            )}
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={fadeUp} initial="hidden" animate="show" transition={{delay:0.14}}>
        <GlassCard className="overflow-hidden">
          <div className="grid grid-cols-[24px_1fr_100px_80px_100px_100px_100px] gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] max-lg:hidden">
            <input type="checkbox" checked={selected.length===filtered.length&&filtered.length>0}
              onChange={toggleAll} className="w-4 h-4 rounded accent-cyan-400 mt-0.5"/>
            {["Title","Status","Views","Created","Updated","Actions"].map(h=>(
              <div key={h} className="flex items-center gap-1.5 text-[10px] font-semibold text-white/25 uppercase tracking-wider cursor-pointer hover:text-white/50 transition-colors" style={{fontFamily:T.ox}}>
                {h} {["Title","Views","Created"].includes(h) && <SortAsc size={9} className="opacity-50"/>}
              </div>
            ))}
          </div>

          <div className="divide-y divide-white/[0.04]">
            <AnimatePresence>
              {filtered.map((b,i)=>(
                <motion.div key={b._id}
                  initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,x:-20}}
                  transition={{delay:i*0.05}}
                  className="group hover:bg-white/[0.02] transition-all">

                  <div className="hidden lg:grid grid-cols-[24px_1fr_100px_80px_100px_100px_100px] gap-3 px-4 py-4 items-center">
                    <input type="checkbox" checked={selected.includes(b._id)} onChange={()=>toggleSelect(b._id)}
                      className="w-4 h-4 rounded accent-cyan-400"/>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-white/[0.07] flex items-center justify-center text-base flex-shrink-0">
                        {b.isPublished ? "⚡":"📝"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white/80 text-xs font-semibold truncate group-hover:text-white transition-colors" style={{fontFamily:T.ox}}>{b.title}</p>
                        <p className="text-white/20 text-[10px]" style={{fontFamily:T.mono}}>{"General"}</p>
                      </div>
                    </div>
                    <Badge status={b.isPublished ? "published" : "draft"}/>
                    <span className="text-white/50 text-xs flex items-center gap-1" style={{fontFamily:T.mono}}>
                      <Eye size={9} className="text-violet-400"/>{b.isPublished?(b.views>=1000?`${(b.views/1000).toFixed(1)}K`:b.views):"—"}
                    </span>
                    <span className="text-white/30 text-[10px]" style={{fontFamily:T.mono}}>{new Date(b.createdAt).toLocaleDateString()}</span>
                    <span className="text-white/30 text-[10px]" style={{fontFamily:T.mono}}>{new Date(b.updatedAt).toLocaleDateString()}</span>
                    <div className="relative">
                      <div className="flex items-center gap-1">
                        {[
                          { icon:<Edit3 size={11}/>,       title:"Edit",    cls:"hover:text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400/20", action:()=>startEdit(b) },
                          
                          { icon:<Trash2 size={11}/>,       title:"Delete",  cls:"hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20", action:()=>deleteB(b._id) },
                        ].map((a,j)=>(
                          <motion.button key={j} title={a.title} onClick={a.action} whileHover={{scale:1.1}} whileTap={{scale:0.9}}
                            className={`w-7 h-7 rounded-lg border border-white/[0.06] bg-white/[0.03] flex items-center justify-center text-white/25 transition-all ${a.cls}`}>
                            {a.icon}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:hidden p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/[0.07] flex items-center justify-center text-xl flex-shrink-0">
                      {b.isPublished ?"⚡":"📝"}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-white/80 text-sm font-semibold" style={{fontFamily:T.ox}}>{b.title}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge status={b.isPublished ? "published" : "draft"}/>
                        <span className="text-white/30 text-[10px]" style={{fontFamily:T.mono}}>{"General"}</span>
                        {b.isPublished && (
  <span
    className="text-violet-400 text-[10px] flex items-center gap-1"
    style={{fontFamily:T.mono}}
  >
    <Eye size={9}/>
    {b.views >= 1000
      ? `${(b.views / 1000).toFixed(1)}K`
      : b.views}
  </span>
)}
                      </div>
                      <div className="flex items-center gap-2">
                        {[{i:<Edit3 size={11}/>,c:"text-cyan-400"},{i:<ExternalLink size={11}/>,c:"text-violet-400"},{i:<Trash2 size={11}/>,c:"text-red-400",fn:()=>deleteB(b._id)}].map((a,j)=>(
                          <button key={j} onClick={a.fn} className={`w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.04] flex items-center justify-center ${a.c} transition-all`}>{a.i}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length===0 && (
            <div className="py-16 text-center">
              <FileText size={32} className="text-white/10 mx-auto mb-3"/>
              <p className="text-white/20 text-sm" style={{fontFamily:T.mono}}>No blogs match your filter</p>
            </div>
          )}

          {filtered.length>0 && (
            <div className="flex items-center justify-between px-4 py-3.5 border-t border-white/[0.06] bg-white/[0.01]">
              <p className="text-white/20 text-[10px]" style={{fontFamily:T.mono}}>
                Showing {filtered.length} of {blogs.length} blogs
              </p>
              <div className="flex items-center gap-1">
                {[1,2,3].map(p=>(
                  <button key={p} className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${p===1?"bg-cyan-500/15 border border-cyan-500/25 text-cyan-400":"text-white/30 hover:text-white/60 hover:bg-white/[0.05]"}`} style={{fontFamily:T.ox}}>{p}</button>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════
   PLACEHOLDER PAGES
════════════════════════════════════════════════ */
function PlaceholderPage({ title, icon, desc }) {
  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-violet-500/15 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
        {icon}
      </div>
      <h2 className="text-2xl font-black text-white mb-2" style={{fontFamily:T.ox}}>{title}<span className="text-cyan-400">.</span></h2>
      <p className="text-white/25 text-sm max-w-xs" style={{fontFamily:T.mono}}>{desc}</p>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════
   ROOT
════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user,    setUser]    = useState(null);

  useEffect(() => {
    api.get("/users/current-user")
      .then((res) => {
        const currentUser = res.data.data;
        if (currentUser.role !== "admin") { navigate("/dashboard"); return; }
        setUser(currentUser);
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const [page,     setPage]    = useState("dashboard");
  const [sideOpen, setSideOpen]= useState(false);

  useEffect(()=>{
    const check = () => { if(window.innerWidth>=1024) setSideOpen(true); else setSideOpen(false); };
    check();
    window.addEventListener("resize", check);
    return ()=>window.removeEventListener("resize", check);
  },[]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen" style={{backgroundColor:T.bg, fontFamily:T.mono}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:99px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(34,211,238,0.3)}
        input:-webkit-autofill,input:-webkit-autofill:focus{
          -webkit-box-shadow:0 0 0 1000px #070a18 inset!important;
          -webkit-text-fill-color:white!important
        }
        select option{background:#050816;color:white}
      `}</style>

      <Background/>
      <Sidebar page={page} setPage={setPage} open={sideOpen} setOpen={setSideOpen}/>
      <Topbar setOpen={setSideOpen} setPage={setPage}/>

      <main className="relative z-10 lg:pl-[220px] pt-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          {page === "dashboard" && <DashboardPage setPage={setPage}/>}
          {page === "manage"    && <ManageBlogsPage />}
          {page === "analytics" && <PlaceholderPage title="Analytics" icon={<BarChart3 size={24}/>} desc="Detailed performance charts coming soon."/>}
          {page === "settings"  && <PlaceholderPage title="Settings"  icon={<Settings size={24}/>}  desc="Profile and account settings coming soon."/>}

          {/* Always mounted so state is never lost, hidden when not active */}
          <div style={{ display: page === "create" ? "block" : "none" }}>
            <CreateBlogPage />
          </div>

        </div>
      </main>

      <motion.button
        whileHover={{scale:1.05}} whileTap={{scale:0.95}}
        onClick={()=>setPage("create")}
        className="fixed bottom-6 right-6 lg:hidden flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white z-30 shadow-2xl shadow-cyan-500/30"
        style={{background:"linear-gradient(135deg,#22d3ee 0%,#7c3aed 100%)", fontFamily:T.ox}}>
        <Plus size={16}/> New Blog
      </motion.button>
    </div>
  );
}