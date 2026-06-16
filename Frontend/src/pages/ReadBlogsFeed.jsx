import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Heart,
  BookOpen,
  Calendar,
  Clock,
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
  ox: "'VT323', monospace",
  mono: "'Space Mono', monospace",
  pixel: "'Silkscreen', monospace"
};

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
              initialLiked[b._id] = (b.likes || []).some(uid => {
                const idStr = (uid && typeof uid === "object" && uid._id) ? uid._id.toString() : (uid ? uid.toString() : "");
                return idStr === user._id.toString();
              });
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
          <h1 className="text-4xl sm:text-5xl font-black text-retro-accent flex items-center gap-2 uppercase tracking-widest font-heading" style={{ fontFamily: T.ox }}>
            <BookOpen className="text-retro-accent animate-pulse" size={32} /> READ ARTICLES
          </h1>
          <p className="text-retro-text/30 text-xs font-terminal uppercase mt-1" style={{ fontFamily: T.mono }}>
            Explore the latest knowledge, tutorials, and stories from our community.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-retro-text/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH ARTICLES..."
            className="w-full bg-retro-bg border-2 border-retro-border pl-9 pr-4 py-2.5 text-xs text-retro-text placeholder-retro-text/25 focus:outline-none focus:border-retro-accent font-terminal uppercase"
            style={{ fontFamily: T.mono }}
          />
        </div>
      </div>

      {/* Category Pills + Featured by Admin toggle */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none flex-wrap">
        <button
          onClick={() => setShowAdminOnly(v => !v)}
          className={`flex items-center gap-1.5 px-4 py-2 border-2 text-xs font-pixel uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            showAdminOnly
              ? "border-retro-accent bg-[#E8E8C6] text-retro-bg"
              : "text-retro-text/30 hover:text-retro-accent border-retro-border bg-retro-bg"
          }`}
          style={{ fontFamily: T.pixel }}
        >
          <Star size={10} className={showAdminOnly ? "fill-retro-bg text-retro-bg" : ""} />
          FEATURED BY ADMIN
        </button>

        {/* Divider */}
        <div className="w-0.5 h-6 bg-retro-border/20 flex-shrink-0 mx-1" />

        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 border-2 text-xs font-pixel uppercase tracking-wider transition-all cursor-pointer ${
              selectedCategory === cat
                ? "border-retro-accent bg-retro-accent text-retro-bg"
                : "text-retro-text/30 hover:text-retro-accent border-retro-border bg-retro-bg"
            }`}
            style={{ fontFamily: T.pixel }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main vertical feed */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-retro-accent/20 border-t-retro-accent rounded-full mx-auto animate-spin" />
          <p className="text-retro-text/30 text-xs tracking-wider uppercase font-pixel" style={{ fontFamily: T.pixel }}>
            LOADING FEED...
          </p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="py-24 text-center border-2 border-retro-border bg-retro-surface shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <BookOpen size={36} className="text-retro-text/10 mx-auto mb-3" />
          <p className="text-retro-text/30 text-sm font-terminal uppercase" style={{ fontFamily: T.mono }}>
            No published articles matched your search.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredBlogs.map(blog => {
            const isLiked = !!likedBlogs[blog._id];
            const isExpanded = !!expandedBlogs[blog._id];
            const readTime = Math.max(3, Math.round((blog.content || "").split(/\s+/).length / 200));
            const shouldTruncate = (blog.content || "").length > 450;

            const renderedContent = isExpanded 
              ? blog.content 
              : shouldTruncate 
                ? `${blog.content.slice(0, 420)}...` 
                : blog.content;

            return (
              <div key={blog._id} className="border-2 border-retro-border bg-retro-surface p-6 sm:p-8 space-y-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                {(blog.featuredImage || blog.coverImage) && (
                  <div className="relative h-48 sm:h-56 w-full border-2 border-retro-border bg-retro-bg overflow-hidden">
                    <img 
                      src={blog.featuredImage || blog.coverImage} 
                      alt={blog.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
                {/* Article Metadata Header */}
                <div className="flex items-center justify-between text-xs text-retro-text/30 font-terminal">
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-0.5 border border-retro-accent text-retro-accent bg-retro-bg text-[10px] font-pixel uppercase tracking-wide"
                      style={{ fontFamily: T.pixel }}
                    >
                      {blog.category || "General"}
                    </span>
                    <span className="flex items-center gap-1 uppercase" style={{ fontFamily: T.mono }}>
                      <Calendar size={11} /> {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 uppercase" style={{ fontFamily: T.mono }}>
                    <Clock size={11} /> {readTime} MIN READ
                  </span>
                </div>

                {/* Title & Author Info */}
                <div className="space-y-2">
                  <h2
                    className="text-retro-accent font-extrabold text-3xl sm:text-4xl leading-tight tracking-tight hover:text-retro-accent/80 transition-colors uppercase font-heading"
                    style={{ fontFamily: T.ox }}
                  >
                    {blog.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border border-retro-border bg-retro-bg flex items-center justify-center text-[10px] font-black text-retro-accent">
                      {blog.author?.username?.slice(0, 2).toUpperCase() || "A"}
                    </div>
                    <span className="text-xs font-medium text-retro-text/50 font-terminal uppercase" style={{ fontFamily: T.mono }}>
                      BY <span className="text-retro-accent">@{blog.author?.username || "Anonymous"}</span>
                    </span>
                  </div>
                </div>

                {/* Excerpt if present */}
                {blog.excerpt && (
                  <div className="p-4 border-l-2 border-retro-accent bg-retro-bg/40 text-xs leading-relaxed text-retro-accent/80 italic font-terminal uppercase">
                    "{blog.excerpt}"
                  </div>
                )}

                {/* Divider */}
                <div className="h-0.5 bg-retro-border/20" />

                {/* Content Block */}
                <div className="relative">
                  <div className="text-retro-text/80 text-sm leading-relaxed whitespace-pre-wrap font-terminal uppercase space-y-4" style={{ fontFamily: T.mono }}>
                    {renderedContent}
                  </div>

                  {/* Gradient Fade for Truncated Content */}
                  {shouldTruncate && !isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-retro-surface to-transparent pointer-events-none" />
                  )}
                </div>

                {/* Inline Reader Expand / Collapse Toggle */}
                {shouldTruncate && (
                  <button
                    onClick={() => toggleExpand(blog._id)}
                    className="flex items-center gap-1.5 text-xs text-retro-accent font-pixel border-2 border-retro-border bg-retro-bg px-4 py-2 hover:border-retro-accent transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] cursor-pointer"
                    style={{ fontFamily: T.pixel }}
                  >
                    {isExpanded ? (
                      <>SHOW LESS <ChevronUp size={14} /></>
                    ) : (
                      <>READ FULL ARTICLE <ChevronDown size={14} /></>
                    )}
                  </button>
                )}

                {/* Divider */}
                <div className="h-0.5 bg-retro-border/20" />

                {/* Bottom Stats & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleLike(blog._id)}
                      className={`flex items-center gap-1.5 text-xs font-pixel transition-all border px-2.5 py-1 ${
                        isLiked 
                          ? "text-retro-amber border-retro-amber bg-retro-bg shadow-[1px_1px_0px_rgba(0,0,0,1)]" 
                          : "text-retro-text/30 border-retro-border bg-retro-bg hover:text-retro-accent hover:border-retro-accent"
                      }`}
                      style={{ fontFamily: T.pixel }}
                    >
                      <Heart size={12} className={isLiked ? "fill-retro-amber text-retro-amber" : ""} />
                      <span>{(blog.likes || []).length} LIKES</span>
                    </button>

                    <span className="text-retro-text/30 text-xs flex items-center gap-1.5 font-terminal" style={{ fontFamily: T.mono }}>
                      <Eye size={14} className="text-retro-accent" />
                      <span>{blog.views || 0} VIEWS</span>
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/blog/${blog._id}`)}
                    className="flex items-center gap-1.5 text-xs text-retro-text/40 hover:text-retro-accent transition-colors font-pixel cursor-pointer"
                    style={{ fontFamily: T.pixel }}
                  >
                    <span>OPEN PAGE</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
