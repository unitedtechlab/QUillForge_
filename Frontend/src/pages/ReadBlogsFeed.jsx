import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Eye,
  Heart,
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  X,
  MessageSquare
} from "lucide-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

/* ════════════════════════════════════════════════
   DESIGN TOKENS
════════════════════════════════════════════════ */
const T = {
  ox: "'Oxanium',sans-serif",
  mono: "'Space Mono',monospace",
  bg: "#050816",
};

/* ════════════════════════════════════════════════
   ANIMATION VARIANTS
════════════════════════════════════════════════ */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger = { show: { transition: { staggerChildren: 0.08 } } };

/* ════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════ */
function GlassCard({ children, className = "", onClick, glow = "" }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? {
        y: -4,
        borderColor: "rgba(34,211,238,0.3)",
        boxShadow: "0 12px 30px rgba(34,211,238,0.08)"
      } : {
        borderColor: glow || "rgba(34,211,238,0.25)",
        boxShadow: glow ? `0 0 40px ${glow}18` : "0 0 40px rgba(34,211,238,0.08)"
      }}
      transition={{ duration: 0.25 }}
      className={`relative rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-md overflow-hidden ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════
   READ BLOGS FEED PAGE
════════════════════════════════════════════════ */
export default function ReadBlogsFeed() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [likedBlogs, setLikedBlogs] = useState({});
  const [readingBlog, setReadingBlog] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  /**
   * Fetches all published blogs for reading.
   * 
   * API Call:
   * - Endpoint: GET /blogs (in backend start/routes/blog.routes.js)
   */
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/blogs");
      // Filter out drafts - only show published articles to readers
      const published = (res.data.data || []).filter(b => b.isPublished);
      setBlogs(published);
    } catch (error) {
      console.error("Failed to load feed:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggles the like state of a blog post in the UI.
   * Increments/decrements local count for immediate visual feedback.
   */
  const toggleLike = (id) => {
    setLikedBlogs(prev => {
      const isLiked = !prev[id];
      setBlogs(curr => curr.map(b => {
        if (b._id === id) {
          return {
            ...b,
            likes: (b.likes || 0) + (isLiked ? 1 : -1)
          };
        }
        return b;
      }));
      return { ...prev, [id]: isLiked };
    });
  };

  // Extract unique categories from blogs
  const categories = ["all", ...new Set(blogs.map(b => b.category || "General"))];

  // Filter blogs based on category and search query
  const filteredBlogs = blogs
    .filter(b => selectedCategory === "all" || (b.category || "General") === selectedCategory)
    .filter(b => 
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.excerpt && b.excerpt.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2" style={{ fontFamily: T.ox }}>
            <BookOpen className="text-cyan-400" size={26} /> Read Articles<span className="text-cyan-400">.</span>
          </h1>
          <p className="text-white/20 text-xs mt-1" style={{ fontFamily: T.mono }}>
            Explore the latest knowledge, tutorials, and stories from our community.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/15 focus:outline-none focus:border-cyan-400/40 transition-all"
            style={{ fontFamily: T.mono }}
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap border ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/15 border-cyan-500/25 text-white"
                : "text-white/30 hover:text-white/60 border-transparent bg-white/[0.02]"
            }`}
            style={{ fontFamily: T.ox }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full mx-auto"
          />
          <p className="text-white/20 text-xs tracking-wider uppercase font-semibold" style={{ fontFamily: T.mono }}>
            Loading feed...
          </p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="py-24 text-center border border-white/[0.05] rounded-2xl bg-white/[0.01]">
          <BookOpen size={36} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/20 text-sm" style={{ fontFamily: T.mono }}>
            No published articles matched your search.
          </p>
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredBlogs.map(blog => {
            const isLiked = !!likedBlogs[blog._id];
            return (
              <motion.div key={blog._id} variants={fadeUp}>
                <GlassCard className="h-full flex flex-col p-6 space-y-4 group">
                  {/* Category & Date */}
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-400/10 border border-cyan-400/20"
                      style={{ fontFamily: T.ox }}
                    >
                      {blog.category || "General"}
                    </span>
                    <span className="text-[10px] text-white/25 flex items-center gap-1" style={{ fontFamily: T.mono }}>
                      <Calendar size={10} /> {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  {/* Title & Excerpt */}
                  <div className="space-y-2 flex-1">
                    <h3
                      className="text-white font-bold text-base leading-snug group-hover:text-cyan-400 transition-colors line-clamp-2"
                      style={{ fontFamily: T.ox }}
                    >
                      {blog.title}
                    </h3>
                    <p className="text-white/40 text-xs leading-relaxed line-clamp-3">
                      {blog.excerpt || "No summary provided for this article."}
                    </p>
                  </div>

                  {/* Author Information */}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04]">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-[10px] font-black text-white">
                      {blog.author?.username?.slice(0, 2).toUpperCase() || "A"}
                    </div>
                    <span className="text-[11px] font-medium text-white/50 truncate" style={{ fontFamily: T.ox }}>
                      by {blog.author?.username || "Anonymous"}
                    </span>
                    <span className="ml-auto text-[10px] text-white/20 flex items-center gap-1" style={{ fontFamily: T.mono }}>
                      <Clock size={10} /> {Math.max(3, Math.round((blog.content || "").split(/\s+/).length / 200))} min
                    </span>
                  </div>

                  {/* Actions & Stats */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(blog._id);
                        }}
                        className={`flex items-center gap-1 text-[11px] font-semibold transition-all ${
                          isLiked ? "text-pink-500 scale-105" : "text-white/20 hover:text-white/50"
                        }`}
                        style={{ fontFamily: T.mono }}
                      >
                        <Heart size={12} className={isLiked ? "fill-pink-500 text-pink-500" : ""} />
                        {blog.likes || 0}
                      </button>
                      <span className="text-white/20 text-[11px] flex items-center gap-1" style={{ fontFamily: T.mono }}>
                        <Eye size={12} className="text-violet-400" />
                        {blog.views || 0}
                      </span>
                    </div>

                    <button
                      onClick={() => setReadingBlog(blog)}
                      className="flex items-center gap-1 text-xs text-cyan-400 font-bold hover:text-cyan-300 transition-all"
                      style={{ fontFamily: T.ox }}
                    >
                      Read <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Beautiful Modal Overlay to read articles inline */}
      <AnimatePresence>
        {readingBlog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-3xl max-h-[85vh] bg-[#070a14] border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.01]">
                <span className="text-white/25 text-[10px] uppercase tracking-wider font-semibold" style={{ fontFamily: T.mono }}>
                  Article Reader
                </span>
                <button
                  onClick={() => setReadingBlog(null)}
                  className="p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Article Body */}
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-400/10 border border-cyan-400/20" style={{ fontFamily: T.ox }}>
                      {readingBlog.category || "General"}
                    </span>
                    <span className="text-[10px] text-white/20" style={{ fontFamily: T.mono }}>
                      Published {new Date(readingBlog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-tight" style={{ fontFamily: T.ox }}>
                    {readingBlog.title}
                  </h2>
                  <div className="flex items-center gap-2 pt-2 text-white/40 text-xs">
                    <span className="font-semibold text-white/60">@{readingBlog.author?.username || "anonymous"}</span>
                    <span>·</span>
                    <span>{Math.max(3, Math.round((readingBlog.content || "").split(/\s+/).length / 200))} min read</span>
                  </div>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* Excerpt panel */}
                {readingBlog.excerpt && (
                  <div className="p-4 rounded-xl border border-cyan-500/15 bg-cyan-500/5 text-xs leading-relaxed text-cyan-300/80 italic">
                    "{readingBlog.excerpt}"
                  </div>
                )}

                {/* Main Content */}
                <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-4">
                  {readingBlog.content}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(readingBlog._id)}
                    className={`flex items-center gap-1 text-xs font-semibold transition-all ${
                      likedBlogs[readingBlog._id] ? "text-pink-500" : "text-white/30"
                    }`}
                  >
                    <Heart size={14} className={likedBlogs[readingBlog._id] ? "fill-pink-500 text-pink-500" : ""} />
                    {readingBlog.likes || 0} Likes
                  </button>
                  <span className="text-white/30 text-xs flex items-center gap-1">
                    <Eye size={14} />
                    {readingBlog.views || 0} Views
                  </span>
                </div>
                <button
                  onClick={() => {
                    setReadingBlog(null);
                    navigate(`/blog/${readingBlog._id}`);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] transition-all"
                  style={{ fontFamily: T.ox }}
                >
                  Open Dedicated Page <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
