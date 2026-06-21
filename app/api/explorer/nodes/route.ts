import { NextRequest } from 'next/server';

const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL ?? '';

// Live node status list — proxies the indexer's /api/nodes (who is
// connected to the coordinator right now, with online flag + job counts).
export async function GET(_req: NextRequest) {
  if (!INDEXER_URL) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch(`${INDEXER_URL}/api/nodes`, { cache: 'no-store' });
    if (!res.ok) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
