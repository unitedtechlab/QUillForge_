import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Eye, Heart, Bookmark, Share2, ArrowLeft, Clock, Calendar, 
  User, Check, Copy, ChevronRight, BookOpen, AlertCircle
} from "lucide-react";
import DOMPurify from "dompurify";
import api from "../api/axios";

/* ─────────────────────────────────────────────
   DESIGN CONSTANTS & SUB-COMPONENTS
───────────────────────────────────────────── */
const ACCENT = { 
  ox: "'Oxanium',sans-serif", 
  mono: "'Space Mono',monospace" 
};

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

function Badge({ children, color = "cyan" }) {
  const colors = {
    cyan: "border-cyan-400/30 text-cyan-300 bg-cyan-400/10",
    violet: "border-violet-400/30 text-violet-300 bg-violet-400/10",
    pink: "border-pink-400/30 text-pink-300 bg-pink-400/10",
    green: "border-emerald-400/30 text-emerald-300 bg-emerald-400/10",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border tracking-wide ${colors[color] || colors.cyan}`}>
      {children}
    </span>
  );
}

function Button({ children, variant = "primary", className = "", onClick }) {
  const base = "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer select-none border";
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-violet-500 border-transparent text-white hover:shadow-[0_0_32px_rgba(34,211,238,0.35)] hover:scale-[1.02] active:scale-[0.98]",
    secondary: "border-white/10 text-white/80 hover:border-white/30 hover:text-white hover:bg-white/[0.05] backdrop-blur-sm",
    ghost: "border-transparent text-white/60 hover:text-white hover:bg-white/[0.05] px-4",
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────
   BACKGROUND ACCENTS
───────────────────────────────────────────── */
function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Grid lines */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px)`,
        backgroundSize: "72px 72px",
      }} />
      {/* Dynamic glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[130px]" />
      <div className="absolute top-1/3 left-[-100px] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-pink-600/4 rounded-full blur-[110px]" />
      
      {/* Noise grain */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px",
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOADING SKELETON
───────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 space-y-8 animate-pulse relative z-10">
      <div className="space-y-4">
        <div className="h-6 w-24 bg-white/10 rounded-full" />
        <div className="h-12 w-3/4 bg-white/10 rounded-xl" />
        <div className="flex items-center gap-4 pt-2">
          <div className="w-10 h-10 rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-3 w-24 bg-white/10 rounded" />
          </div>
        </div>
      </div>
      
      <div className="h-[400px] w-full bg-white/5 rounded-2xl border border-white/[0.06]" />

      <div className="space-y-6 max-w-3xl mx-auto pt-6">
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-5/6 bg-white/10 rounded" />
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-2/3 bg-white/10 rounded" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState({
  _id: "1",
  title: "Building Scalable APIs with Node.js",
  category: "Technology",
  views: 2450,
  likes: 324,
  coverImage:
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
  createdAt: new Date(),
  author: {
    username: "Keshav",
    role: "admin"
  },
  content: `
    <h2>Introduction</h2>

    <p>
    QuillForge is a modern blogging platform built using React,
    Node.js, Express and MongoDB.
    </p>

    <p>
    This page demonstrates how a complete blog reading experience
    will look once APIs are connected.
    </p>

    <blockquote>
    Good architecture scales. Bad architecture survives.
    </blockquote>

    <h2>Conclusion</h2>

    <p>
    This blog page is now connected to the QuillForge UI.
    </p>
  `
});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
const [relatedBlogs] = useState([
  {
    _id: "2",
    title: "Mastering React Router",
    category: "Technology",
    views: 1200
  },
  {
    _id: "3",
    title: "Building Admin Dashboards",
    category: "Development",
    views: 3200
  },
  {
    _id: "4",
    title: "Deploying MERN Apps on AWS",
    category: "Cloud",
    views: 4500
  }
]);

  // Local interaction state (UI only)
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // View Count API
  const incrementView = async () => {
    try {
      await api.patch(`/blogs/${id}/view`);
    } catch (err) {
      console.error(err);
    }
  };

  // useEffect(() => {
  //   incrementView();
  // }, [id]);

  // // Fetch blog details
  // useEffect(() => {
  //   const fetchBlog = async () => {
  //     setLoading(true);
  //     setError(false);
  //     try {
  //       const res = await api.get(`/blogs/${id}`);
  //       const blogData = res.data?.data;
  //       if (blogData) {
  //         setBlog(blogData);
  //         setLikeCount(blogData.likes || 0);
          
  //         // Fetch related blogs from category or list
  //         try {
  //           const listRes = await api.get("/blogs");
  //           const allBlogs = listRes.data?.data || [];
            
  //           // Filter out current blog and keep published only
  //           const filtered = allBlogs
  //             .filter(b => b._id !== blogData._id)
  //             .filter(b => b.status === "published" || !b.status);
            
  //           const categoryMatch = filtered.filter(b => b.category === blogData.category);
  //           const remaining = filtered.filter(b => b.category !== blogData.category);
            
  //           const related = [...categoryMatch, ...remaining].slice(0, 3);
  //           setRelatedBlogs(related);
  //         } catch (err) {
  //           console.error("Error fetching related blogs:", err);
  //           setRelatedBlogs([]);
  //         }
  //       } else {
  //         setError(true);
  //       }
  //     } catch (err) {
  //       console.error(err);
  //       setError(true);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchBlog();
  //   // Reset interaction states on ID change
  //   setLiked(false);
  //   setBookmarked(false);
  //   setCopied(false);
  // }, [id]);

  // Scroll progress handler
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  // Safe Category color helper
  const getCategoryColor = (cat) => {
    const lower = String(cat || "").toLowerCase();
    if (lower.includes("tech") || lower.includes("api")) return "cyan";
    if (lower.includes("design") || lower.includes("ui")) return "pink";
    if (lower.includes("dev") || lower.includes("code")) return "violet";
    return "green";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b14] text-white relative overflow-hidden">
        <Background />
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-[#080b14] text-white flex flex-col items-center justify-center relative p-6">
        <Background />
        <GlassCard hover={false} className="max-w-md w-full p-8 text-center border-red-500/20 bg-red-500/[0.02] relative z-10">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: ACCENT.ox }}>Blog not found</h2>
          <p className="text-white/40 mb-6 text-sm" style={{ fontFamily: ACCENT.mono }}>
            The article you are looking for might have been removed or is temporarily unavailable.
          </p>
          <Button variant="primary" onClick={() => navigate("/")} className="w-full justify-center">
            <ArrowLeft size={16} /> Return Home
          </Button>
        </GlassCard>
      </div>
    );
  }

  // Cover image fallback
  const coverImage = blog.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80";

  // Auto calculate read time
  const readTime = Math.max(
    1,
    Math.ceil(
      String(blog.content || "")
        .replace(/<[^>]*>/g, "")
        .split(/\s+/).length / 200
    )
  );

  return (
    <div className="min-h-screen bg-[#080b14] text-white relative font-sans selection:bg-cyan-500/30">
      {/* Scroll Progress Indicator */}
      <div 
        className="fixed top-0 left-0 h-[4px] bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 z-50 transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');
        
        .blog-content h1, .blog-content h2, .blog-content h3 {
          font-family: ${ACCENT.ox};
          color: #ffffff;
          margin-top: 1.8em;
          margin-bottom: 0.6em;
          font-weight: 700;
        }
        .blog-content h1 { font-size: 2.25rem; line-height: 1.25; }
        .blog-content h2 { font-size: 1.8rem; line-height: 1.3; }
        .blog-content h3 { font-size: 1.4rem; line-height: 1.4; }
        
        .blog-content p {
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 1.6em;
          line-height: 1.9;
          font-size: 1.125rem; /* 18px */
        }
        
        .blog-content blockquote {
          border-left: 4px solid #22d3ee;
          background: rgba(34, 211, 238, 0.04);
          padding: 1.25rem 1.75rem;
          margin: 2rem 0;
          border-radius: 0 1rem 1rem 0;
          font-style: italic;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .blog-content pre {
          background: #0d1220;
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 1.25rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 2rem 0;
          font-family: ${ACCENT.mono};
          font-size: 0.9rem;
          color: #e2e8f0;
        }
        
        .blog-content code {
          background: rgba(255, 255, 255, 0.08);
          padding: 0.2rem 0.45rem;
          border-radius: 0.25rem;
          font-family: ${ACCENT.mono};
          font-size: 0.9em;
        }
        
        .blog-content pre code {
          background: transparent;
          padding: 0;
          border-radius: 0;
        }
        
        .blog-content ul, .blog-content ol {
          margin-bottom: 1.6em;
          padding-left: 1.75rem;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.8;
          font-size: 1.125rem;
        }
        .blog-content ul { list-style-type: disc; }
        .blog-content ol { list-style-type: decimal; }
        .blog-content li { margin-bottom: 0.6em; }
      `}</style>

      <Background />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        {/* Navigation & Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors py-2"
          >
            <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: ACCENT.mono }}>Back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12">
          
          {/* Main Column */}
          <article className="min-w-0">
            {/* Category badge */}
            <div className="mb-4">
              <Badge color={getCategoryColor(blog.category)}>
                {blog.category || "General"}
              </Badge>
            </div>

            {/* Blog Title */}
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6"
              style={{ fontFamily: ACCENT.ox }}
            >
              {blog.title}
            </h1>

            {/* Author / Date / Stats Meta row */}
            <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-white/[0.06] mb-8">
              <div className="flex items-center gap-3">
                {/* Author Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-sm font-black text-white border border-white/[0.08]">
                  {blog.author?.username?.slice(0, 2).toUpperCase() || <User size={14} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white" style={{ fontFamily: ACCENT.ox }}>
                    {blog.author?.username || "Anonymous Author"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-white/30" style={{ fontFamily: ACCENT.mono }}>
                    <Calendar size={12} />
                    <span>{blog.createdAt ? new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "June 2026"}</span>
                    <span>•</span>
                    <Clock size={12} />
                    <span>{readTime} min read</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-white/35" style={{ fontFamily: ACCENT.mono }}>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <Eye size={13} className="text-cyan-400" />
                  <span>{blog.views >= 1000 ? `${(blog.views / 1000).toFixed(1)}k` : blog.views || 0} Views</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <Heart size={13} className="text-pink-400" />
                  <span>{likeCount} Likes</span>
                </span>
              </div>
            </div>

            {/* Cover Image banner */}
            <div className="relative w-full h-[250px] sm:h-[380px] md:h-[450px] rounded-3xl overflow-hidden border border-white/[0.08] mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <img 
                src={coverImage} 
                alt={blog.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080b14]/50 to-transparent" />
            </div>

            {/* Content Container (DOMPurify Sanitized HTML) */}
            <div className="blog-content max-w-[800px] mx-auto">
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content || "") }} />
            </div>

            {/* Engagement buttons bottom */}
            <div className="flex items-center justify-center gap-4 py-8 border-y border-white/[0.06] my-12 max-w-[800px] mx-auto">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                  liked 
                    ? "bg-pink-500/10 border-pink-500/30 text-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.15)]" 
                    : "bg-white/[0.02] border-white/[0.08] text-white/75 hover:border-pink-500/30 hover:text-pink-400"
                }`}
              >
                <Heart size={16} className={liked ? "fill-pink-400" : ""} />
                <span>{liked ? "Liked" : "Like Article"}</span>
              </button>

              <button 
                onClick={() => setBookmarked(!bookmarked)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                  bookmarked 
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]" 
                    : "bg-white/[0.02] border-white/[0.08] text-white/75 hover:border-cyan-500/30 hover:text-cyan-400"
                }`}
              >
                <Bookmark size={16} className={bookmarked ? "fill-cyan-400" : ""} />
                <span>{bookmarked ? "Bookmarked" : "Bookmark"}</span>
              </button>

              <button 
                onClick={handleCopyUrl}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-semibold transition-all duration-300 ${
                  copied 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                    : "bg-white/[0.02] border-white/[0.08] text-white/75 hover:border-emerald-500/30 hover:text-emerald-400"
                }`}
              >
                {copied ? <Check size={16} /> : <Share2 size={16} />}
                <span>{copied ? "Link Copied" : "Share URL"}</span>
              </button>
            </div>

            {/* Author Bio Card */}
            <div className="max-w-[800px] mx-auto mt-12 mb-16">
              <h3 className="text-xs font-bold text-white/35 uppercase tracking-wider mb-4" style={{ fontFamily: ACCENT.mono }}>
                Written by
              </h3>
              <GlassCard hover={false} className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 flex items-center justify-center text-2xl font-black text-white flex-shrink-0 shadow-lg shadow-cyan-500/10">
                  {blog.author?.username?.slice(0, 2).toUpperCase() || <User size={24} />}
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="text-xl font-bold text-white" style={{ fontFamily: ACCENT.ox }}>
                      {blog.author?.username || "Anonymous Author"}
                    </h4>
                    <span className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-wider bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20" style={{ fontFamily: ACCENT.mono }}>
                      {blog.author?.role || "Publisher"}
                    </span>
                  </div>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Author on QuillForge
                  </p>
                  <div className="flex items-center gap-2 text-xs text-white/30" style={{ fontFamily: ACCENT.mono }}>
                    <BookOpen size={12} className="text-violet-400" />
                    <span>QuillForge Contributor</span>
                  </div>
                </div>
              </GlassCard>
            </div>

          </article>

          {/* Sticky Side Share Actions (Desktop only) */}
          <div className="hidden lg:block">
            <div className="sticky top-28 flex flex-col gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl backdrop-blur-md">
              <button 
                onClick={handleLike}
                title="Like Article"
                className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                  liked 
                    ? "bg-pink-500/10 border-pink-500/30 text-pink-400" 
                    : "border-transparent text-white/40 hover:text-pink-400 hover:bg-white/[0.04]"
                }`}
              >
                <Heart size={18} className={liked ? "fill-pink-400" : ""} />
              </button>

              <button 
                onClick={() => setBookmarked(!bookmarked)}
                title="Bookmark"
                className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                  bookmarked 
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" 
                    : "border-transparent text-white/40 hover:text-cyan-400 hover:bg-white/[0.04]"
                }`}
              >
                <Bookmark size={18} className={bookmarked ? "fill-cyan-400" : ""} />
              </button>

              <div className="h-px bg-white/[0.06]" />

              <button 
                onClick={handleCopyUrl}
                title="Copy URL"
                className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 relative group ${
                  copied 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                    : "border-transparent text-white/40 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                
                {/* Tooltip */}
                <div className="absolute right-full mr-3 px-2 py-1 rounded-md bg-slate-900 border border-white/10 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200">
                  {copied ? "Copied!" : "Copy Link"}
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Related Blogs Section */}
        {relatedBlogs.length > 0 && (
          <div className="mt-16 pt-16 border-t border-white/[0.06]">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-xs font-bold text-violet-400 uppercase tracking-widest" style={{ fontFamily: ACCENT.mono }}>
                  Read More
                </span>
                <h3 className="text-3xl font-black text-white mt-1" style={{ fontFamily: ACCENT.ox }}>
                  Related Articles
                </h3>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((item, idx) => {
                const itemCover = item.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80";
                
                return (
                  <Link 
                    key={item._id || idx} 
                    to={`/blog/${item._id}`}
                    className="flex flex-col h-full group"
                  >
                    <GlassCard className="overflow-hidden h-full flex flex-col cursor-pointer border-white/[0.05] hover:border-cyan-400/20">
                      {/* Cover Thumbnail */}
                      <div className="h-40 relative overflow-hidden bg-slate-950 flex-shrink-0">
                        <img 
                          src={itemCover} 
                          alt={item.title} 
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080b14]/90 via-[#080b14]/40 to-transparent" />
                      </div>

                      {/* Content details */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="mb-2">
                          <Badge color={getCategoryColor(item.category)}>
                            {item.category || "General"}
                          </Badge>
                        </div>
                        
                        <h4 
                          className="text-base font-bold text-white leading-snug group-hover:text-cyan-300 transition-colors duration-300 mb-4 line-clamp-2"
                          style={{ fontFamily: ACCENT.ox }}
                        >
                          {item.title}
                        </h4>

                        <div className="mt-auto pt-4 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-white/30" style={{ fontFamily: ACCENT.mono }}>
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            <span>{item.views || 0}</span>
                          </span>
                          <span className="flex items-center gap-1 hover:text-white transition-colors">
                            <span>Read Article</span>
                            <ChevronRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
