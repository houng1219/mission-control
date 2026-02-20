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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("已複製到剪貼簿！");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        <Link href="/" className="text-blue-400 hover:underline mb-4 inline-block">
          ← 返回控制台
        </Link>
        
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold">📚 策略庫</h1>
          <button
            onClick={fetchStrategies}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {isLoading ? "載入中..." : "📥 獲取策略"}
          </button>
        </div>
        <p className="text-gray-400 mb-6">存放群組內的策略代碼</p>

        {/* 策略列表 */}
        {showList && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategies.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">尚無策略</p>
                <p className="text-sm text-gray-600">點擊「獲取策略」從群組導入</p>
              </div>
            ) : (
              strategies.map((strategy) => (
                <div
                  key={strategy.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-blue-400">#{strategy.id}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(strategy.date).toLocaleString()}
                    </span>
                  </div>
                  <pre className="text-xs text-green-400 bg-gray-800 rounded p-2 max-h-40 overflow-y-auto mb-3">
                    {strategy.text}
                  </pre>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">from: {strategy.from}</span>
                    <button
                      onClick={() => copyToClipboard(strategy.text)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      📋 複製
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!showList && (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-2">點擊「獲取策略」從群組導入</p>
            <p className="text-sm text-gray-600">策略會以卡片方式展示，方便複製使用</p>
          </div>
        )}
      </div>
    </div>
  );
}
