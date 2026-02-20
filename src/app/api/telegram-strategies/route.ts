import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = "8530179452:AAGFi3oEJ9gR_otuwKqHZqX-mx-JQWXqPVM";
const GROUP_ID = "-1003759037413";

// 簡單的本地存儲（Vercel 會重置，建議用外部 DB）
let cachedMessages: any[] = [];
let lastUpdateId = 0;

export async function GET(request: NextRequest) {
  try {
    // 獲取最新的群組訊息
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?chat_id=${GROUP_ID}&offset=${lastUpdateId + 1}&limit=10`,
      { cache: "no-store" }
    );
    
    const data = await response.json();
    
    if (!data.ok) {
      // 如果無法獲取，回傳緩存的訊息
      return NextResponse.json({ 
        success: true, 
        messages: cachedMessages,
        cached: true,
        error: data.description 
      });
    }
    
    // 過濾並處理新訊息
    const newMessages = data.result
      .filter((update: any) => update.message?.text && isStrategyCode(update.message.text))
      .map((update: any) => {
        const msg = update.message;
        return {
          id: msg.message_id,
          text: msg.text,
          from: msg.from?.first_name || msg.from?.username || "Unknown",
          date: new Date(msg.date * 1000).toISOString(),
        };
      })
      .reverse();
    
    // 更新 offset
    if (data.result.length > 0) {
      lastUpdateId = data.result[data.result.length - 1].update_id;
    }
    
    // 加入緩存
    cachedMessages = [...newMessages, ...cachedMessages].slice(0, 50);
    
    return NextResponse.json({ 
      success: true, 
      messages: newMessages.length > 0 ? cachedMessages : cachedMessages,
      count: newMessages.length
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: "獲取訊息失敗" 
    });
  }
}

// 簡單判斷是否為策略代碼
function isStrategyCode(text: string): boolean {
  const strategyKeywords = [
    'strategy', 'strategy(', '@version', 'pinescript',
    'request.security', 'ta.rsi', 'ta.sma', 'ta.ema',
    'strategy.entry', 'strategy.exit', 'strategy.close',
    'if ', 'buy', 'sell', 'long', 'short',
    'stopLoss', 'takeProfit', 'stop_loss', 'take_profit',
    '//', '///', '/*', '*/',
  ];
  
  const lowerText = text.toLowerCase();
  
  // 檢查關鍵字
  const hasKeyword = strategyKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  
  // 檢查是否有代碼特徵（多行、包含特殊符號）
  const hasCodeFeatures = 
    text.includes('\n') && 
    (text.includes('(') || text.includes(')') || text.includes('[') || text.includes(']'));
  
  return hasKeyword || hasCodeFeatures;
}
