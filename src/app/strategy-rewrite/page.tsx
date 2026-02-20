"use client";

import { useState } from "react";
import Link from "next/link";

interface StrategyMessage {
  id: number;
  text: string;
  from: string;
  date: string;
}

export default function StrategyRewritePage() {
  const [originalCode, setOriginalCode] = useState("");
  const [rewrittenCode, setRewrittenCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [strategies, setStrategies] = useState<StrategyMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showList, setShowList] = useState(false);

  const fetchStrategies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/telegram-strategies");
      const data = await response.json();
      
      if (data.success && data.messages) {
        setStrategies(data.messages);
        setShowList(true);
      } else {
        alert("尚無策略記錄");
      }
    } catch (error) {
      alert("獲取失敗");
    }
    setIsLoading(false);
  };

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
    setShowList(false);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("已複製到剪貼簿！");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        <Link href="/" className="text-blue-400 hover:underline mb-4 inline-block">
          ← 返回控制台
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">📝 量化策略改寫</h1>
        <p className="text-gray-400 mb-6">手動記錄群組策略並改寫</p>

        {/* 策略列表彈窗 */}
        {showList && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">📋 選擇策略</h2>
                <button onClick={() => setShowList(false)} className="text-gray-500 hover:text-white">✕</button>
              </div>
              
              {strategies.length === 0 ? (
                <p className="text-gray-500 text-center py-8">尚無策略</p>
              ) : (
                <div className="space-y-3">
                  {strategies.map((strategy) => (
                    <div
                      key={strategy.id}
                      onClick={() => selectStrategy(strategy)}
                      className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-blue-400">#{strategy.id}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(strategy.date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 truncate">
                        {strategy.text.substring(0, 80)}...
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 原始策略 */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">📄 原始策略</h2>
              <button
                onClick={fetchStrategies}
                disabled={isLoading}
                className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded disabled:opacity-50"
              >
                {isLoading ? "載入中..." : "📥 獲取策略"}
              </button>
            </div>
            <textarea
              value={originalCode}
              onChange={(e) => setOriginalCode(e.target.value)}
              placeholder="選擇策略或直接輸入..."
              className="w-full h-[500px] bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm font-mono text-green-400 resize-none focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={rewriteStrategy}
              disabled={isProcessing || !originalCode.trim()}
              className={`mt-4 w-full py-3 rounded-lg font-medium transition-colors ${
                isProcessing || !originalCode.trim() ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isProcessing ? "🔄 處理中..." : "🚀 開始改寫"}
            </button>
          </div>

          {/* 優化後策略 */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">✨ 優化後策略</h2>
              {rewrittenCode && (
                <button onClick={() => copyToClipboard(rewrittenCode)} className="text-sm text-blue-400 hover:text-blue-300">
                  📋 複製
                </button>
              )}
            </div>
            <textarea
              value={rewrittenCode}
              readOnly
              placeholder="改寫後的策略..."
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
