import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = "8530179452:AAGFi3oEJ9gR_otuwKqHZqX-mx-JQWXqPVM";
const GROUP_ID = "-1003759037413";

export async function GET(request: NextRequest) {
  try {
    // 獲取最近的群組訊息
    const offset = request.nextUrl.searchParams.get("offset") || "0";
    
    // 注意：Telegram Bot 無法直接讀取群組訊息
    // 需要將機器人設為管理員或啟用群組訊息權限
    
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?chat_id=${GROUP_ID}&limit=10`,
      { cache: "no-store" }
    );
    
    const data = await response.json();
    
    if (!data.ok) {
      return NextResponse.json({ 
        success: false, 
        error: data.description,
        hint: "請確保機器人有讀取群組訊息的權限" 
      });
    }
    
    // 過濾出包含策略代碼的訊息
    const messages = data.result
      .filter((update: any) => update.message?.text)
      .map((update: any) => ({
        message_id: update.message.message_id,
        text: update.message.text,
        from: update.message.from?.first_name || "Unknown",
        date: new Date(update.message.date * 1000).toISOString(),
      }))
      .reverse();
    
    return NextResponse.json({ 
      success: true, 
      messages 
    });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: "獲取訊息失敗" 
    });
  }
}
