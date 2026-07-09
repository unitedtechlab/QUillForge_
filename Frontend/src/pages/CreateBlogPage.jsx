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
  Trash2,
  Sparkles,
  Wand2
} from "lucide-react";
import api from "../api/axios";

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
      <label className="block text-xs font-pixel text-retro-accent tracking-widest uppercase">
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
    <div className={`border-2 border-retro-border bg-retro-surface p-5 rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E] ${className}`}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════
   CREATE BLOG PAGE COMPONENT
   ════════════════════════════════════════════════ */
export default function CreateBlogPage({ editingBlog, setEditingBlog, initialShowAI }) {
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

  // AI-Assisted Blogging States
  const [showAIWriter, setShowAIWriter] = useState(initialShowAI || false);
  const [aiSubject, setAiSubject] = useState("");
  const [aiTone, setAiTone] = useState("Professional");
  const [aiBlogType, setAiBlogType] = useState("Technical");
  const [aiContext, setAiContext] = useState("");
  const [savePreset, setSavePreset] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState("");

  // Sync AI writer visibility if initialShowAI changes
  useEffect(() => {
    if (initialShowAI) {
      setShowAIWriter(true);
    }
  }, [initialShowAI]);

  // Load presets on mount
  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await api.get("/blogs/ai-presets");
      if (res.data?.data) {
        setPresets(res.data.data);
      }
    } catch (e) {
      console.error("Failed to load presets:", e);
    }
  };

  const handlePresetChange = (presetId) => {
    setSelectedPresetId(presetId);
    if (!presetId) {
      setAiBlogType("Technical");
      setAiTone("Professional");
      setAiContext("");
      return;
    }
    const preset = presets.find((p) => p._id === presetId);
    if (preset) {
      setAiBlogType(preset.blogType || "Technical");
      setAiTone(preset.tone || "Professional");
      setAiContext(preset.contextTemplate || "");
    }
  };

  const handleDeletePreset = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this preset?")) return;
    try {
      await api.delete(`/blogs/ai-presets/${id}`);
      fetchPresets();
      if (selectedPresetId === id) {
        setSelectedPresetId("");
        setAiBlogType("Technical");
        setAiTone("Professional");
        setAiContext("");
      }
    } catch (e) {
      console.error("Failed to delete preset:", e);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiSubject.trim()) {
      setAiError("Please enter a subject/topic idea");
      return;
    }
    setAiError("");
    setGenerating(true);
    try {
      const res = await api.post("/blogs/ai-generate", {
        subject: aiSubject,
        tone: aiTone,
        blogType: aiBlogType,
        context: aiContext,
        savePreset,
        presetName: savePreset ? presetName : undefined
      });

      if (res.data?.data) {
        const { title: aiTitle, excerpt: aiExcerpt, content: aiContent, featuredImage: aiImg } = res.data.data;
        setTitle(aiTitle || "");
        setExcerpt(aiExcerpt || "");
        setContent(aiContent || "");
        setFeaturedImage(aiImg || "");

        // Collapse writing panel
        setShowAIWriter(false);
        setAiSubject("");
        if (savePreset) {
          fetchPresets();
          setSavePreset(false);
          setPresetName("");
        }
      }
    } catch (err) {
      console.error(err);
      setAiError(err.response?.data?.message || "AI Compilation failed. Check your quota limit.");
    } finally {
      setGenerating(false);
    }
  };

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
    "w-full bg-[#13141f] border-2 border-retro-border rounded-xl px-4 py-3 text-sm text-retro-text placeholder-retro-text/30 focus:outline-none focus:border-retro-accent transition-all font-terminal";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-retro-accent uppercase tracking-widest font-heading">
            {editingBlog ? "EDIT AUTHOR DESK" : "CREATE NEW DOCUMENT"}
          </h1>
          <p className="text-retro-text/30 text-xs font-terminal uppercase mt-1">
            Draft autosaves every 30 seconds
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 text-emerald-400 text-xs border border-emerald-400 bg-[#13141f] px-3 py-2 rounded-xl shadow-[2px_2px_0px_#1c1d2e] font-terminal uppercase">
            <CheckCircle2 size={12} /> SAVED SUCCESSFULLY
          </div>
        )}
        {recovered && (
          <div className="flex items-center gap-2 text-retro-accent text-xs border border-retro-accent bg-[#13141f] px-3 py-2 rounded-xl shadow-[2px_2px_0px_#1c1d2e] font-terminal uppercase">
            <CheckCircle2 size={12} /> UNSAVED DRAFT RECOVERED
          </div>
        )}
      </div>

      <div className="grid xl:grid-cols-[1fr_280px] gap-5">
        {/* Main editor */}
        <div className="space-y-4">
          {/* AI-Assisted Blogging Tool */}
          <RetroCard className="border-retro-accent shadow-[4px_4px_0px_0px_#8F72FF]">
            <div
              className="flex items-center justify-between cursor-pointer select-none"
              onClick={() => setShowAIWriter(!showAIWriter)}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-retro-accent animate-pulse" />
                <h3 className="text-xs font-bold text-retro-accent uppercase tracking-widest font-pixel">
                  AI Blog Assistant (Gemini 2.5 Flash)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {!showAIWriter && (
                  <span className="text-[9px] font-pixel text-retro-accent/60 border border-retro-accent/30 px-2 py-0.5 rounded-md uppercase">
                    Open Panel
                  </span>
                )}
                <ChevronDown
                  size={14}
                  className={`text-retro-accent transition-transform duration-300 ${showAIWriter ? "rotate-180" : ""}`}
                />
              </div>
            </div>

            {showAIWriter && (
              <div className="mt-4 pt-4 border-t border-retro-border/20 space-y-4 font-terminal">
                {/* Preset Row */}
                <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                  <Field label="Load Saved Preset">
                    <div className="relative border border-retro-border bg-[#13141f] rounded-xl overflow-hidden">
                      <select
                        value={selectedPresetId}
                        onChange={(e) => handlePresetChange(e.target.value)}
                        className="w-full appearance-none bg-transparent px-4 py-2.5 text-xs text-retro-text/70 focus:outline-none cursor-pointer uppercase"
                      >
                        <option value="">-- SELECT PRESET --</option>
                        {presets.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.presetName.toUpperCase()} ({p.blogType.toUpperCase()})
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={12}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-retro-text/30 pointer-events-none"
                      />
                    </div>
                  </Field>
                  {selectedPresetId && (
                    <button
                      type="button"
                      onClick={(e) => handleDeletePreset(e, selectedPresetId)}
                      className="p-2.5 border-2 border-red-500/40 hover:border-red-500 bg-[#13141f] text-red-500 rounded-xl transition-all cursor-pointer h-[38px] flex items-center justify-center"
                      title="Delete Preset"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* Subject Field */}
                <Field label="Blog Subject / Concept">
                  <input
                    type="text"
                    value={aiSubject}
                    onChange={(e) => setAiSubject(e.target.value)}
                    placeholder="e.g. How to use WebSockets in Node.js, Cozy Digital Aesthetics..."
                    className={inputCls}
                  />
                </Field>

                {/* Tone & Type Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Tone">
                    <div className="relative border border-retro-border bg-[#13141f] rounded-xl overflow-hidden">
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                        className="w-full appearance-none bg-transparent px-4 py-2.5 text-xs text-retro-text/70 focus:outline-none cursor-pointer uppercase"
                      >
                        {["Professional", "Casual", "Humorous", "Enthusiastic", "Academic"].map((t) => (
                          <option key={t} value={t}>
                            {t.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={12}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-retro-text/30 pointer-events-none"
                      />
                    </div>
                  </Field>

                  <Field label="Blog Type">
                    <div className="relative border border-retro-border bg-[#13141f] rounded-xl overflow-hidden">
                      <select
                        value={aiBlogType}
                        onChange={(e) => setAiBlogType(e.target.value)}
                        className="w-full appearance-none bg-transparent px-4 py-2.5 text-xs text-retro-text/70 focus:outline-none cursor-pointer uppercase"
                      >
                        {["Technical", "Tutorial", "Case Study", "Narrative", "Creative", "Opinion"].map((t) => (
                          <option key={t} value={t}>
                            {t.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={12}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-retro-text/30 pointer-events-none"
                      />
                    </div>
                  </Field>
                </div>

                {/* Additional Context */}
                <Field label="Additional context / points (optional)">
                  <textarea
                    value={aiContext}
                    onChange={(e) => setAiContext(e.target.value)}
                    rows={3}
                    placeholder="Include key points, structure, target audience, or specific examples..."
                    className={inputCls}
                  />
                </Field>

                {/* Save Preset Toggle */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={savePreset}
                      onChange={(e) => setSavePreset(e.target.checked)}
                      className="w-3.5 h-3.5 border-2 border-retro-border rounded bg-[#13141f] checked:bg-retro-accent checked:border-retro-accent cursor-pointer"
                    />
                    <span className="text-[10px] font-pixel text-retro-text/50 uppercase tracking-widest">
                      Save this config as preset
                    </span>
                  </label>

                  {savePreset && (
                    <input
                      type="text"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="e.g. My Tech Tutorial Preset"
                      className={`${inputCls} py-2 text-xs`}
                    />
                  )}
                </div>

                {/* Error Banner */}
                {aiError && (
                  <div className="text-[11px] font-terminal text-red-500 bg-[#13141f] border border-red-500/40 p-2.5 rounded-xl uppercase">
                    ERROR: {aiError}
                  </div>
                )}

                {/* Compile Button */}
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-retro-border bg-retro-accent text-[#1C1D2E] text-xs font-pixel rounded-xl uppercase tracking-widest hover:bg-retro-accent/80 transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_#1C1D2E] active:translate-y-[1px] disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      COMPILING SYSTEM DRAFT WITH GEMINI...
                    </>
                  ) : (
                    <>
                      <Wand2 size={12} />
                      COMPILE WITH GEMINI FLASH
                    </>
                  )}
                </button>
              </div>
            )}
          </RetroCard>

          <RetroCard className="space-y-5">
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
              <div className="flex items-center gap-0 border-2 border-retro-border bg-[#13141f] rounded-xl overflow-hidden focus-within:border-retro-accent transition-all">
                <span className="px-3 py-3 text-xs text-retro-text/30 bg-retro-surface border-r-2 border-retro-border flex-shrink-0 flex items-center gap-1.5 font-terminal">
                  <Hash size={11} /> quill.io/blog/
                </span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-retro-accent placeholder-retro-text/20 focus:outline-none font-terminal"
                />
                <button
                  onClick={() =>
                    navigator.clipboard?.writeText(`quill.io/blog/${slug}`)
                  }
                  className="px-3 text-retro-text/30 hover:text-retro-accent transition-colors cursor-pointer"
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
              />
              <p className="text-right text-retro-text/20 text-[10px] mt-1 font-terminal">
                {excerpt.length}/160 CHARS
              </p>
            </Field>

            <Field label="Content">
              <div className="flex items-center gap-1.5 flex-wrap mb-2 p-2 bg-[#13141f] border-2 border-retro-border rounded-t-xl border-b-0">
                {[
                  ["B", "font-bold"],
                  ["I", "italic"],
                  ["U", "underline"],
                ].map(([l, cls]) => (
                  <button
                    key={l}
                    className={`w-7 h-7 border border-retro-border bg-retro-surface text-retro-text/40 hover:text-retro-accent hover:border-retro-accent text-xs transition-all font-pixel rounded-lg ${cls}`}
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
                    className="w-7 h-7 border border-retro-border bg-retro-surface text-retro-text/30 hover:text-retro-accent hover:border-retro-accent flex items-center justify-center transition-all rounded-lg"
                  >
                    {t.icon}
                  </button>
                ))}
                <div className="ml-auto text-retro-text/20 text-[10px] pr-1 font-terminal">
                  {content.split(/\s+/).filter(Boolean).length} WORDS
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                placeholder="Start writing your blog post here…&#10;&#10;Use markdown formatting:&#10;# Heading 1&#10;## Heading 2&#10;**bold**, *italic*, `code`&#10;&#10;> Blockquote"
                className="w-full bg-[#13141f] border-2 border-retro-border rounded-b-xl px-5 py-4 text-sm text-retro-text placeholder-retro-text/15 focus:outline-none focus:border-retro-accent transition-all resize-none leading-relaxed font-terminal"
              />
            </Field>
          </RetroCard>
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          <RetroCard className="space-y-4">
            <h3 className="text-xs font-bold text-retro-accent uppercase tracking-widest font-pixel">
              SETTINGS
            </h3>

            <div className="flex items-center justify-between p-3 border border-retro-border bg-[#13141f] rounded-xl">
              <div>
                <p className="text-retro-text/70 text-xs font-semibold uppercase font-terminal">
                  STATUS
                </p>
                <p className="text-retro-text/30 text-[10px] uppercase font-terminal">
                  {pub ? "Live on site" : "Draft"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPub(!pub)}
                className={`relative w-11 h-6 transition-all duration-300 border-2 rounded-full cursor-pointer ${pub ? "bg-retro-accent border-retro-accent" : "bg-[#13141f] border-retro-border"}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 transition-all duration-200 rounded-full ${pub ? "right-0.5 bg-retro-surface" : "left-0.5 bg-retro-text/40"}`}
                />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-retro-border bg-[#13141f] text-retro-text/75 hover:text-retro-accent hover:border-retro-accent text-xs font-pixel rounded-xl uppercase tracking-widest transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_#1C1D2E] active:translate-y-[1px]"
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
              <button
                onClick={() => handleSave(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-retro-border bg-retro-accent text-[#1C1D2E] text-xs font-pixel rounded-xl uppercase tracking-widest hover:bg-retro-accent/80 transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_#1C1D2E] active:translate-y-[1px]"
              >
                <Send size={12} /> PUBLISH BLOG
              </button>
            </div>
          </RetroCard>

          <RetroCard className="space-y-3">
            <h3 className="text-xs font-bold text-retro-accent uppercase tracking-widest font-pixel">
              FEATURED IMAGE
            </h3>
            
            {featuredImage ? (
              <div className="space-y-3">
                <div className="relative border border-retro-border aspect-video bg-[#13141f] rounded-xl overflow-hidden">
                  <img
                    src={featuredImage}
                    alt="Featured preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setFeaturedImage("")}
                    className="absolute top-2 right-2 p-1.5 bg-[#13141f]/80 hover:bg-[#13141f] text-retro-accent hover:text-retro-text border border-retro-border rounded-xl transition-colors cursor-pointer"
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
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-retro-border hover:border-retro-accent p-6 cursor-pointer bg-[#13141f] hover:bg-[#1C1D2E] rounded-xl transition-all group">
                  {uploadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw size={18} className="text-retro-accent animate-spin" />
                      <span className="text-[10px] font-medium text-retro-text/40 font-terminal uppercase">
                        Uploading...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-6 h-6 text-retro-text/20 group-hover:text-retro-accent/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] font-bold text-retro-text/40 group-hover:text-retro-accent transition-colors font-pixel uppercase tracking-widest">
                        UPLOAD IMAGE
                      </span>
                      <span className="text-[9px] text-retro-text/15 font-terminal uppercase">
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
            <h3 className="text-xs font-bold text-retro-accent uppercase tracking-widest font-pixel">
              CATEGORY
            </h3>
            <div className="relative border border-retro-border bg-[#13141f] rounded-xl overflow-hidden">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none bg-transparent px-4 py-3 text-sm text-retro-text/70 focus:outline-none cursor-pointer font-terminal uppercase"
              >
                {[
                  "Technology",
                  "Design",
                  "Dev",
                  "Lifestyle",
                  "Business",
                  "Opinion",
                ].map((c) => (
                  <option key={c} value={c} style={{ background: "#13141f", color: "#E2E2F5" }}>
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
            <h3 className="text-xs font-bold text-retro-accent uppercase tracking-widest font-pixel">
              TAGS
            </h3>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="react, node.js, tutorial"
              className="w-full bg-[#13141f] border border-retro-border rounded-xl px-4 py-3 text-xs text-retro-text placeholder-retro-text/15 focus:outline-none focus:border-retro-accent font-terminal"
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
                      className="px-2 py-0.5 border border-retro-accent text-retro-accent bg-[#13141f] text-[9px] font-pixel uppercase rounded-lg"
                    >
                      {t}
                    </span>
                  ))}
              </div>
            )}
          </RetroCard>

          <RetroCard>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={12} className="text-retro-accent" />
              <h3 className="text-xs font-bold text-retro-accent uppercase tracking-widest font-pixel">
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
                >
                  <div className="w-1.5 h-1.5 bg-retro-accent/40 mr-2 mt-1.5 rounded-full flex-shrink-0" />
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
