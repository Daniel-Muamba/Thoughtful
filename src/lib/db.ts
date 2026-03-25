import fs from 'fs';
import path from 'path';

export interface Session {
  id: string;
  title: string;
  source_text: string;
  active_lens: string;
  created_at: string;
}

export interface ScaffoldNode {
  id: string;
  session_id: string;
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

const dbPath = path.join(process.cwd(), 'src/lib/db.json');

export function readDB(): DBType {
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
