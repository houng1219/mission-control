"use client";

import { useState, useEffect, useRef } from "react";
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
  equityCurve?: number[];
}

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "testing" | "archived">("all");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加載策略
  const loadStrategies = () => {
    setIsLoading(true);
    const saved = localStorage.getItem("strategies");
    if (saved) {
      setStrategies(JSON.parse(saved));
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

  // 處理文件上傳
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // 支援 JSON 和 CSV
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          const newStrategies = Array.isArray(data) ? data : [data];
          const mapped = newStrategies.map((s: any, idx: number) => ({
            id: s.id || `upload_${Date.now()}_${idx}`,
            code: s.code || s.strategy || "",
            name: s.name || s.strategyName || `策略_${Date.now()}`,
            symbol: s.symbol || "BTCUSDT",
            timeframe: s.timeframe || "1H",
            status: "testing" as const,
            createdAt: s.createdAt || new Date().toISOString(),
            return: parseFloat(s.return) || 0,
            maxDrawdown: parseFloat(s.maxDrawdown) || 0,
            winRate: parseFloat(s.winRate) || 0,
            trades: parseInt(s.trades) || 0,
            sharpe: parseFloat(s.sharpe) || 0,
          }));
          saveToLocal([...strategies, ...mapped]);
          alert(`成功導入 ${mapped.length} 個策略！`);
        } else if (file.name.endsWith('.csv')) {
          // CSV 解析
          const lines = content.split('\n').filter(l => l.trim());
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          const mapped: Strategy[] = lines.slice(1).map((line, idx) => {
            const values = line.split(',').map(v => v.trim());
            const obj: any = {};
            headers.forEach((h, i) => obj[h] = values[i]);
            
            return {
              id: `csv_${Date.now()}_${idx}`,
              code: obj.code || obj.strategy || "",
              name: obj.name || `策略_${idx + 1}`,
              symbol: obj.symbol || "BTCUSDT",
              timeframe: obj.timeframe || "1H",
              status: "testing" as const,
              createdAt: new Date().toISOString(),
              return: parseFloat(obj.return) || 0,
              maxDrawdown: parseFloat(obj.maxdrawdown) || 0,
              winRate: parseFloat(obj.winrate) || 0,
              trades: parseInt(obj.trades) || 0,
              sharpe: parseFloat(obj.sharpe) || 0,
            };
          });
          
          saveToLocal([...strategies, ...mapped]);
          alert(`成功導入 ${mapped.length} 個策略！`);
        }
      } catch (err) {
        alert("解析失敗，請檢查文件格式");
      }
    };
    reader.readAsText(file);
    
    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json,.csv"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg cursor-pointer"
            >
              📤 上傳文件
            </label>
            <button
              onClick={loadStrategies}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {isLoading ? "🔄 載入中..." : "🔄 刷新"}
            </button>
          </div>
        </div>

        {/* 支援 JSON 和 CSV 文件上傳 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-2">📋 支援格式</h3>
          <div className="text-sm text-gray-400">
            <p>JSON 或 CSV 文件，須包含: name, code, return, maxDrawdown, winRate, sharpe, trades</p>
          </div>
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
            <p className="text-sm text-gray-600">點擊「上傳文件」導入 JSON 或 CSV</p>
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
                  {strategy.code?.substring(0, 150)}...
                </pre>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">報酬:</span>
                    <span className={strategy.return >= 0 ? "text-green-400" : "text-red-400"}>
                      {strategy.return >= 0 ? "+" : ""}{strategy.return?.toFixed(2)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">最大回撤:</span>
                    <span className="text-red-400">-{strategy.maxDrawdown?.toFixed(2)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">勝率:</span>
                    <span>{strategy.winRate?.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">夏普:</span>
                    <span>{strategy.sharpe?.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(strategy.code || "");
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
