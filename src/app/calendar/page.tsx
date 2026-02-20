"use client";

import { useState, useEffect } from "react";

type EventType = "task" | "reminder" | "cron";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: EventType;
  description: string;
  completed: boolean;
}

const STORAGE_KEY = "mission-control-calendar";

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "09:00",
    type: "task" as EventType,
    description: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setEvents(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const addEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) return;
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title.trim(),
      date: newEvent.date,
      time: newEvent.time,
      type: newEvent.type,
      description: newEvent.description,
      completed: false,
    };
    setEvents([...events, event]);
    setNewEvent({ title: "", date: "", time: "09:00", type: "task", description: "" });
    setShowForm(false);
  };

  const toggleComplete = (id: string) => {
    setEvents(events.map(e => e.id === id ? { ...e, completed: !e.completed } : e));
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"];

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === dateStr);
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  const goToToday = () => setCurrentDate(new Date());

  const upcomingEvents = events
    .filter(e => !e.completed)
    .sort((a, b) => new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime())
    .slice(0, 10);

  return (
    <div className="p-6 min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl">📅</span> 日曆
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {showForm ? "取消" : "+ 新增事件"}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-900 rounded-xl p-4 mb-6 border border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="事件標題..."
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as EventType })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="task">任務</option>
                <option value="reminder">提醒</option>
                <option value="cron">定時任務</option>
              </select>
              <input
                type="text"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="描述（可選）..."
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 md:col-span-2"
              />
              <button
                onClick={addEvent}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium transition-colors md:col-span-2"
              >
                新增事件
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-800 rounded-lg">◀</button>
              <h2 className="text-xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-800 rounded-lg">▶</button>
            </div>
            <button onClick={goToToday} className="text-sm text-blue-400 hover:underline mb-4">回到今天</button>
            
            <div className="grid grid-cols-7 gap-1">
              {["日", "一", "二", "三", "四", "五", "六"].map(day => (
                <div key={day} className="text-center text-gray-500 text-sm py-2">{day}</div>
              ))}
              {Array.from({ length: startingDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20"></div>
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                return (
                  <div key={day} className={`h-20 p-1 border border-gray-800 rounded ${isToday ? "bg-gray-800" : ""}`}>
                    <div className={`text-sm ${isToday ? "text-blue-400 font-bold" : "text-gray-400"}`}>{day}</div>
                    {dayEvents.slice(0, 2).map(e => (
                      <div key={e.id} className={`text-xs truncate px-1 py-0.5 rounded mb-0.5 ${
                        e.type === "cron" ? "bg-purple-900 text-purple-300" :
                        e.type === "reminder" ? "bg-yellow-900 text-yellow-300" :
                        "bg-blue-900 text-blue-300"
                      }`}>
                        {e.time} {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && <div className="text-xs text-gray-500">+{dayEvents.length - 2}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4">即將到來</h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">沒有即將到來的事件</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            event.type === "cron" ? "bg-purple-900 text-purple-300" :
                            event.type === "reminder" ? "bg-yellow-900 text-yellow-300" :
                            "bg-blue-900 text-blue-300"
                          }`}>{event.type === "cron" ? "定時" : event.type === "reminder" ? "提醒" : "任務"}</span>
                          <span className={`text-sm ${event.completed ? "line-through text-gray-500" : ""}`}>{event.title}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{event.date} {event.time}</div>
                        {event.description && <div className="text-xs text-gray-400 mt-1">{event.description}</div>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => toggleComplete(event.id)} className="text-green-400 hover:underline text-sm">✓</button>
                        <button onClick={() => deleteEvent(event.id)} className="text-red-400 hover:underline text-sm">✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
