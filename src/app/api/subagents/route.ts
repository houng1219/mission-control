import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'subagent-status.json');

export async function GET() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json({ lastUpdate: null, agents: [] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read subagent data' }, { status: 500 });
  }
}
