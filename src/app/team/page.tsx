"use client";

import { useState, useEffect, useCallback } from "react";

type AgentStatus = "idle" | "working" | "waiting" | "error";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  status: AgentStatus;
  currentTask: string;
  avatar: string;
  isSubagent?: boolean;
  sessionKey?: string;
}

const STORAGE_KEY = "mission-control-team";

const defaultMembers: TeamMember[] = [
  {
    id: "1",
    name: "你",
    role: "人類",
    description: "老闆。負責做決定和提供指導。",
    status: "working",
    currentTask: "管理 Mission Control",
    avatar: "👤",
  },
  {
    id: "2",
    name: "OpenClaw",
    role: "主要 AI",
    description: "主要 AI 助手。負責協調和一般任務。",
    status: "idle",
    currentTask: "等待指令",
    avatar: "🦌",
  },
  {
    id: "3",
    name: "開發者",
    role: "子代理",
    description: "程式碼撰寫、除錯和技術實作。",
    status: "idle",
    currentTask: "未分配",
    avatar: "👨‍💻",
    isSubagent: true,
  },
  {
    id: "4",
    name: "寫手",
    role: "子代理",
    description: "內容創作、寫作和文件撰寫。",
    status: "idle",
    currentTask: "未分配",
    avatar: "✍️",
    isSubagent: true,
  },
  {
    id: "5",
    name: "研究者",
    role: "子代理",
    description: "網路研究、資料收集和分析。",
    status: "idle",
    currentTask: "未分配",
    avatar: "🔍",
    isSubagent: true,
  },
];

interface SubagentData {
  lastUpdate: string;
  agents: Array<{
    id: string;
    name: string;
    role: string;
    status: string;
    currentTask: string;
    sessionKey: string;
  }>;
}

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>(defaultMembers);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", role: "", description: "", avatar: "" });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [subagentData, setSubagentData] = useState<SubagentData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setMembers(JSON.parse(stored));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMembers));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  }, [members]);

  const refreshSubagents = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/subagents');
      if (response.ok) {
        const data = await response.json();
        setSubagentData(data);
        setLastRefresh(new Date().toLocaleTimeString("zh-TW"));
      }
    } catch (error) {
      console.error("Failed to refresh subagents:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh on mount and every 30 seconds
  useEffect(() => {
    refreshSubagents();
    const interval = setInterval(refreshSubagents, 30000);
    return () => clearInterval(interval);
  }, [refreshSubagents]);

  const saveMember = () => {
    if (!formData.name.trim() || !formData.role.trim()) return;
    
    if (editingId) {
      setMembers(members.map(m => 
        m.id === editingId 
          ? { ...m, name: formData.name.trim(), role: formData.role.trim(), description: formData.description.trim(), avatar: formData.avatar || "🤖" }
          : m
      ));
    } else {
      const member: TeamMember = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        role: formData.role.trim(),
        description: formData.description.trim(),
        status: "idle",
        currentTask: "未分配",
        avatar: formData.avatar || "🤖",
      };
      setMembers([...members, member]);
    }
    
    setFormData({ name: "", role: "", description: "", avatar: "" });
    setShowForm(false);
    setEditingId(null);
  };

  const editMember = (member: TeamMember) => {
    setFormData({ name: member.name, role: member.role, description: member.description, avatar: member.avatar });
    setEditingId(member.id);
    setShowForm(true);
  };

  const deleteMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const updateStatus = (id: string, status: AgentStatus) => {
    setMembers(members.map(m => m.id === id ? { ...m, status } : m));
  };

  const updateTask = (id: string, task: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, currentTask: task } : m));
  };

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case "working": return "bg-green-500";
      case "waiting": return "bg-yellow-500";
      case "error": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const statusCounts = {
    working: members.filter(m => m.status === "working").length,
    idle: members.filter(m => m.status === "idle").length,
    waiting: members.filter(m => m.status === "waiting").length,
    error: members.filter(m => m.status === "error").length,
  };

  // Merge subagent data into members display
  const displayMembers = members.map(member => {
    const subagent = subagentData?.agents.find(a => a.sessionKey === member.sessionKey);
    if (subagent) {
      return {
        ...member,
        status: subagent.status === 'working' ? 'working' as AgentStatus : 'idle' as AgentStatus,
        currentTask: subagent.currentTask
      };
    }
    return member;
  });

  return (
    <div className="p-6 min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl">👥</span> 團隊
          </h1>
          <div className="flex gap-2">
            <button
              onClick={refreshSubagents}
              disabled={isRefreshing}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {isRefreshing ? "🔄 更新中..." : "🔄 重新整理"}
            </button>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({ name: "", role: "", description: "", avatar: "" });
              }}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {showForm ? "取消" : "+ 新增成員"}
            </button>
          </div>
        </div>

        {lastRefresh && (
          <div className="text-xs text-gray-500 mb-4">最後更新: {lastRefresh}</div>
        )}

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-green-400">{statusCounts.working}</div>
            <div className="text-gray-400 text-sm">工作中</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-gray-400">{statusCounts.idle}</div>
            <div className="text-gray-400 text-sm">閒置</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-yellow-400">{statusCounts.waiting}</div>
            <div className="text-gray-400 text-sm">等待中</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="text-2xl font-bold text-red-400">{statusCounts.error}</div>
            <div className="text-gray-400 text-sm">錯誤</div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="名稱..."
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="角色..."
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="頭貼 emoji..."
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述..."
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={saveMember}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium transition-colors md:col-span-2"
              >
                {editingId ? "更新成員" : "新增成員"}
              </button>
            </div>
          </div>
        )}

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayMembers.map(member => (
            <div key={member.id} className={`bg-gray-900 rounded-xl p-5 border hover:border-gray-700 transition-colors ${member.isSubagent ? "border-purple-900/50" : "border-gray-800"}`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl relative">
                  {member.avatar}
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor(member.status)}`}></span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <span className="text-sm text-blue-400">{member.role}</span>
                  {member.isSubagent && <span className="ml-2 text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded">子代理</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => editMember(member)} className="text-gray-400 hover:text-blue-400">✏️</button>
                  <button onClick={() => deleteMember(member.id)} className="text-gray-400 hover:text-red-400">🗑️</button>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-4">{member.description}</p>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">狀態</label>
                  <select
                    value={member.status}
                    onChange={(e) => updateStatus(member.id, e.target.value as AgentStatus)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="idle">閒置</option>
                    <option value="working">工作中</option>
                    <option value="waiting">等待中</option>
                    <option value="error">錯誤</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">目前任務</label>
                  <input
                    type="text"
                    value={member.currentTask}
                    onChange={(e) => updateTask(member.id, e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
