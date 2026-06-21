'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { explorerUrl } from '@/lib/domains';
import {
  ArrowLeft,
  Cpu,
  Server,
  Clock,
  Wallet,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface LiveNode {
  peer_id: string;
  online: boolean;
  last_seen_ms: number;
  seconds_since_seen: number;
  models: string[];
  max_concurrent_jobs: number;
  multiaddrs: string[];
}

interface ReceiptRow {
  request_id: string;
  receipt_json: {
    primary_peer_id?: string;
    payouts?: { sui_address: string; amount_nanox: number }[];
    timestamp_ms?: number;
  };
  created_at: string;
  walrus_blob_id: string | null;
}

interface NodeProfile {
  peer_id: string;
  live: LiveNode | null;
  jobs_served: number;
  recent_receipts: ReceiptRow[];
}

export default function NodeDetailPage({
  params,
}: {
  params: Promise<{ peerId: string }>;
}) {
  const { peerId } = use(params);
  const [data, setData] = useState<NodeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/explorer/nodes/${peerId}`);
        if (res.ok) setData(await res.json());
      } catch {}
      setLoading(false);
    }
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [peerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">Node not found.</p>
        <a href={explorerUrl()} className="text-accent hover:text-accent-hover text-sm">Back to explorer</a>
      </div>
    );
  }

  const live = data.live;
  const online = live?.online ?? false;

  return (
    <div className="min-h-screen bg-surface overflow-y-auto" style={{ height: '100vh' }}>
      <header className="border-b border-surface-2/50 bg-surface-1 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <a href={explorerUrl()} className="p-1.5 rounded-lg hover:bg-surface-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div className="flex items-center gap-3">
            <img src="/Pinaivu_logo.jpg" alt="Pinaivu" className="w-7 h-7 rounded-lg" />
            <div>
              <h1 className="text-sm font-semibold text-zinc-100">Node Details</h1>
              <p className="text-[11px] text-zinc-500 font-mono truncate max-w-[60vw]">{data.peer_id}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Status banner */}
        <div
          className={`flex items-center gap-3 mb-8 rounded-xl px-5 py-3.5 border ${
            online
              ? 'bg-emerald-500/5 border-emerald-500/15'
              : 'bg-zinc-500/5 border-zinc-500/15'
          }`}
        >
          <span className="relative flex-shrink-0">
            <Cpu className={`w-5 h-5 ${online ? 'text-emerald-400' : 'text-zinc-500'}`} />
            <span
              className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-surface ${
                online ? 'bg-emerald-400' : 'bg-zinc-600'
              }`}
            />
          </span>
          <div>
            <p className={`text-sm font-medium ${online ? 'text-emerald-300' : 'text-zinc-300'}`}>
              {online ? 'Online' : 'Offline'}
            </p>
            <p className="text-[12px] text-zinc-500">
              {live
                ? `Last seen ${live.seconds_since_seen}s ago`
                : 'Not currently connected to the coordinator'}
            </p>
          </div>
          <span className="ml-auto text-[11px] text-zinc-500">{data.jobs_served} jobs served</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: live status */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Live Status" icon={<Server className="w-4 h-4" />}>
              {live ? (
                <>
                  <Row label="Models" value={live.models.join(', ') || '—'} mono />
                  <Row label="Max Concurrent Jobs" value={String(live.max_concurrent_jobs)} />
                  <Row label="Last Seen" value={new Date(live.last_seen_ms).toLocaleString()} />
                  <div className="space-y-1">
                    <span className="text-[12px] text-zinc-500">Multiaddrs</span>
                    {live.multiaddrs.length > 0 ? (
                      live.multiaddrs.map((m, i) => (
                        <span key={i} className="text-[11px] font-mono text-zinc-400 block break-all">{m}</span>
                      ))
                    ) : (
                      <span className="text-[11px] text-zinc-600">none advertised</span>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-[13px] text-zinc-500">
                  This node is not currently in the coordinator&apos;s live registry. Historical
                  activity is shown below.
                </p>
              )}
            </Card>
          </div>

          {/* Right: summary */}
          <div className="space-y-6">
            <Card title="Summary" icon={<Wallet className="w-4 h-4" />}>
              <Row label="Status" value={online ? 'Online' : 'Offline'} />
              <Row label="Jobs Served" value={String(data.jobs_served)} />
              <Row label="Recent Receipts" value={String(data.recent_receipts.length)} />
            </Card>
          </div>
        </div>

        {/* Recent receipts served */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-4">
            Recent Jobs Served
          </h3>
          {data.recent_receipts.length === 0 ? (
            <div className="bg-surface-1 border border-surface-2/60 rounded-xl px-6 py-8 text-center">
              <p className="text-zinc-500 text-sm">No jobs recorded for this node yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.recent_receipts.map((r) => {
                const total = (r.receipt_json.payouts ?? []).reduce((s, p) => s + p.amount_nanox, 0);
                return (
                  <Link
                    key={r.request_id}
                    href={`/r/${r.request_id}`}
                    className="group flex items-center gap-4 bg-surface-1 border border-surface-2/60 rounded-xl px-5 py-3.5
                               hover:border-accent/30 hover:bg-surface-2/30 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[13px] text-zinc-200 truncate block">{r.request_id}</span>
                      <span className="flex items-center gap-1 text-[11px] text-zinc-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {timeAgo(r.created_at)}
                      </span>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {total > 0 ? (
                        <span className="text-sm font-medium text-emerald-400">{(total / 1e9).toFixed(6)}</span>
                      ) : (
                        <span className="text-[11px] text-zinc-600">free</span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-accent flex-shrink-0 transition-colors" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-surface-1 border border-surface-2/60 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-accent">{icon}</span>
        <h3 className="text-sm font-medium text-zinc-200">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <span className="text-[12px] text-zinc-500">{label}</span>
      <span className={`block text-[13px] text-zinc-200 break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
