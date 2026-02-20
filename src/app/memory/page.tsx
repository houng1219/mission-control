"use client";

import { useState, useEffect } from "react";

interface Memory {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "mission-control-memory";

export default function Memory() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "", tags: "" });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setMemories(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
  }, [memories]);

  const allTags = [...new Set(memories.flatMap(m => m.tags))];

  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || m.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const saveMemory = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    const tags = formData.tags.split(",").map(t => t.trim()).filter(t => t);
    
    if (editingId) {
      setMemories(memories.map(m => 
        m.id === editingId 
          ? { ...m, title: formData.title.trim(), content: formData.content.trim(), tags, updatedAt: new Date().toISOString() }
          : m
      ));
    } else {
      const memory: Memory = {
        id: Date.now().toString(),
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMemories([...memories, memory]);
    }
    
    setFormData({ title: "", content: "", tags: "" });
    setShowForm(false);
    setEditingId(null);
  };

  const editMemory = (memory: Memory) => {
    setFormData({ title: memory.title, content: memory.content, tags: memory.tags.join(", ") });
    setEditingId(memory.id);
    setShowForm(true);
  };

  const deleteMemory = (id: string) => {
    setMemories(memories.filter(m => m.id !== id));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-TW", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="p-6 min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl">🧠</span> 記憶庫
          </h1>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: "", content: "", tags: "" });
            }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {showForm ? "取消" : "+ 新增記憶"}
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-800">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋記憶..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
          />
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full text-sm ${
                  !selectedTag ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                全部
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    tag === selectedTag ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-800">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="標題..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
            />
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="寫下你的記憶..."
              rows={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-blue-500 resize-none"
            />
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="標籤（用逗號分隔）..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={saveMemory}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {editingId ? "更新記憶" : "儲存記憶"}
            </button>
          </div>
        )}

        {/* Memory List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemories.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              {searchQuery || selectedTag ? "找不到記憶" : "還沒有記憶，建立第一筆吧！"}
            </div>
          ) : (
            filteredMemories.map(memory => (
              <div key={memory.id} className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold">{memory.title}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => editMemory(memory)} className="text-gray-400 hover:text-blue-400">✏️</button>
                    <button onClick={() => deleteMemory(memory.id)} className="text-gray-400 hover:text-red-400">🗑️</button>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap line-clamp-4">{memory.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {memory.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">{tag}</span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(memory.updatedAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
