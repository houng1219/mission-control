"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Strategy {
  id: string;
  name: string;
  symbol: string;
  timeframe: string;
  status: "active" | "testing" | "archived";
  lastBacktest: string;
  return: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
}

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "testing" | "archived">("all");

  useEffect(() => {
    const saved = localStorage.getItem("strategies");
    if (saved) {
      setStrategies(JSON.parse(saved));
    } else {
      // 預設示例策略
      const defaultStrategies: Strategy[] = [
        {
          id: "1",
          name: "MA 交叉策略",
          symbol: "BTC",
          timeframe: "4H",
          status: "active",
          lastBacktest: "2026-02-20",
          return: 15.2,
          maxDrawdown: -8.5,
          winRate: 58,
          trades: 45,
        },
        {
          id: "2",
          name: "RSI 超買超賣",
          symbol: "ETH",
          timeframe: "1H",
          status: "testing",
          lastBacktest: "2026-02-19",
          return: 8.7,
          maxDrawdown: -12.3,
          winRate: 52,
          trades: 28,
        },
      ];
      setStrategies(defaultStrategies);
      localStorage.setItem("strategies", JSON.stringify(defaultStrategies));
    }
  }, []);

  const filteredStrategies = strategies.filter(
    (s) => filter === "all" || s.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400";
      case "testing":
        return "bg-yellow-500/20 text-yellow-400";
      case "archived":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getReturnColor = (returnVal: number) => {
    return returnVal >= 0 ? "text-green-400" : "text-red-400";
  };

  const addStrategy = () => {
    const name = prompt("策略名稱：");
    if (!name) return;
    const symbol = prompt("標的 (BTC/ETH)：") || "BTC";
    const timeframe = prompt("時間週期 (1H/4H/1D)：") || "4H";

    const newStrategy: Strategy = {
      id: Date.now().toString(),
      name,
      symbol,
      timeframe,
      status: "testing",
      lastBacktest: new Date().toISOString().split("T")[0],
      return: 0,
      maxDrawdown: 0,
      winRate: 0,
      trades: 0,
    };

    const updated = [...strategies, newStrategy];
    setStrategies(updated);
    localStorage.setItem("strategies", JSON.stringify(updated));
  };

  const deleteStrategy = (id: string) => {
    if (!confirm("確定刪除此策略？")) return;
    const updated = strategies.filter((s) => s.id !== id);
    setStrategies(updated);
    localStorage.setItem("strategies", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-blue-400 hover:underline mb-2 inline-block">
              ← 返回控制台
            </Link>
            <h1 className="text-3xl font-bold">📈 量化策略庫</h1>
            <p className="text-gray-400">管理你的交易策略與回測結果</p>
          </div>
          <button
            onClick={addStrategy}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + 新增策略
          </button>
        </div>

        {/* 篩選器 */}
        <div className="flex gap-2 mb-6">
          {(["all", "active", "testing", "archived"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {f === "all" ? "全部" : f === "active" ? "運行中" : f === "testing" ? "測試中" : "已歸檔"}
            </button>
          ))}
        </div>

        {/* 策略列表 */}
        <div className="grid gap-4">
          {filteredStrategies.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              還沒有策略，點擊「+ 新增策略」開始
            </div>
          ) : (
            filteredStrategies.map((strategy) => (
              <div
                key={strategy.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{strategy.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(strategy.status)}`}>
                        {strategy.status === "active" ? "運行中" : strategy.status === "testing" ? "測試中" : "已歸檔"}
                      </span>
                      <span className="bg-gray-800 px-2 py-1 rounded text-xs">{strategy.symbol}</span>
                      <span className="bg-gray-800 px-2 py-1 rounded text-xs">{strategy.timeframe}</span>
                    </div>
                    <p className="text-gray-500 text-sm">最後回測：{strategy.lastBacktest}</p>
                  </div>

                  <div className="flex gap-6 text-right">
                    <div>
                      <p className="text-gray-400 text-xs">收益率</p>
                      <p className={`text-xl font-bold ${getReturnColor(strategy.return)}`}>
                        {strategy.return > 0 ? "+" : ""}{strategy.return}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">最大回撤</p>
                      <p className="text-xl font-bold text-red-400">{strategy.maxDrawdown}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">勝率</p>
                      <p className="text-xl font-bold">{strategy.winRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">交易次數</p>
                      <p className="text-xl font-bold">{strategy.trades}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteStrategy(strategy.id)}
                    className="ml-4 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 統計 */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">總策略數</p>
            <p className="text-2xl font-bold">{strategies.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">運行中</p>
            <p className="text-2xl font-bold text-green-400">{strategies.filter(s => s.status === "active").length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">平均收益率</p>
            <p className={`text-2xl font-bold ${strategies.length > 0 ? (strategies.reduce((a, b) => a + b.return, 0) / strategies.length >= 0 ? "text-green-400" : "text-red-400") : "text-gray-400"}`}>
              {strategies.length > 0 ? (strategies.reduce((a, b) => a + b.return, 0) / strategies.length).toFixed(1) : 0}%
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">總交易次數</p>
            <p className="text-2xl font-bold">{strategies.reduce((a, b) => a + b.trades, 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
