import React from "react";
import type { GoldRequest, GoldState } from "./useGoldState";

interface Props {
  state: GoldState;
  updateRequestStatus: (requestId: string, status: string) => void;
}

const STATUS_ACTIONS = [
  "KYC approved",
  "Issuer approved",
  "Settlement pending",
  "Completed",
  "Rejected",
];

function shortAddress(address: string) {
  if (!address?.startsWith("0x") || address.length < 12) return address || "--";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RequestRow({ request, onStatus }: { request: GoldRequest; onStatus: (status: string) => void }) {
  return (
    <article className="border border-gray-100 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs px-2 py-1 rounded-full border ${
                request.type === "subscription"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {request.type === "subscription" ? "申購" : "贖回"}
            </span>
            <strong className="text-gray-800">{request.amount.toLocaleString()} GGT</strong>
          </div>
          <p className="text-sm text-gray-500">
            {shortAddress(request.wallet)} · {fmtDate(request.createdAt)}
          </p>
          <code className="block text-xs text-blue-700 break-all mt-2">{request.requestHash}</code>
        </div>
        <div className="md:text-right">
          <div className="text-xs text-gray-500 mb-2">目前狀態</div>
          <div className="text-sm text-gray-800 mb-3" style={{ fontWeight: 600 }}>
            {request.status}
          </div>
          <div className="flex flex-wrap md:justify-end gap-2">
            {STATUS_ACTIONS.map((status) => (
              <button
                key={status}
                onClick={() => onStatus(status)}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700"
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

export function BackOfficePage({ state, updateRequestStatus }: Props) {
  const pending = state.requests.filter((request) => !["Completed", "Rejected"].includes(request.status));
  const closed = state.requests.filter((request) => ["Completed", "Rejected"].includes(request.status));

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="mb-8">
        <p className="text-xs text-amber-700 mb-2" style={{ fontWeight: 700 }}>
          BACK OFFICE
        </p>
        <h1 className="text-gray-900 mb-2">後台管理者頁面</h1>
        <p className="text-gray-500">
          處理學生提交的申購與贖回申請，更新 KYC、發行審核、鏈下交割與結案狀態。
        </p>
      </div>

      <section className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          ["待處理申請", pending.length],
          ["已結案", closed.length],
          ["白名單錢包", state.whitelist.length],
          ["凍結帳戶", state.frozen.length],
        ].map(([label, value]) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-2xl text-gray-900 mt-1" style={{ fontWeight: 700 }}>
              {value}
            </div>
          </div>
        ))}
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-800">待處理申請</h2>
          <span className="text-sm text-gray-400">{pending.length} 筆</span>
        </div>
        <div className="space-y-3">
          {pending.length ? (
            pending.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
                onStatus={(status) => updateRequestStatus(request.id, status)}
              />
            ))
          ) : (
            <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-400">
              目前沒有待處理申請。
            </div>
          )}
        </div>
      </section>

      {closed.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-800">已結案申請</h2>
            <span className="text-sm text-gray-400">{closed.length} 筆</span>
          </div>
          <div className="space-y-3">
            {closed.map((request) => (
              <RequestRow
                key={request.id}
                request={request}
                onStatus={(status) => updateRequestStatus(request.id, status)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
