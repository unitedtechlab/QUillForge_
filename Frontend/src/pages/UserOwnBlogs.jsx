import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  SortAsc,
  FileText,
  ChevronRight,
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
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

/* ════════════════════════════════════════════════
   SHARED ATOMS
════════════════════════════════════════════════ */
function GlassCard({ children, className = "", glow = "" }) {
  return (
    <motion.div
      whileHover={{
        borderColor: glow || "rgba(34,211,238,0.25)",
        boxShadow: glow
          ? `0 0 40px ${glow}18`
          : "0 0 40px rgba(34,211,238,0.08)",
      }}
      transition={{ duration: 0.25 }}
      className={`relative rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-md overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Badge({ status }) {
  const map = {
    published: {
      cls: "border-emerald-400/30 text-emerald-300 bg-emerald-400/10",
      dot: "bg-emerald-400",
      label: "Published",
    },
    draft: {
      cls: "border-amber-400/30  text-amber-300  bg-amber-400/10",
      dot: "bg-amber-400",
      label: "Draft",
    },
    flagged: {
      cls: "border-red-400/30    text-red-300    bg-red-400/10",
      dot: "bg-red-400",
      label: "Flagged",
    },
  };
  const s = map[status] || map.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${s.cls}`}
      style={{ fontFamily: T.ox }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
      {s.label}
    </span>
  );
}

function GradientBtn({ children, onClick, className = "" }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, boxShadow: "0 0 28px rgba(34,211,238,0.35)" }}
      whileTap={{ scale: 0.97 }}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white ${className}`}
      style={{
        background: "linear-gradient(135deg,#22d3ee 0%,#7c3aed 100%)",
        fontFamily: T.ox,
      }}
    >
      {children}
    </motion.button>
  );
}

/* ════════════════════════════════════════════════
   USER OWN BLOGS COMPONENT
════════════════════════════════════════════════ */
export default function UserOwnBlogs({ setActive, setEditingBlog, currentUser }) {
  const [blogs, setBlogs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  // Fetch all blogs when the page component is mounted
  useEffect(() => {
    fetchBlogs();
  }, []);

  /**
   * Fetches all blogs from the backend.
   * 
   * API Call:
   * - Endpoint: GET /blogs (in backend start/routes/blog.routes.js)
   */
  const fetchBlogs = async () => {
    try {
      const res = await api.get("/blogs");
      setBlogs(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch blogs in My Blogs:", error);
    }
  };

  // Keep only the blogs authored by the current user
  const userBlogs = blogs.filter((b) => {
    if (!currentUser) return false;
    if (!b.author) return false;
    const authorId = typeof b.author === "object" ? b.author?._id : b.author;
    return authorId === currentUser._id;
  });

  const filtered = userBlogs
    .filter(
      (b) =>
        filter === "all" ||
        (filter === "published" && b.isPublished) ||
        (filter === "draft" && !b.isPublished)
    )
    .filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));

  /**
   * Toggles selection state of a specific blog in the checkbox list.
   */
  const toggleSelect = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );

  /**
   * Selects all filtered blogs or deselects all of them.
   */
  const toggleAll = () =>
    setSelected((s) =>
      s.length === filtered.length ? [] : filtered.map((b) => b._id)
    );

  /**
   * Deletes a single blog post.
   * 
   * API Call:
   * - Endpoint: DELETE /blogs/:id (in backend start/routes/blog.routes.js)
   */
  const deleteB = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await api.delete(`/blogs/${id}`);
        setBlogs((b) => b.filter((x) => x._id !== id));
        setSelected((s) => s.filter((x) => x !== id));
      } catch (error) {
        console.error(error);
        alert("Failed to delete blog");
      }
    }
  };

  /**
   * Performs a bulk deletion on all checked/selected blogs.
   * 
   * API Call:
   * - Endpoint: DELETE /blogs/:id (iterates in parallel via Promise.all)
   */
  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selected.length} blogs?`)) {
      try {
        await Promise.all(selected.map((id) => api.delete(`/blogs/${id}`)));
        setBlogs((b) => b.filter((x) => !selected.includes(x._id)));
        setSelected([]);
      } catch (error) {
        console.error("Bulk delete failed:", error);
        alert("Failed to delete some blogs");
      }
    }
  };

  /**
   * Loads a blog by ID to prepare for editing and switches views.
   * 
   * API Call:
   * - Endpoint: GET /blogs/:id (in backend start/routes/blog.routes.js)
   */
  const startEdit = async (id) => {
    try {
      const res = await api.get(`/blogs/${id}`);
      setEditingBlog(res.data.data);
      setActive("create");
    } catch (error) {
      console.error(error);
      alert("Failed to load blog");
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black text-white"
            style={{ fontFamily: T.ox }}
          >
            My Blogs<span className="text-cyan-400">.</span>
          </h1>
          <p
            className="text-white/25 text-xs mt-1"
            style={{ fontFamily: T.mono }}
          >
            {userBlogs.length} total · {userBlogs.filter((b) => b.isPublished).length}{" "}
            published · {userBlogs.filter((b) => !b.isPublished).length} drafts
          </p>
        </div>
        <GradientBtn
          onClick={() => {
            setEditingBlog(null);
            setActive("create");
          }}
          className="self-start text-xs px-4 py-2.5"
        >
          <Plus size={13} /> New Blog
        </GradientBtn>
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 flex-shrink-0">
            {["all", "published", "draft"].map((f) => (
              <motion.button
                // BUTTON ACTION: Filters blogs list by status (all, published, draft)
                // CALLS FUNCTION: setFilter(f)
                key={f}
                onClick={() => setFilter(f)}
                whileTap={{ scale: 0.95 }}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
                  filter === f
                    ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/15 border border-cyan-500/25 text-white"
                    : "text-white/30 hover:text-white/60"
                }`}
                style={{ fontFamily: T.ox }}
              >
                {f}{" "}
                {f !== "all" &&
                  `(${
                    userBlogs.filter(
                      (b) =>
                        (f === "published" && b.isPublished) ||
                        (f === "draft" && !b.isPublished)
                    ).length
                  })`}
              </motion.button>
            ))}
          </div>

          <div className="relative flex-1">
            <Search
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or category…"
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/15 focus:outline-none focus:border-cyan-400/40 transition-all"
              style={{ fontFamily: T.mono }}
            />
          </div>

          {selected.length > 0 && (
            <motion.button
              // BUTTON ACTION: Performs bulk delete API requests for all checked items
              // CALLS FUNCTION: handleBulkDelete()
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-400/30 bg-red-400/8 text-red-400 text-xs font-semibold transition-all hover:bg-red-400/15"
              style={{ fontFamily: T.ox }}
            >
              <Trash2 size={12} /> Delete ({selected.length})
            </motion.button>
          )}
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="grid grid-cols-[24px_1fr_100px_80px_100px_100px_100px] gap-3 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] max-lg:hidden">
          <input
            type="checkbox"
            checked={
              selected.length === filtered.length && filtered.length > 0
            }
            onChange={toggleAll}
            className="w-4 h-4 rounded accent-cyan-400 mt-0.5"
          />
          {["Title", "Status", "Views", "Created", "Updated", "Actions"].map(
            (h) => (
              <div
                key={h}
                className="flex items-center gap-1.5 text-[10px] font-semibold text-white/25 uppercase tracking-wider cursor-pointer hover:text-white/50 transition-colors"
                style={{ fontFamily: T.ox }}
              >
                {h}{" "}
                {["Title", "Views", "Created"].includes(h) && (
                  <SortAsc size={9} className="opacity-50" />
                )}
              </div>
            )
          )}
        </div>

        <div className="divide-y divide-white/[0.04]">
          <AnimatePresence>
            {filtered.map((b, i) => (
              <motion.div
                key={b._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05 }}
                className="group hover:bg-white/[0.02] transition-all"
              >
                <div className="hidden lg:grid grid-cols-[24px_1fr_100px_80px_100px_100px_100px] gap-3 px-4 py-4 items-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(b._id)}
                    onChange={() => toggleSelect(b._id)}
                    className="w-4 h-4 rounded accent-cyan-400"
                  />
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-white/[0.07] flex items-center justify-center text-base flex-shrink-0">
                      {b.isPublished ? "⚡" : "📝"}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-white/80 text-xs font-semibold truncate group-hover:text-white transition-colors"
                        style={{ fontFamily: T.ox }}
                      >
                        {b.title}
                      </p>
                      <p
                        className="text-white/20 text-[10px]"
                        style={{ fontFamily: T.mono }}
                      >
                        {b.category || "General"}
                      </p>
                    </div>
                  </div>
                  <Badge status={b.isPublished ? "published" : "draft"} />
                  <span
                    className="text-white/50 text-xs flex items-center gap-1"
                    style={{ fontFamily: T.mono }}
                  >
                    <Eye size={9} className="text-violet-400" />
                    {b.isPublished
                      ? b.views >= 1000
                        ? `${(b.views / 1000).toFixed(1)}K`
                        : b.views
                      : "—"}
                  </span>
                  <span
                    className="text-white/30 text-[10px]"
                    style={{ fontFamily: T.mono }}
                  >
                    {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                  <span
                    className="text-white/30 text-[10px]"
                    style={{ fontFamily: T.mono }}
                  >
                    {new Date(b.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="relative">
                    <div className="flex items-center gap-1">
                      {/* BUTTON ACTIONS: Loops through the operational triggers for each blog row */}
                      {/* 1. View / Open blog post detail page (triggers router navigation) */}
                      {/* 2. Edit blog post (calls startEdit API loader & switches view) */}
                      {/* 3. Delete blog post (calls deleteB API request handler) */}
                      {[
                        {
                          icon: <Eye size={11} />,
                          title: "Wanna read ? 👀",
                          cls: "hover:text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-400/20",
                          action: () => navigate(`/blog/${b._id}`),
                        },
                        {
                          icon: <Edit3 size={11} />,
                          title: "Edit",
                          cls: "hover:text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400/20",
                          action: () => startEdit(b._id),
                        },
                        {
                          icon: <Trash2 size={11} />,
                          title: "Delete",
                          cls: "hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20",
                          action: () => deleteB(b._id),
                        },
                      ].map((a, j) => (
                        <motion.button
                          key={j}
                          title={a.title}
                          onClick={a.action}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`w-7 h-7 rounded-lg border border-white/[0.06] bg-white/[0.03] flex items-center justify-center text-white/25 transition-all ${a.cls}`}
                        >
                          {a.icon}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:hidden p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/[0.07] flex items-center justify-center text-xl flex-shrink-0">
                    {b.isPublished ? "⚡" : "📝"}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <p
                      className="text-white/80 text-sm font-semibold"
                      style={{ fontFamily: T.ox }}
                    >
                      {b.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge status={b.isPublished ? "published" : "draft"} />
                      <span
                        className="text-white/30 text-[10px]"
                        style={{ fontFamily: T.mono }}
                      >
                        {b.category || "General"}
                      </span>
                      {b.isPublished && (
                        <span
                          className="text-violet-400 text-[10px] flex items-center gap-1"
                          style={{ fontFamily: T.mono }}
                        >
                          <Eye size={9} />
                          {b.views >= 1000
                            ? `${(b.views / 1000).toFixed(1)}K`
                            : b.views}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {[
                        {
                          i: <Eye size={11} />,
                          c: "text-emerald-400",
                          fn: () => navigate(`/blog/${b._id}`),
                        },
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <FileText size={32} className="text-white/10 mx-auto mb-3" />
            <p
              className="text-white/20 text-sm"
              style={{ fontFamily: T.mono }}
            >
              No blogs match your filter
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3.5 border-t border-white/[0.06] bg-white/[0.01]">
            <p
              className="text-white/20 text-[10px]"
              style={{ fontFamily: T.mono }}
            >
              Showing {filtered.length} of {userBlogs.length} blogs
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                    p === 1
                      ? "bg-cyan-500/15 border border-cyan-500/25 text-cyan-400"
                      : "text-white/30 hover:text-white/60 hover:bg-white/[0.05]"
                  }`}
                  style={{ fontFamily: T.ox }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
