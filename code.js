import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { useSeekContext } from "@/lib/SeekContext";
import { 
  Sparkles, Send, Trash2, Globe, Video, FileText,
  ChevronRight, ExternalLink, X, Loader2, Zap, 
  Brain, Copy, Check, AlertCircle, Lock, Image as ImageIcon,
  Clock, Search, Square, Layers, Save, CheckCircle2,
  Volume2, VolumeX, Mic, Download, Share2
} from "lucide-react";
import { useVoiceInput, speakText, cancelSpeech } from "@/hooks/useVoiceInput";
import ReactMarkdown from "react-markdown";
import MermaidChart from "@/components/MermaidChart";
import { toast } from "sonner";
import DraggableFolderModal from "@/components/FolderDraggableModal";
import PromptAssistantModal from "@/components/chat/PromptAssistantModal";

const loadingPhrases = [
  "Analisi della query in corso...",
  "Ricerca sul web...",
  "Raccolta fonti autorevoli...",
  "Elaborazione risultati...",
  "Generazione risposta...",
];

function SearchingScreen({ query, elapsedTime, onCancel }) {
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIdx(prev => (prev + 1) % loadingPhrases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key="searching"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-ping opacity-20" />
        <div className="absolute -inset-2 rounded-full border-2 border-purple-400/30 animate-pulse" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ricerca in corso</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 max-w-xs">"{query}"</p>
      <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-6">⏱️ {elapsedTime}s</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={phraseIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700"
        >
          <Loader2 className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin shrink-0" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{loadingPhrases[phraseIdx]}</span>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-purple-400" style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>

      <button onClick={onCancel} className="mt-8 px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all flex items-center gap-2">
        <Square className="w-4 h-4" /> Annulla
      </button>
    </motion.div>
  );
}

function HistoryModal({ history, onClose, onLoad, onDelete, onClearAll, saveToLibrary }) {
   const [savingId, setSavingId] = useState(null);
   const [savedId, setSavedId] = useState(null);

   const handleSave = async (e, item) => {
     e.stopPropagation();
     setSavingId(item.id);
     try {
       await saveToLibrary(item, "conversation");
       setSavedId(item.id);
       setTimeout(() => setSavedId(null), 2000);
     } finally {
       setTimeout(() => setSavingId(null), 1000);
     }
   };

   const largeCount = history.filter(h => h.seek_mode === "large").length;
   const speedCount = history.length - largeCount;

   return (
     <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
       className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center px-4 pb-4 pt-16"
       onClick={onClose}
     >
       <motion.div
         initial={{ scale: 0.92, y: 30 }}
         animate={{ scale: 1, y: 0 }}
         exit={{ scale: 0.92, y: 30 }}
         transition={{ type: "spring", damping: 25, stiffness: 300 }}
         className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border-2 border-slate-200 dark:border-slate-700"
         onClick={e => e.stopPropagation()}
       >
         {/* Header con gradiente animato */}
         <div className="px-5 sm:px-6 py-[60px] sm:py-[64px] border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
           <div className="relative flex flex-wrap items-center justify-between gap-4">
             <div className="flex items-center gap-3 flex-1 min-w-0">
               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl shrink-0">
                 <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
               </div>
               <div className="min-w-0 flex-1">
                 <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5 leading-tight">Cronologia Ricerche</h3>
                 <div className="flex items-center gap-2 text-xs text-white/80 flex-wrap">
                   <span className="font-semibold">{history.length} ricerche</span>
                   {history.length > 0 && (
                     <>
                       <span className="text-white/60 mx-1">•</span>
                       <span className="flex items-center gap-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-purple-200" />
                         <span>{largeCount} Large</span>
                       </span>
                       <span className="text-white/60 mx-1">•</span>
                       <span className="flex items-center gap-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-blue-200" />
                         <span>{speedCount} Speed</span>
                       </span>
                     </>
                   )}
                 </div>
               </div>
             </div>
             <div className="flex items-center gap-1.5 shrink-0">
               {history.length > 0 && (
                 <button
                   onClick={onClearAll}
                   className="p-2 rounded-lg sm:p-2.5 sm:rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all text-white flex-shrink-0"
                   title="Cancella cronologia"
                 >
                   <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                 </button>
               )}
               <button
                 onClick={onClose}
                 className="p-2 rounded-lg sm:p-2.5 sm:rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all flex-shrink-0"
                 title="Chiudi"
               >
                 <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
               </button>
             </div>
           </div>
         </div>

         {/* Content con scrollbar personalizzata */}
         <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-3 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
           {history.length === 0 ? (
             <div className="text-center py-16">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
                 <Clock className="w-8 h-8 text-blue-500 dark:text-blue-400" />
               </div>
               <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Nessuna ricerca</p>
               <p className="text-sm text-slate-500 dark:text-slate-400">Le tue ricerche appariranno qui</p>
             </div>
           ) : (
             history.map((item, idx) => (
               <motion.div
                 key={item.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: idx * 0.03 }}
                 whileHover={{ scale: 1.01, x: 2 }}
                 className="group relative flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer shadow-sm hover:shadow-lg"
                 onClick={() => { onLoad(item); onClose(); }}
               >
                 {/* Icona con gradiente */}
                 <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 flex items-center justify-center shrink-0 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all">
                   <Search className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                 </div>

                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors leading-snug">
                     {item.query}
                   </p>
                   <div className="flex flex-wrap items-center gap-2 mt-2.5">
                     <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg ${
                       item.seek_mode === "large"
                         ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                         : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                     }`}>
                       {item.seek_mode === "large" ? <><Brain className="w-3.5 h-3.5" /> Large</> : <><Zap className="w-3.5 h-3.5" /> Speed</>}
                     </span>
                     <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                       <Clock className="w-3 h-3" />
                       {new Date(item.created_at || item.created_date).toLocaleDateString("it-IT", {
                         day: "2-digit",
                         month: "short",
                         hour: "2-digit",
                         minute: "2-digit"
                       })}
                     </span>
                   </div>
                 </div>

                 {/* Action buttons */}
                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                   <button
                     onClick={(e) => handleSave(e, item)}
                     disabled={savingId === item.id || savedId === item.id}
                     className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
                       savedId === item.id
                         ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                         : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                     }`}
                     title={savingId === item.id ? "Salvataggio..." : savedId === item.id ? "Salvato!" : "Salva in Documenti"}
                   >
                     {savedId === item.id ? (
                       <Check className="w-4 h-4" />
                     ) : savingId === item.id ? (
                       <Loader2 className="w-4 h-4 animate-spin" />
                     ) : (
                       <FileText className="w-4 h-4" />
                     )}
                   </button>
                   <button
                     onClick={e => { e.stopPropagation(); onDelete(item.id); }}
                     className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                     title="Elimina"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </motion.div>
             ))
           )}
         </div>
       </motion.div>
     </motion.div>
   );
 }

export default function NeuralaiSeekLanding({ isPremium = false, isPremiumPlus = false }) {
  const { activeSearch, startSearch, cancelSearch, clearResult } = useSeekContext();
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [searchMode, setSearchMode] = useState("speed");
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectedWebs, setSelectedWebs] = useState([]);
  const [userDocs, setUserDocs] = useState([]);
  const [userWebs, setUserWebs] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [showVideoSourcesModal, setShowVideoSourcesModal] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState(null);
  const [savedSourceUrl, setSavedSourceUrl] = useState(null);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [concatenatedHistory, setConcatenatedHistory] = useState([]);
  const [enableConcatenation, setEnableConcatenation] = useState(false);
  const [enableVideoSearch, setEnableVideoSearch] = useState(false);
  const [showPremiumWarning, setShowPremiumWarning] = useState(false);
  const [dismissedWarning, setDismissedWarning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [selectedDocFolders, setSelectedDocFolders] = useState([]);
  const [selectedWebFolders, setSelectedWebFolders] = useState([]);
  const [uiPhase, setUiPhase] = useState("idle");
  const [speaking, setSpeaking] = useState(false);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [showMobilePromptModal, setShowMobilePromptModal] = useState(false);
  const premiumWarningTimerRef = useRef(null);
  const elapsedIntervalRef = useRef(null);
  const resultRef = useRef(null);
  const inputRef = useRef(null);
  
  // Usa lo stato dal contesto
  const loading = activeSearch?.status === 'searching';
  const [historyResult, setHistoryResult] = useState(null);
  const currentResult = activeSearch?.status === 'completed' ? activeSearch.result : historyResult;
  
  const { listening, startListening, stopListening } = useVoiceInput({
    onResult: (text) => setQuery(text),
    lang: "it-IT"
  });

  const isFreeUser = !isPremium && !isPremiumPlus;

  useEffect(() => {
    if (history.length > 0) {
      try { localStorage.setItem("seek_history", JSON.stringify(history.slice(0, 50))); } catch {}
    }
  }, [history]);

  useEffect(() => {
    if (loading && activeSearch?.startTime) {
      elapsedIntervalRef.current = setInterval(() => {
        setElapsedTime(Math.round((Date.now() - activeSearch.startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(elapsedIntervalRef.current);
  }, [loading, activeSearch?.startTime]);

  useEffect(() => {
    const handler = (e) => setQuery(e.detail);
    window.addEventListener("insert-prompt", handler);
    return () => window.removeEventListener("insert-prompt", handler);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await base44.auth.me();
        setUserEmail(user.email);
        try {
          const saved = localStorage.getItem("seek_history");
          if (saved) setHistory(JSON.parse(saved));
        } catch {}
        const [docs, webs, conversations] = await Promise.all([
          base44.entities.UserDocument.filter({ user_email: user.email }),
          base44.entities.UserWebSource.filter({ user_email: user.email, status: "ok" }),
          base44.entities.SeekConversation.filter({ user_email: user.email }, "-created_at", 50)
        ]);
        setUserDocs(docs.filter(d => d.content_text));
        setUserWebs(webs.filter(w => w.content_text));
        setHistory(conversations);
      } catch (err) {
        console.error("Errore init:", err.message);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isFreeUser) setSearchMode("speed");
  }, [isFreeUser]);

  useEffect(() => {
    if (searchMode === "speed") setEnableVideoSearch(false);
  }, [searchMode]);

  const handleCancel = () => {
    cancelSearch();
    setElapsedTime(0);
    setUiPhase("idle");
    toast.success("Ricerca annullata");
  };

  const handleSearch = async (searchQuery = query, mode = searchMode, videoSearch = enableVideoSearch, concat = enableConcatenation, histConcat = [], docCtx = "", webCtx = "", genImage = false, genVideo = false) => {
    if (!searchQuery.trim()) return;
    
    window.__NEURALAI_SEEK_LARGE_SEARCH_ACTIVE__ = mode === "large";
    
    setUiPhase("searching");
    setError("");
    setShowFollowUp(false);
    setElapsedTime(0);
    clearResult();

    let docContext = docCtx || "";
    let webContext = webCtx || "";
    if (!docContext && selectedDocFolders.length > 0) {
      docContext = userDocs.filter(d => selectedDocFolders.includes(d.folder || "Generale")).map(d => `### ${d.name}\n${d.content_text?.slice(0, 3000) || ''}`).join('\n\n');
    } else if (!docContext) {
      docContext = selectedDocs.map(d => `### ${d.name}\n${d.content_text?.slice(0, 3000) || ''}`).join('\n\n');
    }
    if (!webContext && selectedWebFolders.length > 0) {
      webContext = userWebs.filter(w => selectedWebFolders.includes(w.folder || "Generale")).map(w => `### ${w.name || w.url}\n${w.content_text?.slice(0, 3000) || ''}`).join('\n\n');
    } else if (!webContext) {
      webContext = selectedWebs.map(w => `### ${w.name || w.url}\n${w.content_text?.slice(0, 3000) || ''}`).join('\n\n');
    }
    const historyForConcat = concat ? (histConcat.length > 0 ? histConcat : concatenatedHistory.slice(-3)) : [];

    // Avvia ricerca in background tramite contesto
    await startSearch(
      searchQuery,
      mode,
      videoSearch,
      concat,
      historyForConcat,
      docContext,
      webContext,
      genImage,
      genVideo
    );

    setUiPhase("complete");
    setTimeout(() => setUiPhase("idle"), 300);
    if (mode === "large") {
      window.__NEURALAI_SEEK_LARGE_SEARCH_ACTIVE__ = false;
    }
  };

  const handleLoadHistoryItem = (item) => {
    setQuery(item.query);
    setHistoryResult(item);
    // Forza il rendering del risultato
    setTimeo
// === MODIFICHE CHUNK 1 (posizione 0-20000) ===
// POSIZIONE: All'interno del componente HistoryModal, riga 108 circa, nella definizione del div dell'header
         {/* Header con gradiente animato */}
         <div className="px-5 sm:px-6 py-[110px] sm:py-[114px] border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
// FINE_MODIFICA
// === FINE MODIFICHE ===
ut(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteHistory = async (id) => {
    try {
      await base44.entities.SeekConversation.delete(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      toast.success("Ricerca eliminata");
    } catch (err) {
      if (err.message?.includes("not found")) {
        setHistory(prev => prev.filter(h => h.id !== id));
        toast.success("Ricerca eliminata");
      } else {
        toast.error("Errore nell'eliminazione");
      }
    }
  };

  const handleClearAllHistory = async () => {
    for (const h of history) {
      try { await base44.entities.SeekConversation.delete(h.id); } catch {}
    }
    setHistory([]);
    toast.success("Cronologia eliminata");
  };

  const handleSelectDoc = (doc) => {
    setSelectedDocs(prev => prev.find(d => d.id === doc.id) ? prev.filter(d => d.id !== doc.id) : [...prev, doc]);
  };

  const handleSelectWeb = (web) => {
    setSelectedWebs(prev => prev.find(w => w.id === web.id) ? prev.filter(w => w.id !== web.id) : [...prev, web]);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Copiato!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleFollowUpClick = (q) => {
    setQuery(q);
    setTimeout(() => handleSearch(q), 100);
  };

  const handleCopyAnswer = () => {
    if (!currentResult?.answer) return;
    navigator.clipboard.writeText(currentResult.answer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
    toast.success("Copiato!");
  };

  const handleListen = () => {
    if (!currentResult?.answer) return;
    if (speaking) {
      cancelSpeech();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speakText(currentResult.answer, { lang: "it-IT", onEnd: () => setSpeaking(false) });
    }
  };

  const handleDownloadHTML = async () => {
    if (!currentResult) return;
    try {
      const response = await base44.functions.invoke("exportDeepResearchHTML", {
        query: currentResult.query,
        answer: currentResult.answer,
        sources: currentResult.sources || [],
        images: []
      });
      const blob = new Blob([response.data], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `neuralai-seek-${new Date().getTime()}.html`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
      toast.success("HTML scaricato!");
    } catch (err) {
      toast.error("Errore nel download");
      console.error(err);
    }
  };

  const saveGeneratedMediaToHistory = async (baseResult, mediaUrl, type) => {
    try {
      if (!userEmail) return;
      
      // Salva in SeekConversation (già esistente)
      await base44.entities.SeekConversation.create({
        user_email: userEmail,
        query: `${baseResult.query} - ${type === 'image' ? 'Immagine generata' : 'Video generato'}`,
        answer: baseResult.answer,
        seek_mode: baseResult.seek_mode,
        sources: baseResult.sources || [],
        video_sources: baseResult.video_sources || [],
        created_at: new Date().toISOString(),
        ...(type === 'image' ? { image_url: mediaUrl } : { video_url: mediaUrl })
      });
      
      // Salva nelle entità specifiche GeneratedImage/GeneratedVideo
      if (type === 'image') {
        await base44.entities.GeneratedImage.create({
          user_email: userEmail,
          prompt: baseResult.query,
          image_url: mediaUrl
        });
      } else if (type === 'video') {
        await base44.entities.GeneratedVideo.create({
          user_email: userEmail,
          prompt: baseResult.query,
          video_url: mediaUrl,
          aspect_ratio: "16:9",
          duration: 6
        });
      }
      
      const newEntry = {
        ...baseResult,
        query: `${baseResult.query} - ${type === 'image' ? 'Immagine generata' : 'Video generato'}`,
        created_at: new Date().toISOString(),
        ...(type === 'image' ? { image_url: mediaUrl } : { video_url: mediaUrl })
      };
      
      setHistory(prev => [newEntry, ...prev]);
      toast.success(`${type === 'image' ? 'Immagine' : 'Video'} generato e salvato in cronologia!`);
    } catch (err) {
      console.error('Errore salvataggio media:', err);
      toast.error(`Errore nel salvataggio: ${err.message}`);
    }
  };

  const saveToLibrary = async (item, type = "conversation") => {
    try {
      if (!userEmail) {
        toast.error("⚠️ Email utente non trovata. Ricarica la pagina.");
        return;
      }
      
      const folderName = "Neuralai Seek";
      
      if (type === "conversation") {
        const name = `Ricerca - ${item.query.slice(0, 50)}${item.query.length > 50 ? '...' : ''}`;
        const content = `# ${item.query}\n\nModalità: ${item.seek_mode}\nData: ${new Date(item.created_at || item.created_date).toLocaleString('it-IT')}\n\n${item.answer || ''}`;
        const file = new File([content], `${name.replace(/[^a-z0-9]/gi, '_')}.txt`, { type: "text/plain" });
        const uploaded = await base44.integrations.Core.UploadFile({ file });
        await base44.entities.UserDocument.create({
          user_email: userEmail,
          name: name,
          file_url: uploaded.file_url,
          content_text: content.slice(0, 20000),
          folder: folderName,
          tags: ["neuralai-seek", "ricerca", item.seek_mode]
        });
        toast.success("✅ Ricerca salvata in Documenti → Neuralai Seek");
      } else if (type === "web_source") {
        const existing = await base44.entities.UserWebSource.filter({ user_email: userEmail, url: item.url });
        if (existing.length > 0) { 
          toast.info("⚠️ Fonte già presente nella libreria"); 
          return; 
        }
        await base44.entities.UserWebSource.create({
          user_email: userEmail,
          url: item.url,
          name: item.title || item.url,
          content_text: (item.content_text || `Fonte: ${item.title || item.url}`).slice(0, 20000),
          folder: folderName,
          status: "ok",
          auto_refresh: false
        });
        setSavedSourceUrl(item.url);
        setTimeout(() => setSavedSourceUrl(null), 2000);
        toast.success("✅ Fonte Web salvata in Siti Web → Neuralai Seek");
      } else if (type === "video_source") {
        const existing = await base44.entities.UserWebSource.filter({ user_email: userEmail, url: item.url });
        if (existing.length > 0) { 
          toast.info("⚠️ Video già presente nella libreria"); 
          return; 
        }
        await base44.entities.UserWebSource.create({
          user_email: userEmail,
          url: item.url,
          name: item.title || `Video: ${item.url}`,
          content_text: `Video: ${item.title || item.url}\nCanale: ${item.channel || 'N/D'}`.slice(0, 20000),
          folder: folderName,
          status: "ok",
          auto_refresh: false
        });
        setSavedSourceUrl(item.url);
        setTimeout(() => setSavedSourceUrl(null), 2000);
        toast.success("✅ Video salvato in Siti Web → Neuralai Seek");
      }
    } catch (err) {
      toast.error(`❌ Errore: ${err.message || "Riprova."}`);
    }
  };

  // Render sections as separate components for cleaner JSX
  const renderResults = () => (
    <motion.div
      key="results"
      ref={resultRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-5 pb-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
      >
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{currentResult.query}</h2>
              {currentResult.seek_mode === "large" && (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold shadow-md">
                  LARGE
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentResult.answer_file_url && (
              <a href={currentResult.answer_file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all">
                <FileText className="w-4 h-4" /> Risposta Completa
              </a>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={handleCopyAnswer}
            disabled={copiedAnswer}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              copiedAnswer
                ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            {copiedAnswer ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedAnswer ? "Copiato!" : "Copia"}
          </button>
          <button
            onClick={handleListen}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              speaking
                ? "bg-orange-500 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {speaking ? "Stop" : "Ascolta"}
          </button>
          <button
            onClick={handleDownloadHTML}
            disabled={downloaded}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-md ${
              downloaded
                ? "bg-gradient-to-r from-emerald-500 to-green-600"
                : "bg-gradient-to-r from-blue-500 to-cyan-600 hover:opacity-90"
            }`}
          >
            {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            {downloaded ? "Scaricato!" : "Scarica HTML"}
          </button>
        </div>
        {/* Separo conclusioni dal resto del contenuto */}
        {(() => {
          if (!currentResult?.answer) return null;
          const conclusionMatch = currentResult.answer.match(/([\s\S]*?)(##\s*(?:📊\s*)?Conclusione(?:ioni)?[\s\S]*)$/i);
          const mainContent = conclusionMatch ? conclusionMatch[1].trim() : currentResult.answer;
          const conclusionSection = conclusionMatch ? conclusionMatch[2] : null;
          
          return (
            <>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-slate-900 dark:text-white">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-bold mt-5 mb-3 text-slate-900 dark:text-white">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-2 text-slate-900 dark:text-white">{children}</h3>,
                  p: ({ children }) => <p className="my-3 text-slate-700 dark:text-slate-300 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-3 ml-6 list-disc text-slate-700 dark:text-slate-300">{children}</ul>,
                  ol: ({ children }) => <ol className="my-3 ml-6 list-decimal text-slate-700 dark:text-slate-300">{children}</ol>,
                  li: ({ children }) => <li className="my-1 text-slate-700 dark:text-slate-300">{children}</li>,
                  code: ({ node, inline, className, children }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isMermaid = className?.includes('mermaid');
                    if (isMermaid) {
                      return <div className="my-6 p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-lg"><MermaidChart chart={String(children).trim()} /></div>;
                    }
                    return inline ? <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code> : (
                      <div className="relative group my-4">
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto"><code className="text-sm font-mono">{children}</code></pre>
                        <button onClick={() => handleCopyCode(children)} className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all">
                          {copiedCode === children ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
                        </button>
                      </div>
                    );
                  },
                  blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-r-lg">{children}</blockquote>,
                }}>{mainContent}</ReactMarkdown>
              </div>
              
              {conclusionSection && (
                <div className="mt-8 pt-6 border-t-2 border-slate-200 dark:border-slate-700">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 shadow-lg">
                    <ReactMarkdown components={{
                      h2: ({ children }) => <h2 className="text-lg font-bold mb-4 text-blue-900 dark:text-blue-100 flex items-center gap-2"><Sparkles className="w-5 h-5" />{children}</h2>,
                      h3: ({ children }) => <h3 className="text-base font-bold mt-3 mb-2 text-blue-800 dark:text-blue-200">{children}</h3>,
                      p: ({ children }) => <p className="my-2 text-blue-900 dark:text-blue-100 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="my-3 ml-6 list-disc text-blue-900 dark:text-blue-100">{children}</ul>,
                      ol: ({ children }) => <ol className="my-3 ml-6 list-decimal text-blue-900 dark:text-blue-100">{children}</ol>,
                      li: ({ children }) => <li className="my-1.5 text-blue-900 dark:text-blue-100">{children}</li>,
                    }}>{conclusionSection}</ReactMarkdown>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </motion.div>

      {showFollowUp && followUpQuestions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><Brain className="w-4 h-4 text-purple-500" /> Ricerche consigliate</h3>
          <div className="space-y-2">
            {followUpQuestions.map((q, i) => (
              <button key={i} onClick={() => handleFollowUpClick(q)} className="w-full text-left px-4 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 border border-purple-100 dark:border-slate-600 transition-all group">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 flex-1">{q}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sezione Fonti Web - Anteprima con modale */}
      {currentResult.sources && currentResult.sources.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Fonti Web ({currentResult.sources.length})</h3>
            </div>
            <button onClick={() => setShowSourcesModal(true)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              Vedi tutti <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentResult.sources.slice(0, 4).map((source, i) => (
              <div key={i} className="group flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-slate-600 transition-all">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-300">{source.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{source.displayLink}</p>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-flex items-center gap-1">
                    Visita <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sezione Video Sources - Solo anteprime */}
      {currentResult.video_sources && currentResult.video_sources.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                <Video className="w-4 h-4 text-pink-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Video Trovati ({currentResult.video_sources.length})</h3>
            </div>
            <button onClick={() => setShowVideoSourcesModal(true)} className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1">
              Vedi tutti <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentResult.video_sources.slice(0, 4).map((video, i) => (
              <div key={i} className="group flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-pink-50 dark:hover:bg-slate-600 transition-all">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt="" className="w-24 h-16 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-24 h-16 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6 text-pink-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-300">{video.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{video.channel || 'YouTube'}</p>
                  <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline mt-1 inline-flex items-center gap-1">
                    Guarda <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {currentResult.image_url && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-blue-500" /><span className="font-bold text-sm text-slate-900 dark:text-white">Immagine generata</span></div>
          <img src={currentResult.image_url} alt="Generated" className="w-full object-cover" />
        </motion.div>
      )}

      {currentResult.video_url && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2"><Video className="w-4 h-4 text-pink-500" /><span className="font-bold text-sm text-slate-900 dark:text-white">Video generato</span></div>
          <video src={currentResult.video_url} controls className="w-full" />
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 overflow-x-hidden" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 70px)' }}>
      {/* Header - si nasconde durante la ricerca */}
      <motion.div 
        initial={{ opacity: 1, y: 0 }} 
        animate={{ opacity: loading || uiPhase === "searching" ? 0 : 1, y: loading || uiPhase === "searching" ? "-100%" : 0 }} 
        transition={{ duration: 0.3, ease: "easeInOut" }} 
        className="pt-6 pb-3 px-6 flex flex-col items-center gap-2 sticky top-0 z-30 bg-gradient-to-br from-slate-50 via-blue-50/20 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/40">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 blur-lg -z-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent" translate="no">Neuralai Seek</h1>
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">Ricerca intelligente con AI</p>
      </motion.div>

      {/* Animazione di ricerca - visibile solo durante il caricamento */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            key="searching-animation"
            initial={{ opacity: 0, y: -30 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -30 }} 
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }} 
            className="max-w-3xl mx-auto px-4 relative mb-[50px]"
          >
            <div className="flex flex-col items-center justify-center pt-0 px-6 pb-2 -mt-[120px]">
              <div className="relative mb-2">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                  <Sparkles className="w-9 h-9 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-ping opacity-20" />
                <div className="absolute -inset-3 rounded-full border-2 border-purple-400/30 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Ricerca in corso</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">"{query.length > 40 ? query.slice(0, 40) + '...' : query}"</p>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700">
                <Loader2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-spin shrink-0" />
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">⏱️ {elapsedTime}s</span>
              </div>
              <button onClick={handleCancel} className="mt-3 px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg">
                <Square className="w-4 h-4" /> Annulla ricerca
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form e risultati */}
      <div className={`max-w-3xl mx-auto px-4 pb-[50px] pt-8 space-y-5 relative transition-all duration-300 ${isKeyboardOpen ? 'pb-0' : ''}`}>

          {/* Versione Mobile - Form principale con trigger per modale */}
          <div className="md:hidden bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-slate-800/50 rounded-3xl shadow-xl shadow-blue-500/10 border border-blue-100 dark:border-slate-700 p-5 space-y-4">
            {/* Trigger per aprire il modale */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-text transition-all duration-300 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-indigo-300/60 dark:border-indigo-600/50 shadow-[0_4px_20px_rgba(99,102,241,0.13)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.22)] hover:border-indigo-400/70 dark:hover:border-indigo-500/60"
              onClick={() => !loading && setShowMobilePromptModal(true)}
            >
              <span className={`flex-1 text-sm font-medium truncate ${query ? "text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                {query || "Cosa vuoi scoprire oggi?"}
              </span>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md bg-gradient-to-br from-blue-500 to-purple-600`}>
                <Send className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Toggle button per mostrare/nascondere controlli */}
            <button
              onClick={() => setShowMobileControls(!showMobileControls)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold transition-all"
            >
              <Layers className="w-4 h-4" />
              {showMobileControls ? 'Nascondi opzioni' : 'Mostra opzioni'}
              <ChevronRight className={`w-4 h-4 transition-transform ${showMobileControls ? 'rotate-90' : ''}`} />
            </button>

            {/* Controlli a scomparsa */}
            <AnimatePresence>
              {showMobileControls && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button onClick={() => setSearchMode("speed")} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${searchMode === "speed" ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}><Zap className="w-4 h-4" /><span className="hidden xs:inline">Speed</span></button>
                    <button onClick={() => { if (isFreeUser) { if (!dismissedWarning) { setShowPremiumWarning(true); if (premiumWarningTimerRef.current) clearTimeout(premiumWarningTimerRef.current); premiumWarningTimerRef.current = setTimeout(() => setShowPremiumWarning(false), 6000); } } else { setSearchMode("large"); } }} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${searchMode === "large" ? "bg-purple-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300" } ${isFreeUser ? "opacity-60" : ""}`}><Brain className="w-4 h-4" /><span className="hidden xs:inline">Large</span>{isFreeUser && <Lock className="w-3.5 h-3.5" />}</button>
                    <label className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all ${enableConcatenation ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}><input type="checkbox" checked={enableConcatenation} onChange={e => setEnableConcatenation(e.target.checked)} className="sr-only" />🔗</label>
                    {searchMode === "large" && (<label className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all ${enableVideoSearch ? "bg-gradient-to-r from-pink-500 to-red-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}><input type="checkbox" checked={enableVideoSearch} onChange={e => setEnableVideoSearch(e.target.checked)} className="sr-only" />🎬</label>)}
                    <button onClick={() => setFolderModalOpen(true)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${(selectedDocFolders.length + selectedWebFolders.length) > 0 ? "bg-teal-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}><Layers className="w-4 h-4" /><span className="hidden xs:inline">Cartelle</span>{(selectedDocFolders.length + selectedWebFolders.length) > 0 && <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">{selectedDocFolders.length + selectedWebFolders.length}</span>}</button>
                    <button onClick={() => setShowHistory(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all ml-auto"><Clock className="w-4 h-4" />{history.length > 0 && <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">{Math.min(history.length, 99)}</span>}</button>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setQuery(""); setHistoryResult(null); clearResult(); }} className="flex-1 py-3 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> <span className="hidden sm:inline">Nuova</span>Ricerca
                    </button>
                    <button onClick={() => handleSearch()} disabled={loading || !query.trim()} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-sm hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"><Send className="w-4 h-4" />{loading ? "..." : "Avvia"}</button>
                  </div>
                  {error && (<div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2"><AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" /><p className="text-xs text-red-700 dark:text-red-300">{error}</p></div>)}
                </motion.div>
              )}
            </AnimatePresence>
            {error && (<div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2"><AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" /><p className="text-xs text-red-700 dark:text-red-300">{error}</p></div>)}
          </div>

          {/* Mobile Prompt Modal Overlay */}
          <AnimatePresence>
            {showMobilePromptModal && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden"
                  onClick={() => setShowMobilePromptModal(false)}
                />

                {/* Modal panel */}
                <motion.div
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0 }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed bottom-3 left-3 right-3 z-[70] md:hidden bg-white dark:bg-slate-800 rounded-t-3xl border-t border-slate-200 dark:border-slate-700 shadow-2xl"
                  style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
                >
                  {/* Handle */}
                  <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-slate-400 dark:bg-slate-600/50" />
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">Cosa vuoi scoprire oggi?</p>
                    <button
                      onClick={() => setShowMobilePromptModal(false)}
                      className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </button>
                  </div>

                  {/* Controlli rapidi */}
                  <div className="px-4 pb-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => { setSearchMode("speed"); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${searchMode === "speed" ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
                    >
                      <Zap className="w-3.5 h-3.5 inline mr-1" />Speed
                    </button>
                    <button
                      onClick={() => { if (!isFreeUser) { setSearchMode("large"); } }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${searchMode === "large" ? "bg-purple-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"} ${isFreeUser ? "opacity-50" : ""}`}
                    >
                      <Brain className="w-3.5 h-3.5 inline mr-1" />Large{isFreeUser && <Lock className="w-3 h-3 inline ml-1" />}
                    </button>
                    {searchMode === "large" && (
                      <button
                        onClick={() => setEnableVideoSearch(v => !v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${enableVideoSearch ? "bg-gradient-to-r from-pink-500 to-red-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
                      >
                        <Video className="w-3.5 h-3.5 inline mr-1" />Video
                      </button>
                    )}
                    <button
                      onClick={() => { setFolderModalOpen(true); setShowMobilePromptModal(false); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                    >
                      <Layers className="w-3.5 h-3.5 inline mr-1" />Cartelle
                    </button>
                  </div>

                  {/* Textarea + send + voice */}
                  <div className="flex items-end gap-3 px-4 pt-2 pb-3">
                    <textarea
                      ref={inputRef}
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = Math.min(e.target.scrollHeight, 192) + "px";
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSearch();
                          setShowMobilePromptModal(false);
                        }
                      }}
                      placeholder="Cosa vuoi scoprire oggi?"
                      rows={4}
                      disabled={loading}
                      className="flex-1 resize-none bg-slate-50 dark:bg-slate-700 rounded-2xl px-4 py-3 text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 max-h-48"
                      style={{ minHeight: "96px" }}
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={listening ? stopListening : startListening}
                        disabled={loading}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          listening
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { handleSearch(); setShowMobilePromptModal(false); }}
                        disabled={loading || !query.trim()}
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white disabled:opacity-30 shadow-lg transition-all active:scale-90"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Versione Desktop */}
          <div className="hidden md:block bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-slate-800/50 rounded-3xl shadow-xl shadow-blue-500/10 border border-blue-100 dark:border-slate-700 p-6 space-y-4">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 320) + "px";
                }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
                placeholder="Cosa vuoi scoprire oggi?"
                rows={6}
                disabled={loading}
                style={{ minHeight: "144px", maxHeight: "320px" }}
                className="w-full resize-none bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 pr-12 text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-60 overflow-y-auto"
              />
              <button
                onClick={listening ? stopListening : startListening}
                disabled={loading}
                className={`absolute right-3 bottom-3 p-2.5 rounded-xl transition-all ${
                  listening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500"
                }`}
                title={listening ? "Stop ascolto" : "Ascolta prompt"}
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setSearchMode("speed")} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${searchMode === "speed" ? "bg-blue-500 text-white shadow shadow-blue-500/30" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}><Zap className="w-4 h-4" /> Speed</button>
              <div className="relative">
                <button onClick={() => { if (isFreeUser) { if (!dismissedWarning) { setShowPremiumWarning(true); if (premiumWarningTimerRef.current) clearTimeout(premiumWarningTimerRef.current); premiumWarningTimerRef.current = setTimeout(() => setShowPremiumWarning(false), 6000); } } else { setSearchMode("large"); } }} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${searchMode === "large" ? "bg-purple-500 text-white shadow shadow-purple-500/30" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600" } ${isFreeUser ? "opacity-60 cursor-not-allowed" : ""}`}><Brain className="w-4 h-4" /> Large{isFreeUser && <Lock className="w-3 h-3" />}</button>
                <AnimatePresence>{showPremiumWarning && !dismissedWarning && (<motion.div initial={{ opacity: 0, scale: 0.9, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 4 }} className="absolute left-0 top-full mt-2 z-50 w-64 p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/60 dark:to-orange-900/60 border-2 border-amber-300 dark:border-amber-600 shadow-2xl shadow-amber-200/50 dark:shadow-amber-900/50" style={{ filter: "drop-shadow(0 8px 24px rgba(251,191,36,0.25))" }}><div className="absolute -top-2 left-5 w-3.5 h-3.5 bg-amber-50 dark:bg-amber-900/60 border-l-2 border-t-2 border-amber-300 dark:border-amber-600 rotate-45" /><button onClick={() => { setShowPremiumWarning(false); setDismissedWarning(true); if (premiumWarningTimerRef.current) clearTimeout(premiumWarningTimerRef.current); }} className="absolute top-2 right-2 p-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/50 transition-colors"><X className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /></button><div className="flex items-start gap-2.5 pr-5"><div className="w-7 h-7 rounded-full bg-amber-400/30 flex items-center justify-center shrink-0 mt-0.5"><Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /></div><div><p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-0.5">Funzione Premium</p><p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">La modalità <strong>Large</strong> include: ricerca approfondita, analisi video YouTube, <strong>generazione automatica di immagini e video</strong> quando richiesti nel prompt, e risposte fino a 35.000 caratteri.</p></div></div></motion.div>)}</AnimatePresence>
              </div>
              <label className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all ${enableConcatenation ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow shadow-purple-500/30" : "bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-slate-600 dark:to-slate-500 text-slate-600 dark:text-white hover:from-blue-200 hover:to-cyan-200 dark:hover:from-slate-500 dark:hover:to-slate-400"}`}><input type="checkbox" checked={enableConcatenation} onChange={e => setEnableConcatenation(e.target.checked)} className="sr-only" />🔗 Concatena</label>
              {searchMode === "large" && (<label className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all ${enableVideoSearch ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow shadow-pink-500/30" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}><input type="checkbox" checked={enableVideoSearch} onChange={e => setEnableVideoSearch(e.target.checked)} className="sr-only" />🎬 Video</label>)}
              <button onClick={() => setFolderModalOpen(true)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${(selectedDocFolders.length + selectedWebFolders.length) > 0 ? "bg-teal-500 text-white shadow shadow-teal-500/30" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}><Layers className="w-4 h-4" />Cartelle {(selectedDocFolders.length + selectedWebFolders.length) > 0 && `(${selectedDocFolders.length + selectedWebFolders.length})`}</button>
              <button onClick={() => setShowHistory(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all ml-auto"><Clock className="w-4 h-4" /><span className="hidden sm:inline">Cronologia</span>{history.length > 0 && (<span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">{Math.min(history.length, 99)}</span>)}</button>
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setQuery(""); setHistoryResult(null); clearResult(); }} className="flex-1 py-3.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-base hover:bg-slate-300 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> Nuova Ricerca
              </button>
              <button onClick={() => handleSearch()} disabled={loading || !query.trim()} className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-base hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 relative overflow-hidden group"><Send className="w-4 h-4 group-hover:rotate-45 transition-transform" />{loading ? "Ricerca in corso..." : "Avvia Ricerca"}</button>
            </div>
            {error && (<div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" /><p className="text-sm text-red-700 dark:text-red-300">{error}</p></div>)}
          </div>

          <AnimatePresence mode="wait">
            {!loading && currentResult ? (renderResults()) : (!loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-14 px-6"><p className="text-slate-400 dark:text-slate-500 text-sm">Scrivi cosa vuoi scoprire e premi <strong>Avvia Ricerca</strong></p></motion.div>
            ))}
          </AnimatePresence>
      </div>

      <AnimatePresence>{showHistory && (<HistoryModal history={history} onClose={() => setShowHistory(false)} onLoad={handleLoadHistoryItem} onDelete={handleDeleteHistory} onClearAll={handleClearAllHistory} saveToLibrary={saveToLibrary} />)}</AnimatePresence>
      <AnimatePresence>{showSourcesModal && currentResult?.sources && currentResult.sources.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gradient-to-br from-black/70 to-blue-900/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowSourcesModal(false)}
        >
          <motion.div
            initial={{ scale: 0.92, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 30, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border-2 border-blue-200 dark:border-blue-800"
            onClick={e => e.stopPropagation()}
          >
            {/* Header con gradiente */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-500 to-cyan-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-0.5">Fonti Web</h3>
                    <p className="text-xs text-white/90 font-semibold">{currentResult.sources.length} fonti trovate</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSourcesModal(false)}
                  className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content con scrollbar personalizzata */}
            <div className="overflow-y-auto flex-1 p-4 space-y-3 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm max-h-[60vh]">
              {currentResult.sources.slice(0, Math.min(currentResult.sources.length, 10)).map((s, i) => {
                const isSaved = savedSourceUrl === s.url;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="group relative flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-slate-700/80 dark:hover:to-cyan-900/20 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-500/10"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 flex items-center justify-center shrink-0 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all shadow-sm group-hover:shadow-md">
                      <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors leading-relaxed">
                        {s.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 font-semibold">{s.displayLink}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      {isSaved ? (
                        <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 transition-all">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <button
                          onClick={() => saveToLibrary(s, "web_source")}
                          className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all"
                          title="Salva in libreria"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
                        title="Apri sito"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
      <AnimatePresence>{showVideoSourcesModal && currentResult?.video_sources && currentResult.video_sources.length > 0 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowVideoSourcesModal(false)}><motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}><div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-pink-500 to-red-500 relative overflow-hidden"><div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" /><div className="relative flex items-center justify-between"><h3 className="text-lg font-bold text-white flex items-center gap-2"><Video className="w-5 h-5" /> Fonti Video ({currentResult.video_sources.length})</h3><button onClick={() => setShowVideoSourcesModal(false)} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"><X className="w-5 h-5 text-white" /></button></div></div><div className="p-5 overflow-y-auto max-h-[60vh] space-y-3 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">{currentResult.video_sources.slice(0, Math.min(currentResult.video_sources.length, 10)).map((s, i) => { const isSaved = savedSourceUrl === s.url; return (<motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} whileHover={{ scale: 1.02, x: 4 }} className="group relative flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-gradient-to-r hover:from-pink-50 hover:to-red-50 dark:hover:from-slate-700/80 dark:hover:to-red-900/20 border-2 border-slate-200 dark:border-slate-700 hover:border-pink-400 dark:hover:border-pink-500 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-pink-500/10"><div className="relative shrink-0">{s.thumbnail ? (<img src={s.thumbnail} alt="" className="w-32 h-20 object-cover rounded-xl group-hover:scale-105 transition-transform shadow-md" />) : (<div className="w-32 h-20 rounded-xl bg-gradient-to-br from-pink-500/20 to-red-500/20 flex items-center justify-center shadow-md"><Video className="w-8 h-8 text-pink-500" /></div>)}</div><div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors leading-relaxed">{s.title}</p><p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2"><span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 font-semibold">{s.channel || s.displayLink}</span></p></div><div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">{isSaved ? (<div className="p-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 transition-all"><Check className="w-4 h-4" /></div>) : (<button onClick={() => saveToLibrary(s, "video_source")} className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all" title="Salva in libreria"><FileText className="w-4 h-4" /></button>)}<a href={s.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-all" title="Guarda video"><ExternalLink className="w-4 h-4" /></a></div><div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" /></motion.div>); })}</div></motion.div></motion.div>)}</AnimatePresence>
      <DraggableFolderModal isOpen={folderModalOpen} onClose={() => setFolderModalOpen(false)} selectedDocFolders={selectedDocFolders} selectedWebFolders={selectedWebFolders} onChange={({ docFolders, webFolders }) => { setSelectedDocFolders(docFolders); setSelectedWebFolders(webFolders); }} docFolders={[...new Set(userDocs.map(d => d.folder || "Generale"))]} webFolders={[...new Set(userWebs.map(w => w.folder || "Generale"))]} />
      <PromptAssistantModal currentContext="seek" isPremium={isPremium} />
      <style>{`@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }`}</style>
    </div>
  );
}