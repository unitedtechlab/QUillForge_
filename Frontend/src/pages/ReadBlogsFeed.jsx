import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Eye,
  Heart,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Star
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
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger = { show: { transition: { staggerChildren: 0.1 } } };

/* ════════════════════════════════════════════════
   GLASS CARD CONTAINER
════════════════════════════════════════════════ */
function GlassCard({ children, className = "" }) {
  return (
    <motion.div
      whileHover={{
        borderColor: "rgba(34,211,238,0.2)",
        boxShadow: "0 20px 40px rgba(34,211,238,0.03)"
      }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-md overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════════════
   READ BLOGS FEED PAGE
════════════════════════════════════════════════ */
export default function ReadBlogsFeed({ adminOnly = false }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAdminOnly, setShowAdminOnly] = useState(adminOnly);
  const [likedBlogs, setLikedBlogs] = useState({});
  const [expandedBlogs, setExpandedBlogs] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Sync when parent flips the adminOnly prop (e.g. navigating from Quick Actions)
  useEffect(() => { setShowAdminOnly(adminOnly); }, [adminOnly]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Fetch blogs and current user in parallel
        const [blogsRes, userRes] = await Promise.allSettled([
          api.get("/blogs"),
          api.get("/users/current-user")
        ]);

        let user = null;
        if (userRes.status === "fulfilled") {
          user = userRes.value.data.data;
          setCurrentUser(user);
        }

        if (blogsRes.status === "fulfilled") {
          const published = (blogsRes.value.data.data || []).filter(b => b.isPublished);
          setBlogs(published);

          // Seed liked state from each blog's likes array
          if (user) {
            const initialLiked = {};
            published.forEach(b => {
              initialLiked[b._id] = (b.likes || []).some(
                uid => uid.toString() === user._id.toString()
              );
            });
            setLikedBlogs(initialLiked);
          }
        }
      } catch (error) {
        console.error("Failed to load feed:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  /**
   * Toggles like via API with optimistic UI update and rollback on failure.
   */
  const toggleLike = async (id) => {
    if (!currentUser) return; // must be logged in

    const wasLiked = !!likedBlogs[id];

    // Optimistic update
    setLikedBlogs(prev => ({ ...prev, [id]: !wasLiked }));
    setBlogs(curr => curr.map(b => {
      if (b._id === id) {
        const arr = b.likes || [];
        return {
          ...b,
          likes: wasLiked
            ? arr.filter(uid => uid.toString() !== currentUser._id.toString())
            : [...arr, currentUser._id]
        };
      }
      return b;
    }));

    try {
      const res = await api.patch(`/blogs/${id}/like`);
      // Confirm with server values
      const { likes: newCount, liked: newLiked } = res.data.data;
      setLikedBlogs(prev => ({ ...prev, [id]: newLiked }));
      setBlogs(curr => curr.map(b => {
        if (b._id === id) {
          let newLikesArr = [];
          if (newLiked) {
            newLikesArr = [currentUser._id, ...Array(Math.max(0, newCount - 1)).fill("other_user")];
          } else {
            newLikesArr = Array(newCount).fill("other_user");
          }
          return { ...b, likes: newLikesArr };
        }
        return b;
      }));
    } catch (err) {
      console.error("Like failed:", err);
      // Rollback
      setLikedBlogs(prev => ({ ...prev, [id]: wasLiked }));
      setBlogs(curr => curr.map(b => {
        if (b._id === id) {
          const arr = b.likes || [];
          return {
            ...b,
            likes: wasLiked
              ? [...arr, currentUser._id]
              : arr.filter(uid => uid.toString() !== currentUser._id.toString())
          };
        }
        return b;
      }));
    }
  };

  /**
   * Toggles the inline expansion of the blog content.
   */
  const toggleExpand = (id) => {
    setExpandedBlogs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Extract unique real categories from blogs (exclude the "General" fallback)
  const categories = ["all", ...new Set(
    blogs
      .map(b => b.category)
      .filter(c => c && c.toLowerCase() !== "general")
  )];

  // Filter blogs based on adminOnly toggle, category and search query
  const filteredBlogs = blogs
    .filter(b => !showAdminOnly || b.author?.role === "admin")
    .filter(b => selectedCategory === "all" || (b.category || "General") === selectedCategory)
    .filter(b =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.content && b.content.toLowerCase().includes(search.toLowerCase())) ||
      (b.excerpt && b.excerpt.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
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

      {/* Category Pills + Featured by Admin toggle */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-wrap">
        {/* Featured by Admin pill */}
        <button
          onClick={() => setShowAdminOnly(v => !v)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all duration-300 ${
            showAdminOnly
              ? "bg-gradient-to-r from-amber-500/20 to-orange-500/15 border-amber-400/40 text-amber-300 shadow-sm shadow-amber-500/10"
              : "text-white/30 hover:text-white/60 border-transparent bg-white/[0.02] hover:border-white/10"
          }`}
          style={{ fontFamily: T.ox }}
        >
          <Star size={10} className={showAdminOnly ? "text-amber-400 fill-amber-400" : ""} />
          Featured by Admin
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 flex-shrink-0" />

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

      {/* Main vertical feed */}
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
          className="space-y-8"
        >
          {filteredBlogs.map(blog => {
            const isLiked = !!likedBlogs[blog._id];
            const isExpanded = !!expandedBlogs[blog._id];
            const readTime = Math.max(3, Math.round((blog.content || "").split(/\s+/).length / 200));
            const shouldTruncate = (blog.content || "").length > 450;

            // Content presentation logic
            const renderedContent = isExpanded 
              ? blog.content 
              : shouldTruncate 
                ? `${blog.content.slice(0, 420)}...` 
                : blog.content;

            return (
              <motion.div key={blog._id} variants={fadeUp}>
                <GlassCard className="p-8 space-y-6">
                  {/* Article Metadata Header */}
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <div className="flex items-center gap-3">
                      <span
                        className="px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-400/10 border border-cyan-400/20"
                        style={{ fontFamily: T.ox }}
                      >
                        {blog.category || "General"}
                      </span>
                      <span className="flex items-center gap-1" style={{ fontFamily: T.mono }}>
                        <Calendar size={11} /> {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <span className="flex items-center gap-1" style={{ fontFamily: T.mono }}>
                      <Clock size={11} /> {readTime} min read
                    </span>
                  </div>

                  {/* Title & Author Info */}
                  <div className="space-y-2">
                    <h2
                      className="text-white font-extrabold text-2xl sm:text-3xl leading-tight tracking-tight hover:text-cyan-400 transition-colors"
                      style={{ fontFamily: T.ox }}
                    >
                      {blog.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-[9px] font-black text-white">
                        {blog.author?.username?.slice(0, 2).toUpperCase() || "A"}
                      </div>
                      <span className="text-[11px] font-medium text-white/50" style={{ fontFamily: T.ox }}>
                        by <span className="text-white/80">@{blog.author?.username || "Anonymous"}</span>
                      </span>
                    </div>
                  </div>

                  {/* Excerpt if present */}
                  {blog.excerpt && (
                    <div className="p-4 rounded-xl border-l-2 border-cyan-400/30 bg-cyan-400/[0.02] text-xs leading-relaxed text-cyan-300/80 italic">
                      "{blog.excerpt}"
                    </div>
                  )}

                  {/* Divider */}
                  <div className="h-px bg-white/[0.05]" />

                  {/* Content Block */}
                  <div className="relative">
                    <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-4">
                      {renderedContent}
                    </div>

                    {/* Gradient Fade for Truncated Content */}
                    {shouldTruncate && !isExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#080b14] to-transparent pointer-events-none" />
                    )}
                  </div>

                  {/* Inline Reader Expand / Collapse Toggle */}
                  {shouldTruncate && (
                    <button
                      onClick={() => toggleExpand(blog._id)}
                      className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold hover:text-cyan-300 transition-all border border-cyan-400/20 px-4 py-2 rounded-xl bg-cyan-400/[0.03] hover:bg-cyan-400/[0.08]"
                      style={{ fontFamily: T.ox }}
                    >
                      {isExpanded ? (
                        <>Show Less <ChevronUp size={14} /></>
                      ) : (
                        <>Read Full Article <ChevronDown size={14} /></>
                      )}
                    </button>
                  )}

                  {/* Divider */}
                  <div className="h-px bg-white/[0.05]" />

                  {/* Bottom Stats & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleLike(blog._id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-all ${
                          isLiked ? "text-pink-500 scale-105" : "text-white/30 hover:text-white/50"
                        }`}
                        style={{ fontFamily: T.mono }}
                      >
                        <Heart size={14} className={isLiked ? "fill-pink-500 text-pink-500" : ""} />
                        <span>{(blog.likes || []).length} Likes</span>
                      </button>

                      <span className="text-white/30 text-xs flex items-center gap-1.5" style={{ fontFamily: T.mono }}>
                        <Eye size={14} className="text-violet-400" />
                        <span>{blog.views || 0} Views</span>
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/blog/${blog._id}`)}
                      className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white transition-colors"
                      style={{ fontFamily: T.ox }}
                    >
                      <span>Open Page</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
