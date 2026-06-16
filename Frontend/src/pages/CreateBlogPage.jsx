import { useState, useEffect } from "react";
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
   VT323 for heading, Space Mono for monospace text
════════════════════════════════════════════════ */
const T = {
  ox: "'VT323', monospace",
  mono: "'Space Mono', monospace",
  pixel: "'Silkscreen', monospace"
};

/* ════════════════════════════════════════════════
   HELPERS & SUB-COMPONENTS
   ════════════════════════════════════════════════ */

/**
 * Converts a text title into a URL-friendly slug.
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
    <div className="space-y-1.5">
      <label
        className="block text-xs font-pixel text-retro-accent tracking-widest uppercase"
        style={{ fontFamily: T.pixel }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/**
 * Renders a retro card container with outline borders.
 */
function RetroCard({ children, className = "" }) {
  return (
    <div className={`border-2 border-retro-border bg-retro-surface p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${className}`}>
      {children}
    </div>
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
  const [featuredImage, setFeaturedImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Load draft from localStorage on mount (if we are NOT editing an existing blog)
  useEffect(() => {
    if (!editingBlog) {
      const savedDraft = localStorage.getItem("quillforge_draft");
      if (savedDraft) {
        try {
          const { title: dTitle, excerpt: dExcerpt, content: dContent, category: dCategory, tags: dTags, featuredImage: dImg } = JSON.parse(savedDraft);
          if (dTitle || dContent || dExcerpt || dImg) {
            setTitle(dTitle || "");
            setExcerpt(dExcerpt || "");
            setContent(dContent || "");
            setCategory(dCategory || "Technology");
            setTags(dTags || "");
            setFeaturedImage(dImg || "");
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
    if (!title && !content && !excerpt && !tags && !featuredImage) {
      localStorage.removeItem("quillforge_draft");
      return;
    }
    const draftData = { title, excerpt, content, category, tags, featuredImage };
    localStorage.setItem("quillforge_draft", JSON.stringify(draftData));
  }, [title, excerpt, content, category, tags, featuredImage, editingBlog]);

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
        setFeaturedImage("");
      }
      return;
    }

    setTitle(editingBlog.title || "");
    setExcerpt(editingBlog.excerpt || "");
    setContent(editingBlog.content || "");
    setPub(editingBlog.isPublished);
    setFeaturedImage(editingBlog.featuredImage || "");
  }, [editingBlog]);

  // Effect to automatically synchronize URL Slug field with title changes.
  useEffect(() => {
    setSlug(toSlug(title));
  }, [title]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post("/blogs/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.data?.url) {
        setFeaturedImage(res.data.data.url);
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

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
          featuredImage,
        });

        if (setEditingBlog) setEditingBlog(null);
        setTitle("");
        setExcerpt("");
        setContent("");
        setPub(false);
        setFeaturedImage("");
      } else {
        res = await api.post("/blogs", {
          title,
          excerpt,
          content,
          isPublished: publish,
          featuredImage,
        });

        console.log("BLOG CREATED:", res.data);
        setTitle("");
        setExcerpt("");
        setContent("");
        setPub(false);
        setFeaturedImage("");
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
    "w-full bg-retro-bg border-2 border-retro-border px-4 py-3 text-sm text-retro-text placeholder-retro-text/25 focus:outline-none focus:border-retro-accent transition-all font-terminal";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-4xl sm:text-5xl font-black text-retro-accent uppercase tracking-widest font-heading"
            style={{ fontFamily: T.ox }}
          >
            {editingBlog ? "EDIT AUTHOR DESK" : "CREATE NEW DOCUMENT"}
          </h1>
          <p
            className="text-retro-text/30 text-xs font-terminal uppercase mt-1"
            style={{ fontFamily: T.mono }}
          >
            Draft autosaves every 30 seconds
          </p>
        </div>
        {saved && (
          <div
            className="flex items-center gap-2 text-emerald-400 text-xs border-2 border-emerald-400 bg-retro-bg px-3 py-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] font-terminal uppercase"
            style={{ fontFamily: T.mono }}
          >
            <CheckCircle2 size={12} /> SAVED SUCCESSFULLY
          </div>
        )}
        {recovered && (
          <div
            className="flex items-center gap-2 text-retro-accent text-xs border-2 border-retro-accent bg-retro-bg px-3 py-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] font-terminal uppercase"
            style={{ fontFamily: T.mono }}
          >
            <CheckCircle2 size={12} /> UNSAVED DRAFT RECOVERED
          </div>
        )}
      </div>

      <div className="grid xl:grid-cols-[1fr_280px] gap-5">
        {/* Main editor */}
        <div className="space-y-4">
          <RetroCard className="space-y-5">
            <Field label="Blog Title">
              <input
                value={title}
                onChange={(e) => {
                  console.log("typing", e.target.value);
                  setTitle(e.target.value);
                }}
                className={`${inputCls} text-lg font-bold font-terminal`}
              />
            </Field>

            <Field label="URL Slug">
              <div className="flex items-center gap-0 border-2 border-retro-border bg-retro-bg focus-within:border-retro-accent transition-all">
                <span
                  className="px-3 py-3 text-xs text-retro-text/30 bg-retro-surface border-r-2 border-retro-border flex-shrink-0 flex items-center gap-1.5 font-terminal"
                  style={{ fontFamily: T.mono }}
                >
                  <Hash size={11} /> quill.io/blog/
                </span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-retro-accent placeholder-retro-text/20 focus:outline-none font-terminal"
                  style={{ fontFamily: T.mono }}
                />
                <button
                  onClick={() =>
                    navigator.clipboard?.writeText(`quill.io/blog/${slug}`)
                  }
                  className="px-3 text-retro-text/30 hover:text-retro-accent transition-colors"
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
                className="text-right text-retro-text/20 text-[10px] mt-1 font-terminal"
                style={{ fontFamily: T.mono }}
              >
                {excerpt.length}/160 CHARS
              </p>
            </Field>

            <Field label="Content">
              <div className="flex items-center gap-1.5 flex-wrap mb-2 p-2 bg-retro-surface border-2 border-retro-border border-b-0">
                {[
                  ["B", "font-bold"],
                  ["I", "italic"],
                  ["U", "underline"],
                ].map(([l, cls]) => (
                  <button
                    key={l}
                    className={`w-7 h-7 border border-retro-border bg-retro-bg text-retro-text/40 hover:text-retro-accent hover:border-retro-accent text-xs transition-all font-pixel ${cls}`}
                    style={{ fontFamily: T.pixel }}
                  >
                    {l}
                  </button>
                ))}
                <div className="w-0.5 h-4 bg-retro-border/40 mx-1" />
                {[
                  { icon: <Hash size={11} />, title: "Heading" },
                  { icon: <AlignLeft size={11} />, title: "Align" },
                  { icon: <Layers size={11} />, title: "List" },
                  { icon: <ExternalLink size={11} />, title: "Link" },
                ].map((t, i) => (
                  <button
                    key={i}
                    title={t.title}
                    className="w-7 h-7 border border-retro-border bg-retro-bg text-retro-text/30 hover:text-retro-accent hover:border-retro-accent flex items-center justify-center transition-all"
                  >
                    {t.icon}
                  </button>
                ))}
                <div
                  className="ml-auto text-retro-text/20 text-[10px] pr-1 font-terminal"
                  style={{ fontFamily: T.mono }}
                >
                  {content.split(/\s+/).filter(Boolean).length} WORDS
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                placeholder="Start writing your blog post here…&#10;&#10;Use markdown formatting:&#10;# Heading 1&#10;## Heading 2&#10;**bold**, *italic*, `code`&#10;&#10;> Blockquote"
                className="w-full bg-retro-bg border-2 border-retro-border px-5 py-4 text-sm text-retro-text placeholder-retro-text/15 focus:outline-none focus:border-retro-accent transition-all resize-none leading-relaxed font-terminal"
                style={{ fontFamily: T.mono }}
              />
            </Field>
          </RetroCard>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          <RetroCard className="space-y-4">
            <h3
              className="text-sm font-black text-retro-accent uppercase tracking-widest font-pixel"
              style={{ fontFamily: T.pixel }}
            >
              SETTINGS
            </h3>

            <div className="flex items-center justify-between p-3 border-2 border-retro-border bg-retro-bg">
              <div>
                <p
                  className="text-retro-text/70 text-xs font-semibold uppercase font-terminal"
                  style={{ fontFamily: T.mono }}
                >
                  STATUS
                </p>
                <p
                  className="text-retro-text/30 text-[10px] uppercase font-terminal"
                  style={{ fontFamily: T.mono }}
                >
                  {pub ? "Live on site" : "Draft"}
                </p>
              </div>
              {/* BUTTON ACTION: Toggles direct publish flag status */}
              <button
                type="button"
                onClick={() => setPub(!pub)}
                className={`relative w-11 h-6 transition-all duration-300 border-2 ${pub ? "bg-retro-accent border-retro-accent" : "bg-retro-surface border-retro-border"}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 transition-all duration-200 ${pub ? "right-0.5 bg-retro-bg" : "left-0.5 bg-retro-text/40"}`}
                />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* BUTTON ACTION: Saves the blog content as a draft */}
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-retro-border bg-retro-bg text-retro-text/75 hover:text-retro-accent hover:border-retro-accent text-xs font-pixel uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
                style={{ fontFamily: T.pixel }}
              >
                {saving ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    SAVING…
                  </>
                ) : (
                  <>
                    <Save size={12} />
                    SAVE DRAFT
                  </>
                )}
              </button>
              {/* BUTTON ACTION: Publishes the blog directly */}
              <button
                onClick={() => handleSave(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-retro-accent bg-[#E8E8C6] text-[#252525] text-xs font-pixel uppercase tracking-widest hover:bg-[#E2E2D5] transition-all cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px]"
                style={{ fontFamily: T.pixel }}
              >
                <Send size={12} /> PUBLISH BLOG
              </button>
            </div>
          </RetroCard>

          <RetroCard className="space-y-3">
            <h3
              className="text-xs font-black text-retro-accent uppercase tracking-widest font-pixel"
              style={{ fontFamily: T.pixel }}
            >
              FEATURED IMAGE
            </h3>
            
            {featuredImage ? (
              <div className="space-y-3">
                <div className="relative border-2 border-retro-border aspect-video bg-retro-bg">
                  <img
                    src={featuredImage}
                    alt="Featured preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setFeaturedImage("")}
                    className="absolute top-2 right-2 p-1.5 bg-retro-bg hover:bg-retro-surface text-retro-accent hover:text-retro-text border-2 border-retro-accent transition-colors"
                    title="Remove image"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-retro-border hover:border-retro-accent p-6 cursor-pointer bg-retro-bg hover:bg-retro-surface/25 transition-all group">
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw size={18} className="text-retro-accent animate-spin" />
                      <span className="text-[10px] font-medium text-retro-text/40 font-terminal uppercase" style={{ fontFamily: T.mono }}>
                        Uploading...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-6 h-6 text-retro-text/20 group-hover:text-retro-accent/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-bold text-retro-text/40 group-hover:text-retro-accent transition-colors font-pixel uppercase tracking-widest" style={{ fontFamily: T.pixel }}>
                        UPLOAD IMAGE
                      </span>
                      <span className="text-[9px] text-retro-text/15 font-terminal uppercase" style={{ fontFamily: T.mono }}>
                        PNG, JPG up to 5MB
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </RetroCard>

          <RetroCard className="space-y-3">
            <h3
              className="text-xs font-black text-retro-accent uppercase tracking-widest font-pixel"
              style={{ fontFamily: T.pixel }}
            >
              CATEGORY
            </h3>
            <div className="relative border-2 border-retro-border bg-retro-bg">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none bg-transparent px-4 py-3 text-sm text-retro-text/70 focus:outline-none cursor-pointer font-terminal uppercase"
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
                  <option key={c} value={c} style={{ background: "#252525", color: "#E2E2D5" }}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-retro-text/30 pointer-events-none"
              />
            </div>
          </RetroCard>

          <RetroCard className="space-y-3">
            <h3
              className="text-xs font-black text-retro-accent uppercase tracking-widest font-pixel"
              style={{ fontFamily: T.pixel }}
            >
              TAGS
            </h3>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, node.js, tutorial"
              className="w-full bg-retro-bg border-2 border-retro-border px-4 py-3 text-xs text-retro-text placeholder-retro-text/15 focus:outline-none focus:border-retro-accent font-terminal"
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
                      className="px-2 py-0.5 border border-retro-accent text-retro-accent bg-retro-bg text-[10px] font-pixel uppercase"
                      style={{ fontFamily: T.pixel }}
                    >
                      {t}
                    </span>
                  ))}
              </div>
            )}
          </RetroCard>

          <RetroCard>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={12} className="text-retro-amber" />
              <h3
                className="text-xs font-black text-retro-accent uppercase tracking-widest font-pixel"
                style={{ fontFamily: T.pixel }}
              >
                WRITING TIPS
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
                  className="flex items-start gap-1 text-[11px] text-retro-text/40 font-terminal uppercase"
                  style={{ fontFamily: T.mono }}
                >
                  <div className="w-1.5 h-1.5 bg-retro-accent/40 mr-2 mt-1.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </RetroCard>
        </div>
      </div>
    </div>
  );
}
