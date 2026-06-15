import React, { useState } from "react";
import type { GoldRequest, GoldState } from "./useGoldState";

interface Props {
  state: GoldState;
  onNavigate: (tab: string) => void;
  createRequest: (input: { type: "subscription" | "redemption"; wallet: string; amount: number }) => Promise<GoldRequest>;
}

const EVENT_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  mint: { label: "Mint", color: "text-green-700 bg-green-50 border-green-200", dot: "bg-green-500" },
  burn: { label: "Burn", color: "text-red-700 bg-red-50 border-red-200", dot: "bg-red-500" },
  freeze: { label: "凍結", color: "text-blue-700 bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  unfreeze: { label: "解凍", color: "text-cyan-700 bg-cyan-50 border-cyan-200", dot: "bg-cyan-500" },
  pause: { label: "暫停", color: "text-orange-700 bg-orange-50 border-orange-200", dot: "bg-orange-500" },
  unpause: { label: "恢復", color: "text-teal-700 bg-teal-50 border-teal-200", dot: "bg-teal-500" },
  whitelist: { label: "白名單", color: "text-purple-700 bg-purple-50 border-purple-200", dot: "bg-purple-500" },
  proof: { label: "Proof", color: "text-amber-700 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  request: { label: "申請", color: "text-gray-700 bg-gray-50 border-gray-200", dot: "bg-gray-400" },
  wallet: { label: "Wallet", color: "text-sky-700 bg-sky-50 border-sky-200", dot: "bg-sky-500" },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortAddress(address: string) {
  if (!address?.startsWith("0x") || address.length < 12) return address || "--";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function DashboardPage({ state, onNavigate, createRequest }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [requestType, setRequestType] = useState<"subscription" | "redemption">("subscription");
  const [wallet, setWallet] = useState(state.walletAddress || "");
  const [amount, setAmount] = useState("100");
  const [message, setMessage] = useState("");
  const coverage = state.supply > 0 ? (state.reserve / state.supply) * 100 : 100;
  const coverageColor = coverage >= 110 ? "text-green-600" : coverage >= 100 ? "text-amber-600" : "text-red-600";
  const barColor = coverage >= 110 ? "bg-green-500" : coverage >= 100 ? "bg-amber-500" : "bg-red-500";
  const visible = showAll ? state.events : state.events.slice(0, 5);

  async function handleRequest(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      const request = await createRequest({ type: requestType, wallet, amount: Number(amount) });
      setMessage(`已建立申請 ${request.id}`);
      setAmount("100");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "建立申請失敗");
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-gray-800 mb-1">系統儀表板</h2>
          <p className="text-gray-500">查看儲備、發行量、Proof Hash、申購 / 贖回申請與事件紀錄。</p>
        </div>
        {state.paused && (
          <div className="bg-orange-100 border border-orange-300 text-orange-700 px-4 py-2 rounded-lg text-sm" style={{ fontWeight: 600 }}>
            合約已暫停
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">儲備覆蓋率 RCR</div>
              <div className={`text-4xl ${coverageColor}`} style={{ fontWeight: 700 }}>
                {coverage.toFixed(1)}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">安全門檻</div>
              <div className="text-gray-700" style={{ fontWeight: 600 }}>
                ≥ 100%
              </div>
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${Math.min(coverage, 130)}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <div className="text-sm text-gray-500">黃金儲備</div>
              <div className="text-xl text-amber-700" style={{ fontWeight: 600 }}>
                {state.reserve.toLocaleString()} g
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-sm text-gray-500">GGT 發行量</div>
              <div className="text-xl text-gray-700" style={{ fontWeight: 600 }}>
                {state.supply.toLocaleString()} GGT
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex-1">
            <div className="text-sm text-gray-500 mb-2">最新 Proof Hash</div>
            <div className="font-mono text-xs text-gray-700 break-all bg-gray-50 rounded-lg p-3 border border-gray-100">{state.proofHash}</div>
            <div className="text-xs text-gray-400 mt-2">更新於 {fmtDate(state.proofUpdated)}</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-2">Sepolia 合約</div>
            <code className="block text-xs text-blue-700 break-all bg-blue-50 rounded-lg p-3 border border-blue-100">{state.contractAddress}</code>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-3">合規狀態</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">白名單</span>
                <strong>{state.whitelist.length} 位</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">凍結帳戶</span>
                <strong>{state.frozen.length} 位</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">申請</span>
                <strong>{state.requests.length} 筆</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-gray-700 mb-4">白名單 / 凍結狀態</h3>
          <div className="space-y-3">
            {state.whitelist.map((address) => (
              <div key={address} className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                <span className="font-mono text-xs text-gray-700 truncate">{shortAddress(address)}</span>
                <span className="text-xs text-green-600 ml-2 flex-shrink-0">已通過</span>
              </div>
            ))}
            {state.frozen.map((address) => (
              <div key={address} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <span className="font-mono text-xs text-gray-700 truncate">{shortAddress(address)}</span>
                <span className="text-xs text-red-600 ml-2 flex-shrink-0">凍結</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-gray-700 mb-4">申購 / 贖回申請</h3>
          <form onSubmit={handleRequest} className="space-y-3">
            <select value={requestType} onChange={(event) => setRequestType(event.target.value as "subscription" | "redemption")} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50">
              <option value="subscription">申購</option>
              <option value="redemption">贖回</option>
            </select>
            <input value={wallet} onChange={(event) => setWallet(event.target.value)} placeholder="0x wallet address" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono bg-gray-50" />
            <input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="1" step="1" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50" />
            <button className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg text-sm transition-colors" style={{ fontWeight: 600 }}>
              建立申請
            </button>
            {message && <p className="text-xs text-gray-500">{message}</p>}
          </form>
          <div className="mt-4 space-y-2">
            {state.requests.slice(0, 3).map((request) => (
              <div key={request.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between text-sm text-gray-700">
                  <strong>{request.type === "subscription" ? "申購" : "贖回"} {request.amount.toLocaleString()} GGT</strong>
                  <span>{fmtDate(request.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{request.status} · {shortAddress(request.wallet)}</p>
                <code className="block text-xs text-blue-700 break-all mt-1">{request.requestHash}</code>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-gray-700 mb-5">事件紀錄</h3>
        {state.events.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">目前沒有事件。</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
            <ul className="space-y-4">
              {visible.map((event) => {
                const meta = EVENT_LABELS[event.type] || EVENT_LABELS.request;
                return (
                  <li key={event.id} className="flex gap-4 relative">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${meta.dot} shadow-sm z-10`}>
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${meta.color}`} style={{ fontWeight: 600 }}>{meta.label}</span>
                        <span className="text-xs text-gray-400">{event.actor}</span>
                        <span className="text-xs text-gray-400 ml-auto">{fmtDate(event.time)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{event.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {state.events.length > 5 && (
          <button onClick={() => setShowAll(!showAll)} className="mt-2 text-sm text-amber-600 hover:text-amber-800 w-full text-center py-2">
            {showAll ? "收起" : `顯示全部 ${state.events.length} 筆紀錄`}
          </button>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center">
        <p className="text-gray-600 mb-3">想要執行 proof、mint、freeze 或 burn？</p>
        <button onClick={() => onNavigate("admin")} className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg transition-colors" style={{ fontWeight: 600 }}>
          前往控制台
        </button>
      </div>
    </div>
  );
}
