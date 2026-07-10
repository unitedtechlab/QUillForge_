// ============================================================================
// pages/UserOwnBlogs.jsx — MY FILE MANAGER (User's personal blog list)
// ----------------------------------------------------------------------------
// A data-table-style manager that lists all blogs authored by the currently
// logged-in user. Displayed inside the dashboard as the "My Blogs" panel.
//
// PROPS:
//   setActive(tabId)         — switches the dashboard's active panel
//   setEditingBlog(blog)     — stores the blog to edit (null = new)
//   currentUser              — user object from the parent (contains _id for
//                              filtering the fetched blogs by author)
//
// API CALLS:
//   GET    /api/v1/blogs       → blog.controller.js → getAllBlogs
//      Fetches all blogs then client-side filters to those where
//      blog.author._id === currentUser._id. (A dedicated /my-blogs endpoint
//      would be more efficient; this is a known improvement area.)
//   GET    /api/v1/blogs/:id   → blog.controller.js → getBlogById
//      Used by startEdit() to load the full blog before opening the editor.
//   DELETE /api/v1/blogs/:id   → blog.controller.js → deleteBlog
//      Deletes a single blog. Also supports bulk delete (Promise.all).
//
// FEATURES:
//   • Status filter tabs (All / Published / Draft)
//   • Title search bar (client-side substring match)
//   • Multi-select checkboxes with batch delete
//   • Desktop table layout (7 columns) + mobile card layout (responsive grid)
//   • Inline edit shortcut → loads blog into CreateBlogPage editor
//   • View button → navigates to /blog/:id
// ============================================================================

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  SortAsc,
  FileText,
} from "lucide-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function Badge({ status }) {
  const map = {
    published: {
      cls: "border-emerald-400/40 text-emerald-400 bg-[#13141f]",
      label: "PUBLISHED",
    },
    draft: {
      cls: "border-retro-accent/40  text-retro-accent  bg-[#13141f]",
      label: "DRAFT",
    },
    flagged: {
      cls: "border-red-400/40    text-red-400    bg-[#13141f]",
      label: "FLAGGED",
    },
  };
  const s = map[status] || map.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-pixel rounded-lg ${s.cls}`}>
      {s.label}
    </span>
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

  const toggleSelect = (id) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );

  const toggleAll = () =>
    setSelected((s) =>
      s.length === filtered.length ? [] : filtered.map((b) => b._id)
    );

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
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-retro-accent uppercase tracking-widest font-heading">
            MY FILE MANAGER
          </h1>
          <p className="text-retro-text/30 text-xs font-terminal uppercase mt-1">
            {userBlogs.length} total · {userBlogs.filter((b) => b.isPublished).length}{" "}
            published · {userBlogs.filter((b) => !b.isPublished).length} drafts
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBlog(null);
            setActive("create");
          }}
          className="border-2 border-retro-border bg-retro-accent text-[#1C1D2E] text-xs font-pixel px-4 py-2.5 rounded-xl shadow-[2px_2px_0px_#1C1D2E] active:translate-y-[1px] active:shadow-none cursor-pointer uppercase tracking-wider hover:bg-retro-accent/80 transition-all duration-200"
        >
          <Plus size={13} className="inline mr-1" /> NEW DOCUMENT
        </button>
      </div>

      <div className="border-2 border-retro-border bg-retro-surface p-4 rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E]">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-1 bg-[#13141f] border border-retro-border p-1 rounded-xl flex-shrink-0">
            {["all", "published", "draft"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 text-xs font-pixel uppercase tracking-wider transition-all duration-200 rounded-lg ${
                  filter === f
                    ? "bg-retro-accent text-[#1C1D2E]"
                    : "text-retro-text/30 hover:text-retro-accent"
                }`}
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
              </button>
            ))}
          </div>

          <div className="relative flex-1">
            <Search
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-retro-text/30"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH BY TITLE OR CATEGORY…"
              className="w-full bg-[#13141f] border border-retro-border rounded-xl pl-9 pr-4 py-2 text-xs text-retro-text placeholder-retro-text/30 focus:outline-none focus:border-retro-accent font-terminal uppercase"
            />
          </div>

          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 border-2 border-red-500 bg-[#13141f] text-red-400 text-xs font-pixel uppercase tracking-wider rounded-xl shadow-[2px_2px_0px_#1C1D2E] active:translate-y-[1px] cursor-pointer"
            >
              <Trash2 size={12} /> DELETE ({selected.length})
            </button>
          )}
        </div>
      </div>

      <div className="border-2 border-retro-border bg-retro-surface rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E] overflow-hidden">
        <div className="grid grid-cols-[24px_1fr_100px_80px_100px_100px_100px] gap-3 px-4 py-3 border-b border-retro-border/40 bg-[#13141f] max-lg:hidden">
          <input
            type="checkbox"
            checked={
              selected.length === filtered.length && filtered.length > 0
            }
            onChange={toggleAll}
            className="w-4 h-4 rounded accent-retro-accent mt-0.5 cursor-pointer"
          />
          {["Title", "Status", "Views", "Created", "Updated", "Actions"].map(
            (h) => (
              <div
                key={h}
                className="flex items-center gap-1.5 text-xs font-pixel text-retro-text/45 uppercase tracking-wider cursor-pointer hover:text-retro-accent transition-colors"
              >
                {h}{" "}
                {["Title", "Views", "Created"].includes(h) && (
                  <SortAsc size={10} className="opacity-50" />
                )}
              </div>
            )
          )}
        </div>

        <div className="divide-y divide-retro-border/20">
          {filtered.map((b) => (
            <div
              key={b._id}
              className="group hover:bg-[#13141f]/35 transition-all border-b border-retro-border/20"
            >
              <div className="hidden lg:grid grid-cols-[24px_1fr_100px_80px_100px_100px_100px] gap-3 px-4 py-4 items-center">
                <input
                  type="checkbox"
                  checked={selected.includes(b._id)}
                  onChange={() => toggleSelect(b._id)}
                  className="w-4 h-4 accent-retro-accent cursor-pointer rounded"
                />
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 border border-retro-border bg-[#13141f] rounded-lg flex items-center justify-center text-base flex-shrink-0">
                    {b.isPublished ? "⚡" : "📝"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-retro-accent text-sm font-bold truncate group-hover:text-retro-accent/80 transition-colors font-terminal uppercase">
                      {b.title}
                    </p>
                    <p className="text-retro-text/30 text-[10px] uppercase font-terminal">
                      {b.category || "General"}
                    </p>
                  </div>
                </div>
                <Badge status={b.isPublished ? "published" : "draft"} />
                <span className="text-retro-text/50 text-xs flex items-center gap-1 font-terminal">
                  <Eye size={11} className="text-retro-accent" />
                  {b.isPublished
                    ? b.views >= 1000
                      ? `${(b.views / 1000).toFixed(1)}K`
                      : b.views
                    : "—"}
                </span>
                <span className="text-retro-text/30 text-[11px] font-terminal">
                  {new Date(b.createdAt).toLocaleDateString()}
                </span>
                <span className="text-retro-text/30 text-[11px] font-terminal">
                  {new Date(b.updatedAt).toLocaleDateString()}
                </span>
                <div className="relative">
                  <div className="flex items-center gap-1.5">
                    {[
                      {
                        icon: <Eye size={12} />,
                        title: "View Document",
                        cls: "hover:text-retro-accent hover:border-retro-accent",
                        action: () => navigate(`/blog/${b._id}`),
                      },
                      {
                        icon: <Edit3 size={12} />,
                        title: "Edit Document",
                        cls: "hover:text-retro-accent hover:border-retro-accent",
                        action: () => startEdit(b._id),
                      },
                      {
                        icon: <Trash2 size={12} />,
                        title: "Delete Document",
                        cls: "hover:text-red-400 hover:border-red-400",
                        action: () => deleteB(b._id),
                      },
                    ].map((a, j) => (
                      <button
                        key={j}
                        title={a.title}
                        onClick={a.action}
                        className={`w-8 h-8 border border-retro-border bg-retro-surface rounded-lg flex items-center justify-center text-retro-text/30 transition-all shadow-[1px_1px_0px_#1C1D2E] active:translate-y-[1px] cursor-pointer ${a.cls}`}
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
                  <p className="text-retro-accent text-sm font-bold uppercase font-terminal">
                    {b.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge status={b.isPublished ? "published" : "draft"} />
                    <span className="text-retro-text/30 text-[10px] uppercase font-terminal">
                      {b.category || "General"}
                    </span>
                    {b.isPublished && (
                      <span className="text-retro-accent text-[10px] flex items-center gap-1 font-terminal">
                        <Eye size={10} />
                        {b.views >= 1000
                          ? `${(b.views / 1000).toFixed(1)}K`
                          : b.views}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {[
                      {
                        i: <Eye size={12} />,
                        c: "text-retro-accent",
                        fn: () => navigate(`/blog/${b._id}`),
                      },
                      {
                        i: <Edit3 size={12} />,
                        c: "text-retro-accent",
                        fn: () => startEdit(b._id),
                      },
                      {
                        i: <Trash2 size={12} />,
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
              No documents match your filter
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3.5 border-t border-retro-border/40 bg-[#13141f]">
            <p className="text-retro-text/30 text-xs font-terminal uppercase">
              Showing {filtered.length} of {userBlogs.length} documents
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className={`w-7 h-7 border text-xs font-pixel transition-all rounded-lg ${
                    p === 1
                      ? "border-retro-accent bg-retro-accent text-[#1C1D2E]"
                      : "text-retro-text/40 hover:text-retro-accent bg-retro-surface border-retro-border"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
