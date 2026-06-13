import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Hash,
  Copy,
  Save,
  RefreshCw,
  Send,
  ChevronDown,
  Zap,
  AlignLeft,
  Layers,
  ExternalLink,
} from "lucide-react";
import api from "../api/axios";

/* ════════════════════════════════════════════════
   DESIGN TOKENS
════════════════════════════════════════════════ */
const T = {
  ox: "'Oxanium',sans-serif",
  mono: "'Space Mono',monospace",
  bg: "#050816",
};

/* ════════════════════════════════════════════════
   HELPERS & SUB-COMPONENTS
   ════════════════════════════════════════════════ */

/**
 * Converts a text title into a URL-friendly slug.
 * Example: "My First Blog Post" -> "my-first-blog-post"
 */
const toSlug = (v) =>
  v
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

/**
 * A standard labeled wrapper layout for inputs.
 */
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

/**
 * Renders a glassmorphic card container with micro-animations and custom glows on hover.
 */
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

/**
 * Renders a reusable action button with a cyan-to-violet gradient and tap/hover effects.
 */
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
   CREATE BLOG PAGE COMPONENT
   ════════════════════════════════════════════════ */
export default function CreateBlogPage({ editingBlog, setEditingBlog }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Technology");
  const [tags, setTags] = useState("");
  const [pub, setPub] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recovered, setRecovered] = useState(false);

  // Load draft from localStorage on mount (if we are NOT editing an existing blog)
  useEffect(() => {
    if (!editingBlog) {
      const savedDraft = localStorage.getItem("quillforge_draft");
      if (savedDraft) {
        try {
          const { title: dTitle, excerpt: dExcerpt, content: dContent, category: dCategory, tags: dTags } = JSON.parse(savedDraft);
          if (dTitle || dContent || dExcerpt) {
            setTitle(dTitle || "");
            setExcerpt(dExcerpt || "");
            setContent(dContent || "");
            setCategory(dCategory || "Technology");
            setTags(dTags || "");
            setRecovered(true);
            setTimeout(() => setRecovered(false), 5000);
          }
        } catch (e) {
          console.error("Failed to parse saved draft", e);
        }
      }
    }
  }, [editingBlog]);

  // Save draft to localStorage whenever fields change
  useEffect(() => {
    if (editingBlog) return;
    if (!title && !content && !excerpt && !tags) {
      localStorage.removeItem("quillforge_draft");
      return;
    }
    const draftData = { title, excerpt, content, category, tags };
    localStorage.setItem("quillforge_draft", JSON.stringify(draftData));
  }, [title, excerpt, content, category, tags, editingBlog]);

  // Effect to load editingBlog properties into form fields when in edit mode,
  // or clear them when launching a fresh blog creation.
  useEffect(() => {
    if (!editingBlog) {
      const savedDraft = localStorage.getItem("quillforge_draft");
      if (!savedDraft) {
        setTitle("");
        setExcerpt("");
        setContent("");
        setPub(false);
      }
      return;
    }

    setTitle(editingBlog.title || "");
    setExcerpt(editingBlog.excerpt || "");
    setContent(editingBlog.content || "");
    setPub(editingBlog.isPublished);
  }, [editingBlog]);

  // Effect to automatically synchronize URL Slug field with title changes.
  useEffect(() => {
    setSlug(toSlug(title));
  }, [title]);

  /**
   * Saves the blog post as either a draft or publishes it.
   * 
   * API Calls:
   * 1. If updating an existing blog (editingBlog is defined):
   *    - Endpoint: PUT /blogs/:id (in backend start/routes/blog.routes.js)
   * 2. If creating a new blog:
   *    - Endpoint: POST /blogs (in backend start/routes/blog.routes.js)
   */
  const handleSave = async (publish = false) => {
    try {
      setSaving(true);
      let res;

      if (editingBlog) {
        res = await api.put(`/blogs/${editingBlog._id}`, { 
          title,
          excerpt,
          content,
          isPublished: publish,
        });

        if (setEditingBlog) setEditingBlog(null);
        setTitle("");
        setExcerpt("");
        setContent("");
        setPub(false);
      } else {
        res = await api.post("/blogs", {
          title,
          excerpt,
          content,
          isPublished: publish,
        });

        console.log("BLOG CREATED:", res.data);
        setTitle("");
        setExcerpt("");
        setContent("");
        setPub(false);
      }

      localStorage.removeItem("quillforge_draft");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

      if (publish) setPub(true);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 focus:outline-none focus:border-cyan-400/50 focus:bg-white/[0.05] transition-all";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black text-white"
            style={{ fontFamily: T.ox }}
          >
            {editingBlog ? "Edit Blog" : "Create New Blog"}
          </h1>
          <p
            className="text-white/25 text-xs mt-1"
            style={{ fontFamily: T.mono }}
          >
            Draft autosaves every 30 seconds
          </p>
        </div>
        {saved && (
          <div
            className="flex items-center gap-2 text-emerald-400 text-xs border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 rounded-xl"
            style={{ fontFamily: T.mono }}
          >
            <CheckCircle2 size={12} /> Saved successfully
          </div>
        )}
        {recovered && (
          <div
            className="flex items-center gap-2 text-cyan-400 text-xs border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 rounded-xl"
            style={{ fontFamily: T.mono }}
          >
            <CheckCircle2 size={12} /> Unsaved draft recovered
          </div>
        )}
      </div>

      <div className="grid xl:grid-cols-[1fr_280px] gap-5">
        {/* Main editor */}
        <div className="space-y-4">
          <GlassCard className="p-6 space-y-5">
            <Field label="Blog Title">
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
                <span
                  className="px-3 py-3 text-xs text-white/20 bg-white/[0.03] border-r border-white/[0.08] flex-shrink-0 flex items-center gap-1.5"
                  style={{ fontFamily: T.mono }}
                >
                  <Hash size={11} /> quill.io/blog/
                </span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-cyan-400/80 placeholder-white/15 focus:outline-none"
                  style={{ fontFamily: T.mono }}
                />
                <button
                  onClick={() =>
                    navigator.clipboard?.writeText(`quill.io/blog/${slug}`)
                  }
                  className="px-3 text-white/20 hover:text-white/60 transition-colors"
                >
                  <Copy size={13} />
                </button>
              </div>
            </Field>

            <Field label="Excerpt / Meta Description">
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="A short summary shown in search results and blog cards…"
                className={`${inputCls} resize-none`}
                style={{ fontFamily: T.mono }}
              />
              <p
                className="text-right text-white/15 text-[9px]"
                style={{ fontFamily: T.mono }}
              >
                {excerpt.length}/160 chars
              </p>
            </Field>

            <Field label="Content">
              <div className="flex items-center gap-1 flex-wrap mb-2 p-2 bg-white/[0.03] border border-white/[0.07] rounded-t-xl border-b-0">
                {[
                  ["B", "font-bold"],
                  ["I", "italic"],
                  ["U", "underline"],
                ].map(([l, cls]) => (
                  <button
                    key={l}
                    className={`w-7 h-7 rounded-md text-white/40 hover:text-white hover:bg-white/[0.07] text-xs transition-all ${cls}`}
                    style={{ fontFamily: T.ox }}
                  >
                    {l}
                  </button>
                ))}
                <div className="w-px h-4 bg-white/[0.08] mx-1" />
                {[
                  { icon: <Hash size={11} />, title: "Heading" },
                  { icon: <AlignLeft size={11} />, title: "Align" },
                  { icon: <Layers size={11} />, title: "List" },
                  { icon: <ExternalLink size={11} />, title: "Link" },
                ].map((t, i) => (
                  <button
                    key={i}
                    title={t.title}
                    className="w-7 h-7 rounded-md text-white/30 hover:text-white hover:bg-white/[0.07] flex items-center justify-center transition-all"
                  >
                    {t.icon}
                  </button>
                ))}
                <div
                  className="ml-auto text-white/15 text-[9px] pr-1"
                  style={{ fontFamily: T.mono }}
                >
                  {content.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                placeholder="Start writing your blog post here…&#10;&#10;Use markdown formatting:&#10;# Heading 1&#10;## Heading 2&#10;**bold**, *italic*, `code`&#10;&#10;> Blockquote"
                className="w-full bg-white/[0.025] border border-white/[0.07] rounded-b-xl px-5 py-4 text-sm text-white/80 placeholder-white/10 focus:outline-none focus:border-cyan-400/40 transition-all resize-none leading-relaxed"
                style={{ fontFamily: T.mono }}
              />
            </Field>
          </GlassCard>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          <GlassCard className="p-5 space-y-4">
            <h3
              className="text-xs font-black text-white"
              style={{ fontFamily: T.ox }}
            >
              Publish Settings
            </h3>

            <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
              <div>
                <p
                  className="text-white/70 text-xs font-semibold"
                  style={{ fontFamily: T.ox }}
                >
                  Status
                </p>
                <p
                  className="text-white/25 text-[10px]"
                  style={{ fontFamily: T.mono }}
                >
                  {pub ? "Live on site" : "Draft"}
                </p>
              </div>
              {/* BUTTON ACTION: Toggles direct publish flag status */}
              {/* CALLS FUNCTION: setPub(!pub) */}
              <motion.button
                onClick={() => setPub(!pub)}
                whileTap={{ scale: 0.95 }}
                className={`relative w-11 h-6 rounded-full border transition-all duration-300 ${pub ? "bg-cyan-500/20 border-cyan-400/40" : "bg-white/[0.05] border-white/10"}`}
              >
                <motion.div
                  animate={{ x: pub ? 20 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md ${pub ? "bg-gradient-to-br from-cyan-400 to-violet-500" : "bg-white/30"}`}
                />
              </motion.button>
            </div>

            <div className="space-y-2.5">
              {/* BUTTON ACTION: Saves the blog content as a draft */}
              {/* CALLS FUNCTION: handleSave(false) */}
              <motion.button
                onClick={() => handleSave(false)}
                disabled={saving}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-bold transition-all disabled:opacity-50"
                style={{ fontFamily: T.ox }}
              >
                {saving ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={12} />
                    Save Draft
                  </>
                )}
              </motion.button>
              {/* BUTTON ACTION: Publishes the blog directly */}
              {/* CALLS FUNCTION: handleSave(true) */}
              <GradientBtn
                onClick={() => handleSave(true)}
                className="w-full py-3 text-xs"
              >
                <Send size={12} /> Publish Blog
              </GradientBtn>
            </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-3">
            <h3
              className="text-xs font-black text-white"
              style={{ fontFamily: T.ox }}
            >
              Category
            </h3>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/70 focus:outline-none focus:border-cyan-400/40 transition-all cursor-pointer"
                style={{ fontFamily: T.mono }}
              >
                {[
                  "Technology",
                  "Design",
                  "Dev",
                  "Lifestyle",
                  "Business",
                  "Opinion",
                ].map((c) => (
                  <option key={c} value={c} style={{ background: "#050816" }}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
              />
            </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-3">
            <h3
              className="text-xs font-black text-white"
              style={{ fontFamily: T.ox }}
            >
              Tags
            </h3>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, node.js, tutorial"
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-xs text-white/70 placeholder-white/15 focus:outline-none focus:border-cyan-400/40 transition-all"
              style={{ fontFamily: T.mono }}
            />
            {tags && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-[10px] border border-cyan-400/20 text-cyan-400/70 bg-cyan-400/8"
                      style={{ fontFamily: T.ox }}
                    >
                      {t}
                    </span>
                  ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={12} className="text-amber-400" />
              <h3
                className="text-xs font-black text-white"
                style={{ fontFamily: T.ox }}
              >
                Writing Tips
              </h3>
            </div>
            <ul className="space-y-2">
              {[
                "Aim for 1,000+ words for better SEO",
                "Add 3-5 relevant tags",
                "Use a compelling excerpt",
                "Include a clear call to action",
              ].map((tip, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[10px] text-white/30"
                  style={{ fontFamily: T.mono }}
                >
                  <div className="w-1 h-1 rounded-full bg-cyan-400/40 mt-1.5 flex-shrink-0" />
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
