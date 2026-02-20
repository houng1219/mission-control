"use client";

import { useState, useEffect } from "react";

type TaskStatus = "todo" | "in-progress" | "done";
type Assignee = "me" | "you";

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: Assignee;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "mission-control-tasks";

export default function TasksBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<Assignee>("me");
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTasks(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      status: "todo",
      assignee: newTaskAssignee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks([...tasks, task]);
    setNewTaskTitle("");
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t
      )
    );
  };

  const updateTaskAssignee = (taskId: string, assignee: Assignee) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, assignee, updatedAt: new Date().toISOString() } : t
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  const startEdit = (task: Task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = (taskId: string) => {
    if (!editTitle.trim()) return;
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? { ...t, title: editTitle.trim(), updatedAt: new Date().toISOString() }
          : t
      )
    );
    setEditingTask(null);
    setEditTitle("");
  };

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: "todo", label: "待辦", color: "border-yellow-500" },
    { status: "in-progress", label: "進行中", color: "border-blue-500" },
    { status: "done", label: "已完成", color: "border-green-500" },
  ];

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  return (
    <div className="p-6 min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span className="text-4xl">📋</span> 任務看板
        </h1>

        {/* Add Task Form */}
        <div className="bg-gray-900 rounded-xl p-4 mb-8 border border-gray-800">
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="新增任務..."
              className="flex-1 min-w-[200px] bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <select
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value as Assignee)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
            >
              <option value="me">👤 我</option>
              <option value="you">🤖 AI</option>
            </select>
            <button
              onClick={addTask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              新增
            </button>
          </div>
        </div>

        {/* Board Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <div key={col.status} className="bg-gray-900 rounded-xl p-4 border-t-4 border-gray-800">
              <div className={`border-t-4 ${col.color} -mt-4 -mx-4 px-4 pt-4 mb-4`}>
                <h2 className="text-lg font-semibold flex items-center justify-between">
                  {col.label}
                  <span className="bg-gray-800 text-gray-400 text-sm px-2 py-1 rounded-full">
                    {getTasksByStatus(col.status).length}
                  </span>
                </h2>
              </div>

              <div className="space-y-3">
                {getTasksByStatus(col.status).map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    {editingTask === task.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(task.id)}
                            className="text-green-400 text-sm hover:underline"
                          >
                            儲存
                          </button>
                          <button
                            onClick={() => setEditingTask(null)}
                            className="text-gray-400 text-sm hover:underline"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium mb-3">{task.title}</p>
                        <div className="flex items-center justify-between text-sm">
                          <select
                            value={task.assignee}
                            onChange={(e) =>
                              updateTaskAssignee(task.id, e.target.value as Assignee)
                            }
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-300 text-xs focus:outline-none"
                          >
                            <option value="me">👤 我</option>
                            <option value="you">🤖 AI</option>
                          </select>
                          <div className="flex gap-2">
                            {col.status !== "todo" && (
                              <button
                                onClick={() => updateTaskStatus(task.id, "todo")}
                                className="text-yellow-400 hover:underline"
                                title="移至待辦"
                              >
                                ⬅️
                              </button>
                            )}
                            {col.status === "todo" && (
                              <button
                                onClick={() => updateTaskStatus(task.id, "in-progress")}
                                className="text-blue-400 hover:underline"
                                title="開始處理"
                              >
                                ▶️
                              </button>
                            )}
                            {col.status === "in-progress" && (
                              <button
                                onClick={() => updateTaskStatus(task.id, "done")}
                                className="text-green-400 hover:underline"
                                title="完成"
                              >
                                ✅
                              </button>
                            )}
                            {col.status !== "done" && col.status !== "in-progress" && (
                              <button
                                onClick={() => updateTaskStatus(task.id, "done")}
                                className="text-green-400 hover:underline"
                                title="完成"
                              >
                                ✅
                              </button>
                            )}
                            <button
                              onClick={() => startEdit(task)}
                              className="text-gray-400 hover:underline"
                              title="編輯"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="text-red-400 hover:underline"
                              title="刪除"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {getTasksByStatus(col.status).length === 0 && (
                  <p className="text-gray-600 text-center py-8 text-sm">沒有任務</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
