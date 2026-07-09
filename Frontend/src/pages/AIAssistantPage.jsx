import { useState, useEffect } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Trash2,
  Sparkles,
  Wand2,
  RefreshCw
} from "lucide-react";
import api from "../api/axios";

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
    <div className={`border-2 border-retro-border bg-retro-surface p-6 rounded-2xl shadow-[4px_4px_0px_0px_#1C1D2E] ${className}`}>
      {children}
    </div>
  );
}

export default function AIAssistantPage({ onGenerateSuccess }) {
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
        const { title, excerpt, content, featuredImage } = res.data.data;
        
        // Pass the generated blog data back to Dashboard to load into editor
        onGenerateSuccess({
          title: title || "",
          excerpt: excerpt || "",
          content: content || "",
          featuredImage: featuredImage || "",
          category: "Technology",
          tags: ""
        });

        // Reset local form states
        setAiSubject("");
        setAiContext("");
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

  const inputCls =
    "w-full bg-[#13141f] border-2 border-retro-border rounded-xl px-4 py-3 text-sm text-retro-text placeholder-retro-text/30 focus:outline-none focus:border-retro-accent transition-all font-terminal";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 border-2 border-[#FF728F] bg-[#13141f] rounded-2xl flex items-center justify-center text-[#FF728F] shadow-[3px_3px_0px_#1C1D2E]">
          <Sparkles size={22} className="animate-pulse" />
        </div>
        <div>
          <h1 className="text-4xl sm:text-5xl font-black text-retro-accent uppercase tracking-widest font-heading">
            AI BLOG ASSISTANT
          </h1>
          <p className="text-retro-text/30 text-xs font-terminal uppercase mt-1">
            POWERED BY GOOGLE GEMINI 2.5 FLASH
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <RetroCard className="border-[#FF728F] shadow-[6px_6px_0px_0px_#1C1D2E] space-y-5">
          <div className="flex items-center gap-2 border-b border-retro-border/20 pb-3">
            <Sparkles size={16} className="text-[#FF728F] animate-pulse" />
            <h2 className="text-xs font-bold text-retro-accent uppercase tracking-widest font-pixel">
              CONFIGURE AI GENERATION ENGINE
            </h2>
          </div>

          <div className="space-y-4 font-terminal">
            {/* Preset Row */}
            <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
              <Field label="Load Saved Preset">
                <div className="relative border border-retro-border bg-[#13141f] rounded-xl overflow-hidden">
                  <select
                    value={selectedPresetId}
                    onChange={(e) => handlePresetChange(e.target.value)}
                    className="w-full appearance-none bg-transparent px-4 py-3 text-xs text-retro-text/70 focus:outline-none cursor-pointer uppercase"
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
                  className="p-3 border-2 border-red-500/40 hover:border-red-500 bg-[#13141f] text-red-500 rounded-xl transition-all cursor-pointer h-[42px] flex items-center justify-center"
                  title="Delete Preset"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Subject Field */}
            <Field label="Blog Subject / Topic Idea">
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
                    className="w-full appearance-none bg-transparent px-4 py-3 text-xs text-retro-text/70 focus:outline-none cursor-pointer uppercase"
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
                    className="w-full appearance-none bg-transparent px-4 py-3 text-xs text-retro-text/70 focus:outline-none cursor-pointer uppercase"
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
            <Field label="Additional context / key points (optional)">
              <textarea
                value={aiContext}
                onChange={(e) => setAiContext(e.target.value)}
                rows={4}
                placeholder="Include target audience, specific guidelines, examples, or must-have sections..."
                className={inputCls}
              />
            </Field>

            {/* Save Preset Toggle */}
            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={savePreset}
                  onChange={(e) => setSavePreset(e.target.checked)}
                  className="w-4.5 h-4.5 border-2 border-retro-border rounded bg-[#13141f] checked:bg-retro-accent checked:border-retro-accent cursor-pointer"
                />
                <span className="text-[10px] font-pixel text-retro-text/50 uppercase tracking-widest">
                  Save this configuration as a preset
                </span>
              </label>

              {savePreset && (
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="e.g. Technical Tutorial Preset"
                  className={`${inputCls} py-2.5 text-xs`}
                />
              )}
            </div>

            {/* Error Banner */}
            {aiError && (
              <div className="text-[11px] font-terminal text-red-500 bg-[#13141f] border border-red-500/40 p-3 rounded-xl uppercase">
                ERROR: {aiError}
              </div>
            )}

            {/* Compile Button */}
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-[#FF728F] bg-[#FF728F] text-[#1C1D2E] text-xs font-pixel rounded-xl uppercase tracking-widest hover:bg-[#FF728F]/80 transition-all duration-200 cursor-pointer shadow-[3px_3px_0px_#1C1D2E] active:translate-y-[1px] disabled:opacity-50 mt-4"
            >
              {generating ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  COMPILING SYSTEM DRAFT WITH GEMINI FLASH...
                </>
              ) : (
                <>
                  <Wand2 size={12} />
                  COMPILE WITH GEMINI FLASH & PRE-FILL WRITER DESK
                </>
              )}
            </button>
          </div>
        </RetroCard>
      </div>
    </div>
  );
}
