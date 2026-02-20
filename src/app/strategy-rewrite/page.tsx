"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface StrategyMessage {
  id: number;
  text: string;
  from: string;
  date: string;
  selected?: boolean;
}

export default function StrategyRewritePage() {
  const [originalCode, setOriginalCode] = useState("");
  const [rewrittenCode, setRewrittenCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [strategies, setStrategies] = useState<StrategyMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  // 自動獲取群組策略
  const fetchStrategies = async () => {
    try {
      const response = await fetch("/api/telegram-strategies");
      const data = await response.json();
      
      if (data.success && data.messages) {
        setStrategies(data.messages);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Failed to fetch strategies:", error);
    }
    setIsLoading(false);
  };

  // 頁面載入時自動獲取
  useEffect(() => {
    fetchStrategies();
    
    // 每 30 秒自動刷新
    const interval = setInterval(fetchStrategies, 30000);
    return () => clearInterval(interval);
  }, []);

  const rewriteStrategy = async () => {
    if (!originalCode.trim()) {
      alert("請選擇或輸入策略代碼");
      return;
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const optimized = originalCode
      .replace(/RSI/g, "RSI + EMA")
      .replace(/if.* Buy/g, "if (RSI < 30 && EMA > SMA) Buy")
      .replace(/if.* Sell/g, "if (RSI > 70 && EMA < SMA) Sell")
      .replace(/stopLoss: 2%/g, "stopLoss: 1.5%")
      .replace(/takeProfit: 5%/g, "takeProfit: 3%");

    setRewrittenCode(optimized);
    setIsProcessing(false);
  };

  const selectStrategy = (strategy: StrategyMessage) => {
    setOriginalCode(strategy.text);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("已複製到剪貼簿！ return (
    <div className="");
  };

 min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        <Link href="/" className="text-blue-400 hover:underline mb-4 inline-block">
          ← 返回控制台
        </Link>
        
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold">📝 量化策略改寫</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              最後更新：{lastUpdate || "載入中..."}
            </span>
            <button
              onClick={fetchStrategies}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
            >
              🔄 刷新
            </button>
          </div>
        </div>
        <p className="text-gray-400 mb-6">自動記錄群組內的策略代碼</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：群組策略列表 */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-4">📥 群組策略</h2>
            
            {isLoading ? (
              <p className="text-gray-500 text-center py-8">載入中...</p>
            ) : strategies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">尚無策略</p>
                <p className="text-sm text-gray-600">
                  在群組發送策略代碼會自動顯示在這裡
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {strategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    onClick={() => selectStrategy(strategy)}
                    className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-blue-400">
                        #{strategy.id}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(strategy.date).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 truncate mb-1">
                      {strategy.text.substring(0, 50)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      from: {strategy.from}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 中間：原始策略 */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">📄 原始策略</h2>
            </div>
            <textarea
              value={originalCode}
              onChange={(e) => setOriginalCode(e.target.value)}
              placeholder="從左側選擇策略或直接輸入..."
              className="w-full h-[500px] bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm font-mono text-green-400 resize-none focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={rewriteStrategy}
              disabled={isProcessing || !originalCode.trim()}
              className={`mt-4 w-full py-3 rounded-lg font-medium transition-colors ${
                isProcessing || !originalCode.trim()
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isProcessing ? "🔄 處理中..." : "🚀 開始改寫"}
            </button>
          </div>

          {/* 右側：優化後策略 */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">✨ 優化後策略</h2>
              {rewrittenCode && (
                <button
                  onClick={() => copyToClipboard(rewrittenCode)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  📋 複製
                </button>
              )}
            </div>
            <textarea
              value={rewrittenCode}
              readOnly
              placeholder="改寫後的策略會在這裡顯示..."
              className="w-full h-[500px] bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm font-mono text-blue-400 resize-none focus:outline-none"
            />
          </div>
        </div>

        {/* 優化建議 */}
        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">💡 優化建議</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-yellow-400 mb-2">⚠️ 風險控制</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• 建議將止損從 2% 降至 1.5%</li>
                <li>• 建議將止盈從 5% 降至 3%</li>
                <li>• 增加移動止損保護利潤</li>
              </ul>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-blue-400 mb-2">🔗 指標組合</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• RSI + EMA 確認趨勢</li>
                <li>• 加入 MACD 濾除假信號</li>
                <li>• 使用ATR計算頭寸大小</li>
              </ul>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-green-400 mb-2">📊 進出场時機</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• 超買超賣結合趨勢過濾</li>
                <li>• 增加成交量確認信號</li>
                <li>• 建議使用多時間框架分析</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
