import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
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
      <style>{`
        .blog-content-feed h2, .blog-content-feed h3, .blog-content-feed h4 {
          color: #8F72FF; font-weight: 800; margin: 1rem 0 0.5rem; line-height: 1.3;
        }
        .blog-content-feed h2 { font-size: 1.5rem; }
        .blog-content-feed h3 { font-size: 1.25rem; }
        .blog-content-feed h4 { font-size: 1.1rem; }
        .blog-content-feed p { margin: 0.75rem 0; }
        .blog-content-feed ul, .blog-content-feed ol { margin: 0.75rem 0; padding-left: 1.5rem; }
        .blog-content-feed ul { list-style: square; }
        .blog-content-feed ol { list-style: decimal; }
        .blog-content-feed li { margin: 0.25rem 0; }
        .blog-content-feed a { color: #2ac3de; text-decoration: underline; }
        .blog-content-feed blockquote {
          border-left: 3px solid #8F72FF; padding-left: 1rem; margin: 1rem 0;
          font-style: italic; color: rgba(226,226,245,0.7);
        }
        .blog-content-feed pre {
          background: #13141f; border: 1px solid #1C1D2E; border-radius: 8px;
          padding: 1rem; overflow-x: auto; margin: 1rem 0;
        }
        .blog-content-feed code { font-family: monospace; font-size: 0.85rem; }
      `}</style>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-retro-accent flex items-center gap-2 uppercase tracking-widest font-heading">
            <BookOpen className="text-retro-accent animate-pulse" size={32} /> READ ARTICLES
          </h1>
          <p className="text-retro-text/30 text-xs font-terminal uppercase mt-1">
            Explore the latest knowledge, tutorials, and stories from our community.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-retro-text/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH ARTICLES..."
            className="w-full bg-[#13141f] border border-retro-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-retro-text placeholder-retro-text/30 focus:outline-none focus:border-retro-accent font-terminal uppercase"
          />
        </div>
      </div>

      {/* Category Pills + Featured by Admin toggle */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none flex-wrap">
        <button
          onClick={() => setShowAdminOnly(v => !v)}
          className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-pixel uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-xl ${
            showAdminOnly
              ? "border-retro-accent bg-retro-accent text-[#1C1D2E]"
              : "text-retro-text/30 hover:text-retro-accent border-retro-border bg-[#13141f]"
          }`}
        >
          <Star size={10} className={showAdminOnly ? "fill-[#1C1D2E] text-[#1C1D2E]" : ""} />
          FEATURED BY ADMIN
        </button>

        {/* Divider — only when there are real categories to show */}
        {categories.length > 2 && (
          <div className="w-0.5 h-6 bg-retro-border/20 flex-shrink-0 mx-1" />
        )}

        {/* Category filters only appear once you have posts in 2+ categories,
            so a single lone chip doesn't clutter the bar */}
        {categories.length > 2 && categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 border text-xs font-pixel uppercase tracking-wider transition-all cursor-pointer rounded-xl ${
              selectedCategory === cat
                ? "border-retro-accent bg-retro-accent text-[#1C1D2E]"
                : "text-retro-text/30 hover:text-retro-accent border-retro-border bg-[#13141f]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main vertical feed */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-retro-accent/20 border-t-retro-accent rounded-full mx-auto animate-spin" />
          <p className="text-retro-text/30 text-xs tracking-wider uppercase font-pixel">
            LOADING FEED...
          </p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="py-24 text-center border-2 border-retro-border bg-retro-surface rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E]">
          <BookOpen size={36} className="text-retro-text/10 mx-auto mb-3" />
          <p className="text-retro-text/30 text-sm font-terminal uppercase">
            No published articles matched your search.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredBlogs.map(blog => {
            const isLiked = !!likedBlogs[blog._id];
            const isExpanded = !!expandedBlogs[blog._id];
            const readTime = Math.max(3, Math.round((blog.content || "").split(/\s+/).length / 200));
            // Plain-text version (tags stripped) used to decide truncation and for the collapsed preview
            const plainText = (blog.content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
            const shouldTruncate = plainText.length > 450;

            return (
              <div key={blog._id} className="border-2 border-retro-border bg-retro-surface p-6 sm:p-8 space-y-6 rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E]">
                {(blog.featuredImage || blog.coverImage) && (
                  <div className="relative h-48 sm:h-56 w-full border border-retro-border bg-[#13141f] rounded-xl overflow-hidden">
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
                    <span className="px-2 py-0.5 border border-retro-accent text-retro-accent bg-[#13141f] text-[9px] font-pixel uppercase tracking-wide rounded-lg">
                      {blog.category || "General"}
                    </span>
                    <span className="flex items-center gap-1 uppercase">
                      <Calendar size={11} /> {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 uppercase">
                    <Clock size={11} /> {readTime} MIN READ
                  </span>
                </div>

                {/* Title & Author Info */}
                <div className="space-y-2">
                  <h2 className="text-retro-accent font-extrabold text-3xl sm:text-4xl leading-tight tracking-tight hover:text-retro-accent/80 transition-colors uppercase font-heading">
                    {blog.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border border-retro-border bg-[#13141f] rounded-lg flex items-center justify-center text-[10px] font-black text-retro-accent">
                      {blog.author?.username?.slice(0, 2).toUpperCase() || "A"}
                    </div>
                    <span className="text-xs font-medium text-retro-text/50 font-terminal uppercase">
                      BY <span className="text-retro-accent">@{blog.author?.username || "Anonymous"}</span>
                    </span>
                  </div>
                </div>

                {/* Excerpt if present */}
                {blog.excerpt && (
                  <div className="p-4 border-l-2 border-retro-accent bg-[#13141f] text-xs leading-relaxed text-retro-accent/80 italic font-terminal uppercase rounded-r-xl">
                    "{blog.excerpt}"
                  </div>
                )}

                {/* Divider */}
                <div className="h-0.5 bg-retro-border/20" />

                {/* Content Block */}
                <div className="relative">
                  {isExpanded ? (
                    <div
                      className="blog-content-feed text-retro-text/80 text-sm leading-relaxed space-y-4"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content || "") }}
                    />
                  ) : (
                    <div className="text-retro-text/80 text-sm leading-relaxed font-terminal">
                      {shouldTruncate ? `${plainText.slice(0, 420)}...` : plainText}
                    </div>
                  )}

                  {/* Gradient Fade for Truncated Content */}
                  {shouldTruncate && !isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-retro-surface to-transparent pointer-events-none" />
                  )}
                </div>

                {/* Inline Reader Expand / Collapse Toggle */}
                {shouldTruncate && (
                  <button
                    onClick={() => toggleExpand(blog._id)}
                    className="flex items-center gap-1.5 text-xs text-retro-accent font-pixel border border-retro-border bg-[#13141f] px-4 py-2 rounded-xl hover:border-retro-accent transition-all shadow-[2px_2px_0px_0px_#1C1D2E] active:translate-y-[1px] cursor-pointer"
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
                      className={`flex items-center gap-1.5 text-xs font-pixel transition-all border px-2.5 py-1 rounded-xl cursor-pointer ${
                        isLiked 
                          ? "text-orange-400 border-orange-400 bg-[#13141f] shadow-[1px_1px_0px_0px_#1C1D2E]" 
                          : "text-retro-text/30 border-retro-border bg-[#13141f] hover:text-retro-accent hover:border-retro-accent"
                      }`}
                    >
                      <Heart size={12} className={isLiked ? "fill-orange-400 text-orange-400" : ""} />
                      <span>{(blog.likes || []).length} LIKES</span>
                    </button>

                    <span className="text-retro-text/30 text-xs flex items-center gap-1.5 font-terminal">
                      <Eye size={14} className="text-retro-accent" />
                      <span>{blog.views || 0} VIEWS</span>
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/blog/${blog._id}`)}
                    className="flex items-center gap-1.5 text-xs text-retro-text/40 hover:text-retro-accent transition-colors font-pixel cursor-pointer"
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
