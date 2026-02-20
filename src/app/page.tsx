import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-2">🎛️ 控制台</h1>
        <p className="text-gray-400 mb-12">你的 AI 控制中心</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/tasks"
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-colors group"
          >
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
              任務看板
            </h2>
            <p className="text-gray-400 text-sm">
              追蹤任務狀態和負責人。誰在做什麼一目了然。
            </p>
          </Link>

          <Link
            href="/calendar"
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-colors group"
          >
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
              日曆
            </h2>
            <p className="text-gray-400 text-sm">
              排程任務、提醒和定時工作。
            </p>
          </Link>

          <Link
            href="/memory"
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-colors group"
          >
            <div className="text-4xl mb-4">🧠</div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
              記憶庫
            </h2>
            <p className="text-gray-400 text-sm">
              可搜尋的記憶和過往決定。
            </p>
          </Link>

          <Link
            href="/team"
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-colors group"
          >
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
              團隊
            </h2>
            <p className="text-gray-400 text-sm">
              子代理和團隊結構。
            </p>
          </Link>

          <Link
            href="/strategies"
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-500 transition-colors group"
          >
            <div className="text-4xl mb-4">📈</div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-green-400 transition-colors">
              量化策略庫
            </h2>
            <p className="text-gray-400 text-sm">
              交易策略管理与回测结果。
            </p>
          </Link>

          <Link
            href="/strategy-rewrite"
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500 transition-colors group"
          >
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
              策略改寫
            </h2>
            <p className="text-gray-400 text-sm">
              AI 幫你優化交易策略代碼。
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
