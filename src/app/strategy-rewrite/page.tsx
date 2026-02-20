"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface StrategyRewrite {
  id: string;
  originalName: string;
  rewrittenName: string;
  originalCode: string;
  rewrittenCode: string;
  timestamp: string;
}

interface TelegramMessage {
  message_id: number;
  text: string;
  from: string;
  date: string;
}

export default function StrategyRewritePage() {
  const [originalCode, setOriginalCode] = useState("");
  const [rewrittenCode, setRewrittenCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<StrategyRewrite[]>([]);
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showMessageList, setShowMessageList] = useState(false);

  // 從 Telegram 群組獲取訊息
  const fetchFromGroup = async () => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch("/api/telegram-messages");
      const data = await response.json();
      
      if (data.success && data.messages) {
        setMessages(data.messages);
        setShowMessageList(true);
      } else {
        alert(data.hint || data.error || "無法獲取訊息");
      }
    } catch (error) {
      alert("獲取失敗，請確保機器人有群組權限");
    }
    setIsLoadingMessages(false);
  };

  // 選擇訊息
  const selectMessage = (msg: TelegramMessage) => {
    setOriginalCode(msg.text);
    setShowMessageList(false);
  };

  const rewriteStrategy = async () => {
    if (!originalCode.trim()) {
      alert("請輸入原始策略代碼");
      return;
    }

    setIsProcessing(true);

    // 模擬策略改寫過程
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 簡單的策略優化示例
    const optimized = originalCode
      .replace(/RSI/g, "RSI + EMA")
      .replace(/if.* Buy/g, "if (RSI < 30 && EMA > SMA) Buy")
      .replace(/if.* Sell/g, "if (RSI > 70 && EMA < SMA) Sell")
      .replace(/stopLoss: 2%/g, "stopLoss: 1.5%")
      .replace(/takeProfit: 5%/g, "takeProfit: 3%");

    setRewrittenCode(optimized);
    setIsProcessing(false);

    // 加入歷史記錄
    const newRewrite: StrategyRewrite = {
      id: Date.now().toString(),
      originalName: "策略-" + new Date().toLocaleTimeString(),
      rewrittenName: "優化策略-" + new Date().toLocaleTimeString(),
      originalCode,
      rewrittenCode: optimized,
      timestamp: new Date().toISOString(),
    };
    setHistory([newRewrite, ...history]);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("已複製到剪貼簿！");
  };

  const clearAll = () => {
    setOriginalCode("");
    setRewrittenCode("");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-6xl mx-auto p-8">
        <Link href="/" className="text-blue-400 hover:underline mb-4 inline-block">
          ← 返回控制台
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">📝 量化策略改寫</h1>
        <p className="text-gray-400 mb-8">輸入你的策略代碼，AI 幫你優化與改寫</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 輸入區 */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">📄 原始策略</h2>
              <div className="flex gap-2">
                <button
                  onClick={fetchFromGroup}
                  disabled={isLoadingMessages}
                  className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors disabled:opacity-50"
                >
                  {isLoadingMessages ? "載入中..." : "📥 從群組獲取"}
                </button>
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-gray-300"
                >
                  清空
                </button>
              </div>
            </div>

            {/* 群組訊息列表 */}
            {showMessageList && messages.length > 0 && (
              <div className="mb-4 bg-gray-800 rounded-lg p-3 max-h-48 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">選擇訊息：</span>
                  <button
                    onClick={() => setShowMessageList(false)}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
                {messages.map((msg) => (
                  <button
                    key={msg.message_id}
                    onClick={() => selectMessage(msg)}
                    className="w-full text-left p-2 hover:bg-gray-700 rounded text-sm truncate"
                  >
                    {msg.text.substring(0, 60)}...
                  </button>
                ))}
              </div>
            )}
            <textarea
              value={originalCode}
              onChange={(e) => setOriginalCode(e.target.value)}
              placeholder="// 輸入你的 Pine Script 或其他策略代碼...

// 示例：
// strategy('RSI Strategy', overlay=true)
rsi = request.security(ticker.new('BINANCE:BTCUSDT'), '60', rsi(14))
if rsi < 30
    strategy.entry('Buy', strategy.long)
if rsi > 70
    strategy.close('Buy')"
              className="w-full h-96 bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm font-mono text-green-400 resize-none focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={rewriteStrategy}
              disabled={isProcessing}
              className={`mt-4 w-full py-3 rounded-lg font-medium transition-colors ${
                isProcessing
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isProcessing ? "🔄 處理中..." : "🚀 開始改寫"}
            </button>
          </div>

          {/* 輸出區 */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
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
              className="w-full h-96 bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm font-mono text-blue-400 resize-none focus:outline-none"
            />
          </div>
        </div>

        {/* 優化建議 */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
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

        {/* 歷史記錄 */}
        {history.length > 0 && (
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">📜 改寫歷史</h2>
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{item.rewrittenName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setOriginalCode(item.originalCode);
                      setRewrittenCode(item.rewrittenCode);
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    查看
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
