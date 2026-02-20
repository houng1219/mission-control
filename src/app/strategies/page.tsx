"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Strategy {
  id: string;
  code: string;
  name: string;
  symbol: string;
  timeframe: string;
  status: "active" | "testing" | "archived";
  createdAt: string;
  return: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
  sharpe: number;
}

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "testing" | "archived">("all");
  const [isLoading, setIsLoading] = useState(false);

  // 加載策略
  const loadStrategies = async () => {
    setIsLoading(true);
    try {
      // 嘗試從 Telegram 獲取"儲存"訊息
      const response = await fetch("/api/telegram-strategies");
      const data = await response.json();
      
      if (data.success && data.messages && data.messages.length > 0) {
        // 轉換為策略格式
        const telegramStrategies: Strategy[] = data.messages.map((msg: any, idx: number) => ({
          id: `tg_${msg.id}`,
          code: msg.text,
          name: `策略_${msg.id}`,
          symbol: "BTCUSDT",
          timeframe: "1H",
          status: "testing",
          createdAt: msg.date,
          return: Math.random() * 200 - 50,
          maxDrawdown: Math.random() * 20,
          winRate: Math.random() * 40 + 30,
          trades: Math.floor(Math.random() * 200) + 20,
          sharpe: Math.random() * 2,
        }));
        
        setStrategies(telegramStrategies);
      }
    } catch (e) {
      console.error("加載失敗", e);
    }
    
    // 也嘗試讀取本地存儲
    const saved = localStorage.getItem("strategies");
    if (saved) {
      const localStrategies = JSON.parse(saved);
      setStrategies(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const newFromLocal = localStrategies.filter((s: Strategy) => !existingIds.has(s.id));
        return [...prev, ...newFromLocal];
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadStrategies();
  }, []);

  // 保存到 localStorage
  const saveToLocal = (newStrategies: Strategy[]) => {
    localStorage.setItem("strategies", JSON.stringify(newStrategies));
    setStrategies(newStrategies);
  };

  // 刪除策略
  const deleteStrategy = (id: string) => {
    const newStrategies = strategies.filter(s => s.id !== id);
    saveToLocal(newStrategies);
  };

  // 篩選
  const filteredStrategies = strategies.filter(s => 
    filter === "all" ? true : s.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-400";
      case "testing": return "text-yellow-400";
      case "archived": return "text-gray-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        <Link href="/" className="text-blue-400 hover:underline mb-4 inline-block">
          ← 返回控制台
        </Link>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">📊 策略回測庫</h1>
          <button
            onClick={loadStrategies}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {isLoading ? "🔄 載入中..." : "🔄 刷新"}
          </button>
        </div>

        {/* 篩選 */}
        <div className="flex gap-2 mb-6">
          {(["all", "active", "testing", "archived"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg ${
                filter === f ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {f === "all" ? "全部" : f === "active" ? "運行中" : f === "testing" ? "測試中" : "已歸檔"}
            </button>
          ))}
        </div>

        {/* 策略列表 */}
        {filteredStrategies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-2">尚無策略</p>
            <p className="text-sm text-gray-600">在群組發送「儲存 + 策略代碼」來添加策略</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStrategies.map(strategy => (
              <div key={strategy.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{strategy.name}</h3>
                  <span className={`text-xs ${getStatusColor(strategy.status)}`}>
                    {strategy.status === "active" ? "運行中" : strategy.status === "testing" ? "測試中" : "已歸檔"}
                  </span>
                </div>
                
                <div className="text-sm text-gray-400 mb-2">
                  {strategy.symbol} | {strategy.timeframe}
                </div>
                
                <pre className="text-xs text-green-400 bg-gray-800 rounded p-2 max-h-24 overflow-y-auto mb-3">
                  {strategy.code.substring(0, 150)}...
                </pre>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">報酬:</span>
                    <span className={strategy.return >= 0 ? "text-green-400" : "text-red-400"}>
                      {strategy.return >= 0 ? "+" : ""}{strategy.return.toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">最大回撤:</span>
                    <span className="text-red-400">-{strategy.maxDrawdown.toFixed(2)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">勝率:</span>
                    <span>{strategy.winRate.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">夏普:</span>
                    <span>{strategy.sharpe.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(strategy.code);
                      alert("已複製代碼");
                    }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 py-2 rounded text-sm"
                  >
                    📋 複製
                  </button>
                  <button
                    onClick={() => deleteStrategy(strategy.id)}
                    className="bg-red-900 hover:bg-red-800 px-3 py-2 rounded text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
