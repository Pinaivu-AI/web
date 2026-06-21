import { NextRequest } from 'next/server';

const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL ?? '';

// Live node details — proxies the indexer's /api/nodes/:peer_id (live
// status block + lifetime jobs_served + recent receipts).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ peerId: string }> },
) {
  const { peerId } = await params;

  if (!INDEXER_URL) {
    return new Response(JSON.stringify({ error: 'indexer not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch(`${INDEXER_URL}/api/nodes/${peerId}`, { cache: 'no-store' });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'not found' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'indexer unreachable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
