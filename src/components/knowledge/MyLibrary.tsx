import React, { useState, useEffect } from 'react';
import { BookOpen, Bookmark, Trash2, Pill, ClipboardList, FileText, Book, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { SavedKnowledgeService, SavedKnowledge } from '@/lib/SavedKnowledgeService';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function MyLibrary() {
  const [savedItems, setSavedItems] = useState<SavedKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SavedKnowledge | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedItem) {
      setTags(selectedItem.tags || []);
      setNotes(selectedItem.notes || '');
    }
  }, [selectedItem]);

  const handleUpdate = async () => {
    if (!selectedItem?.id) return;
    await SavedKnowledgeService.updateKnowledge(selectedItem.id, { tags, notes });
  };

  const handlePrint = () => {
    window.print();
  };

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'encyclopedia', name: 'Encyclopedia' },
    { id: 'protocol', name: 'Treatment Protocols' },
    { id: 'lab', name: 'Lab Reference' },
    { id: 'drug', name: 'Drug Database' },
  ];

  useEffect(() => {
    const unsubscribe = SavedKnowledgeService.subscribeToSavedKnowledge((items) => {
      setSavedItems(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredItems = activeCategory === 'all' 
    ? savedItems 
    : savedItems.filter(item => item.type === activeCategory);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this from your library?")) {
      await SavedKnowledgeService.deleteKnowledge(id);
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'drug': return <Pill className="w-4 h-4" />;
      case 'protocol': return <ClipboardList className="w-4 h-4" />;
      case 'lab': return <FileText className="w-4 h-4" />;
      case 'encyclopedia': return <Book className="w-4 h-4" />;
      default: return <Bookmark className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
        <p className="font-medium">Loading your clinical library...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeCategory === cat.id
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: Saved Items List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-3 bg-white border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Clinical Knowledge</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={cn(
                      "w-full text-left p-4 hover:bg-white transition-all group flex items-center justify-between cursor-pointer",
                      selectedItem?.id === item.id ? "bg-white ring-2 ring-inset ring-indigo-500" : ""
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        item.type === 'drug' ? "bg-indigo-50 text-indigo-600" :
                        item.type === 'protocol' ? "bg-emerald-50 text-emerald-600" :
                        item.type === 'lab' ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{item.title}</span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{item.type}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, item.id!)}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">No items found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content: Saved Item Details */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn(
                    "p-3 rounded-xl",
                    selectedItem.type === 'drug' ? "bg-indigo-50 text-indigo-600" :
                    selectedItem.type === 'protocol' ? "bg-emerald-50 text-emerald-600" :
                    selectedItem.type === 'lab' ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {getTypeIcon(selectedItem.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">{selectedItem.title}</h3>
                    <p className="text-sm text-slate-500">Saved {selectedItem.type} reference</p>
                  </div>
                  <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200">
                    Print
                  </button>
                </div>

                {/* Tags and Notes */}
                <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={tags.join(', ')}
                      onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                      onBlur={handleUpdate}
                      placeholder="e.g. Urgent, Cardiology"
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Clinical Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      onBlur={handleUpdate}
                      placeholder="Add observations or patient context..."
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm h-24"
                    />
                  </div>
                </div>

                {/* Render data based on type */}
                <div className="space-y-6">
                  {selectedItem.type === 'drug' && (
                    <div className="space-y-6">
                      {selectedItem.data.summary && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <section>
                            <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">Contraindications</h4>
                            <ul className="space-y-2">
                              {selectedItem.data.summary.contraindications.map((c: string, i: number) => (
                                <li key={i} className="text-sm text-slate-700 bg-red-50 p-2 rounded-lg border border-red-100">{c}</li>
                              ))}
                            </ul>
                          </section>
                          <section>
                            <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">Side Effects</h4>
                            <ul className="space-y-2">
                              {selectedItem.data.summary.sideEffects.map((s: string, i: number) => (
                                <li key={i} className="text-sm text-slate-700 bg-amber-50 p-2 rounded-lg border border-amber-100">{s}</li>
                              ))}
                            </ul>
                          </section>
                        </div>
                      )}
                      <section>
                        <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Drug Interactions</h4>
                        <p className="text-sm text-slate-700 bg-indigo-50 p-4 rounded-xl border border-indigo-100">{selectedItem.data.summary?.interactions}</p>
                      </section>
                    </div>
                  )}

                  {selectedItem.type === 'protocol' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section>
                          <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">First-Line Therapy</h4>
                          <ul className="space-y-2">
                            {selectedItem.data.firstLine.map((item: string, i: number) => (
                              <li key={i} className="text-sm text-slate-700 bg-indigo-50 p-2 rounded-lg border border-indigo-100">{item}</li>
                            ))}
                          </ul>
                        </section>
                        <section>
                          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">Second-Line Therapy</h4>
                          <ul className="space-y-2">
                            {selectedItem.data.secondLine.map((item: string, i: number) => (
                              <li key={i} className="text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">{item}</li>
                            ))}
                          </ul>
                        </section>
                      </div>
                      <section>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Clinical Pearls</h4>
                        <p className="text-sm text-slate-700 bg-slate-900 text-white p-4 rounded-xl">{selectedItem.data.clinicalPearls}</p>
                      </section>
                    </div>
                  )}

                  {selectedItem.type === 'lab' && (
                    <div className="space-y-6">
                      <section>
                        <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Clinical Significance</h4>
                        <p className="text-sm text-slate-700 bg-indigo-50 p-4 rounded-xl border border-indigo-100">{selectedItem.data.clinicalSignificance}</p>
                      </section>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section>
                          <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">High Values</h4>
                          <ul className="space-y-2">
                            {selectedItem.data.highCauses.map((c: string, i: number) => (
                              <li key={i} className="text-sm text-slate-700 bg-red-50 p-2 rounded-lg border border-red-100">{c}</li>
                            ))}
                          </ul>
                        </section>
                        <section>
                          <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Low Values</h4>
                          <ul className="space-y-2">
                            {selectedItem.data.lowCauses.map((c: string, i: number) => (
                              <li key={i} className="text-sm text-slate-700 bg-blue-50 p-2 rounded-lg border border-blue-100">{c}</li>
                            ))}
                          </ul>
                        </section>
                      </div>
                    </div>
                  )}

                  {selectedItem.type === 'encyclopedia' && (
                    <div className="space-y-6">
                      <section>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">Definition</h4>
                        <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">{selectedItem.data.definition}</p>
                      </section>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section>
                          <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">Symptoms</h4>
                          <ul className="space-y-2">
                            {selectedItem.data.symptoms.map((s: string, i: number) => (
                              <li key={i} className="text-sm text-slate-700 bg-amber-50 p-2 rounded-lg border border-amber-100">{s}</li>
                            ))}
                          </ul>
                        </section>
                        <section>
                          <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Treatments</h4>
                          <ul className="space-y-2">
                            {selectedItem.data.treatments.map((t: string, i: number) => (
                              <li key={i} className="text-sm text-slate-700 bg-indigo-50 p-2 rounded-lg border border-indigo-100">{t}</li>
                            ))}
                          </ul>
                        </section>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <Bookmark className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400">My Clinical Library</h3>
              <p className="text-slate-400 max-w-xs mx-auto mt-2 text-center">
                Select an item from your library to view saved clinical knowledge.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
