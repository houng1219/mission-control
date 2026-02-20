import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// 簡易儲存（用於 Vercel 環境）
// 生產環境應該用數據庫

interface BacktestResult {
  id: string;
  code: string;
  name: string;
  symbol: string;
  timeframe: string;
  createdAt: string;
  return: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
  sharpe: number;
  equityCurve?: number[];
}

const results: BacktestResult[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, symbol, timeframe } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: "缺少策略代碼" }, { status: 400 });
    }

    // 生成 ID
    const id = crypto.randomBytes(8).toString("hex");

    // 模擬回測結果（實際應該調用 Python 腳本）
    const result: BacktestResult = {
      id,
      code,
      name: name || `策略_${id.substring(0, 6)}`,
      symbol: symbol || "BTCUSDT",
      timeframe: timeframe || "1H",
      createdAt: new Date().toISOString(),
      return: Math.random() * 200 - 50, // 模擬 -50% 到 +150%
      maxDrawdown: Math.random() * 20,
      winRate: Math.random() * 40 + 30,
      trades: Math.floor(Math.random() * 200) + 20,
      sharpe: Math.random() * 2,
    };

    results.push(result);

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, results });
}
