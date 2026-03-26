import fs from 'fs';
import path from 'path';

export interface Session {
  id: string;
  name?: string;
  title: string;
  source_text: string;
  active_lens: string;
  created_at: string;
}

export interface ScaffoldNode {
  id: string;
  session_id: string;
  title?: string;
  evidence_quote: string;
  student_claim: string;
  order_index: number;
}

export interface Provocation {
  id: string;
  target_text_range: string;
  challenge_text: string;
  related_node_id: string;
  status: 'pending' | 'resolved';
}

export interface Draft {
  session_id: string;
  content: string;
  last_trigger_word_count: number;
}

export interface DBType {
  sessions: Session[];
  scaffoldNodes: ScaffoldNode[];
  provocations: Provocation[];
  drafts: Draft[];
}

const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel 
  ? '/tmp/db.json' 
  : path.join(process.cwd(), 'src/lib/db.json');

// On Vercel, /tmp is ephemeral — seed it from the bundled db.json on cold start.
function ensureDB(): void {
  if (!isVercel) return;
  if (fs.existsSync(dbPath)) return; // already seeded in this warm instance
  try {
    const seedPath = path.join(process.cwd(), 'src/lib/db.json');
    if (fs.existsSync(seedPath)) {
      fs.copyFileSync(seedPath, dbPath);
    } else {
      // Write a minimal empty-but-valid DB so writes don't fail
      const empty: DBType = { sessions: [], scaffoldNodes: [], provocations: [], drafts: [] };
      fs.writeFileSync(dbPath, JSON.stringify(empty, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Failed to seed /tmp/db.json:', err);
  }
}

export function readDB(): DBType {
  ensureDB();
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data) as DBType;
  } catch (error) {
    console.error('Error reading db.json:', error);
    return {
      sessions: [],
      scaffoldNodes: [],
      provocations: [],
      drafts: [],
    };
  }
}

export function writeDB(data: DBType): void {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to db.json:', error);
  }
}
