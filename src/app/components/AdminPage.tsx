import React, { useState } from "react";
import { GoldState, useGoldState } from "./useGoldState";

interface Props {
  state: GoldState;
  update: ReturnType<typeof useGoldState>["update"];
  addEvent: ReturnType<typeof useGoldState>["addEvent"];
  completeTask: ReturnType<typeof useGoldState>["completeTask"];
}

const TASKS = [
  { id: "proof", label: "更新 Proof-of-Reserve", icon: "🔐" },
  { id: "whitelist", label: "加入白名單", icon: "📋" },
  { id: "mint", label: "Mint GGT", icon: "🪙" },
  { id: "freeze", label: "凍結 / 暫停帳戶", icon: "🔒" },
  { id: "burn", label: "Burn for Redemption", icon: "🔥" },
];

function Alert({ type, msg }: { type: "success" | "error"; msg: string }) {
  return (
    <div className={`text-sm px-4 py-3 rounded-lg border mt-3 ${type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
      {type === "success" ? "✅ " : "❌ "}{msg}
    </div>
  );
}

export function AdminPage({ state, update, addEvent, completeTask }: Props) {
  const [activeOp, setActiveOp] = useState("proof");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form fields
  const [proofHash, setProofHash] = useState("");
  const [reserveGrams, setReserveGrams] = useState("");
  const [wlAddress, setWlAddress] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [mintGrams, setMintGrams] = useState("");
  const [freezeAddress, setFreezeAddress] = useState("");
  const [burnAddress, setBurnAddress] = useState("");
  const [burnGrams, setBurnGrams] = useState("");

  function flash(type: "success" | "error", text: string) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  }

  function handleProof() {
    if (!proofHash.trim() || !reserveGrams) return flash("error", "請填寫 Proof Hash 與儲備量");
    const grams = parseFloat(reserveGrams);
    if (isNaN(grams) || grams <= 0) return flash("error", "儲備量必須為正數");
    update((s) => ({ ...s, reserve: grams, proofHash: proofHash.trim(), proofUpdated: new Date().toISOString() }));
    addEvent("proof", "Auditor", `更新 Proof Hash，黃金儲備設定為 ${grams}g`);
    completeTask("proof");
    setProofHash(""); setReserveGrams("");
    flash("success", `Proof-of-Reserve 已更新，儲備量 ${grams}g`);
  }

  function handleWhitelist() {
    if (!wlAddress.trim()) return flash("error", "請輸入錢包地址");
    if (state.whitelist.includes(wlAddress.trim())) return flash("error", "此地址已在白名單中");
    update((s) => ({ ...s, whitelist: [...s.whitelist, wlAddress.trim()] }));
    addEvent("whitelist", "Issuer", `加入白名單：${wlAddress.trim()}`);
    completeTask("whitelist");
    setWlAddress("");
    flash("success", `${wlAddress.trim()} 已加入白名單`);
  }

  function handleMint() {
    if (!mintAddress.trim() || !mintGrams) return flash("error", "請填寫地址與數量");
    if (!state.whitelist.includes(mintAddress.trim())) return flash("error", "地址不在白名單中，無法 Mint");
    if (state.paused) return flash("error", "合約已暫停，無法操作");
    const g = parseFloat(mintGrams);
    if (isNaN(g) || g <= 0) return flash("error", "數量必須為正數");
    if (state.supply + g > state.reserve) return flash("error", `Mint 後 GGT (${state.supply + g}g) 將超過儲備 (${state.reserve}g)，拒絕`);
    update((s) => ({ ...s, supply: s.supply + g }));
    addEvent("mint", "Issuer", `Mint ${g} GGT → ${mintAddress.trim()}`);
    completeTask("mint");
    setMintAddress(""); setMintGrams("");
    flash("success", `成功 Mint ${g} GGT 至 ${mintAddress.trim()}`);
  }

  function handleFreeze() {
    if (!freezeAddress.trim()) return flash("error", "請輸入地址");
    if (state.frozen.includes(freezeAddress.trim())) return flash("error", "此地址已被凍結");
    update((s) => ({ ...s, frozen: [...s.frozen, freezeAddress.trim()] }));
    addEvent("freeze", "Admin", `凍結帳戶：${freezeAddress.trim()}`);
    completeTask("freeze");
    setFreezeAddress("");
    flash("success", `${freezeAddress.trim()} 已凍結`);
  }

  function handlePause() {
    const next = !state.paused;
    update((s) => ({ ...s, paused: next }));
    addEvent(next ? "pause" : "unpause", "Admin", next ? "合約已暫停（緊急機制啟動）" : "合約已恢復運作");
    completeTask("freeze");
    flash("success", next ? "合約已緊急暫停" : "合約已恢復運作");
  }

  function handleBurn() {
    if (!burnAddress.trim() || !burnGrams) return flash("error", "請填寫地址與數量");
    if (state.paused) return flash("error", "合約已暫停，無法操作");
    const g = parseFloat(burnGrams);
    if (isNaN(g) || g <= 0) return flash("error", "數量必須為正數");
    if (g > state.supply) return flash("error", `Burn 數量超過流通量 (${state.supply}g)`);
    update((s) => ({ ...s, supply: s.supply - g }));
    addEvent("burn", "Issuer", `Burn ${g} GGT（贖回申請）← ${burnAddress.trim()}`);
    completeTask("burn");
    setBurnAddress(""); setBurnGrams("");
    flash("success", `成功 Burn ${g} GGT，已交付黃金贖回給 ${burnAddress.trim()}`);
  }

  const completed = state.completedTasks.length;
  const total = TASKS.length;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h2 className="text-gray-800 mb-1">管理台 — 教師操作介面</h2>
        <p className="text-gray-500">模擬 Issuer / Auditor / Admin 的鏈上操作，所有變更即時更新學生儀表板</p>
      </div>

      {/* Task Progress */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-gray-700" style={{ fontWeight: 600 }}>任務進度</div>
          <div className="text-sm text-amber-600">{completed} / {total} 完成</div>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TASKS.map((t) => (
            <span
              key={t.id}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                state.completedTasks.includes(t.id)
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-gray-50 border-gray-200 text-gray-500"
              }`}
            >
              {state.completedTasks.includes(t.id) ? "✓ " : ""}{t.icon} {t.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Operation Tabs */}
        <aside className="md:w-52 flex-shrink-0">
          <nav className="flex md:flex-col gap-2">
            {TASKS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setActiveOp(t.id); setMsg(null); }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-left transition-all w-full ${
                  activeOp === t.id
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300"
                }`}
              >
                <span>{t.icon}</span>
                <span className="text-sm truncate" style={{ fontWeight: 500 }}>{t.label}</span>
                {state.completedTasks.includes(t.id) && (
                  <span className={`ml-auto text-xs ${activeOp === t.id ? "text-amber-200" : "text-green-500"}`}>✓</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Operation Panel */}
        <main className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          {activeOp === "proof" && (
            <div>
              <h3 className="text-gray-800 mb-1">更新 Proof-of-Reserve</h3>
              <p className="text-gray-500 text-sm mb-5">稽核員（Auditor）上傳新的儲備證明哈希值與黃金重量。</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">黃金儲備量（公克）</label>
                  <input
                    type="number"
                    value={reserveGrams}
                    onChange={(e) => setReserveGrams(e.target.value)}
                    placeholder="例如：1500"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Proof Hash（SHA-256）</label>
                  <input
                    type="text"
                    value={proofHash}
                    onChange={(e) => setProofHash(e.target.value)}
                    placeholder="0x..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-400 bg-gray-50"
                  />
                </div>
                <button onClick={handleProof} className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg text-sm transition-colors" style={{ fontWeight: 600 }}>
                  提交 Proof-of-Reserve
                </button>
              </div>
              {msg && <Alert type={msg.type} msg={msg.text} />}
            </div>
          )}

          {activeOp === "whitelist" && (
            <div>
              <h3 className="text-gray-800 mb-1">加入白名單</h3>
              <p className="text-gray-500 text-sm mb-5">通過 KYC/AML 審核後，將投資人地址加入白名單，才能持有 GGT。</p>
              <div className="mb-4 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                <div className="text-sm text-purple-700 mb-2" style={{ fontWeight: 600 }}>目前白名單（{state.whitelist.length} 位）</div>
                {state.whitelist.length === 0 ? (
                  <p className="text-sm text-gray-400">尚無白名單</p>
                ) : (
                  state.whitelist.map((a) => (
                    <div key={a} className="font-mono text-xs text-gray-600 py-1">{a}</div>
                  ))
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">錢包地址</label>
                  <input
                    type="text"
                    value={wlAddress}
                    onChange={(e) => setWlAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-400 bg-gray-50"
                  />
                </div>
                <button onClick={handleWhitelist} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg text-sm transition-colors" style={{ fontWeight: 600 }}>
                  加入白名單
                </button>
              </div>
              {msg && <Alert type={msg.type} msg={msg.text} />}
            </div>
          )}

          {activeOp === "mint" && (
            <div>
              <h3 className="text-gray-800 mb-1">Mint GGT</h3>
              <p className="text-gray-500 text-sm mb-2">發行商（Issuer）依據儲備量鑄造新的 GGT 代幣，僅限白名單地址。</p>
              <div className="flex gap-4 mb-5">
                <div className="bg-amber-50 rounded-lg p-3 text-center flex-1">
                  <div className="text-xs text-gray-500">目前 GGT</div>
                  <div className="text-lg text-amber-700" style={{ fontWeight: 600 }}>{state.supply}g</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center flex-1">
                  <div className="text-xs text-gray-500">可 Mint 上限</div>
                  <div className="text-lg text-green-700" style={{ fontWeight: 600 }}>{Math.max(0, state.reserve - state.supply)}g</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">目標地址（需在白名單中）</label>
                  <input
                    type="text"
                    value={mintAddress}
                    onChange={(e) => setMintAddress(e.target.value)}
                    placeholder="0xAlice...demo"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-400 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Mint 數量（公克）</label>
                  <input
                    type="number"
                    value={mintGrams}
                    onChange={(e) => setMintGrams(e.target.value)}
                    placeholder="例如：100"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 bg-gray-50"
                  />
                </div>
                <button onClick={handleMint} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm transition-colors" style={{ fontWeight: 600 }}>
                  執行 Mint
                </button>
              </div>
              {msg && <Alert type={msg.type} msg={msg.text} />}
            </div>
          )}

          {activeOp === "freeze" && (
            <div>
              <h3 className="text-gray-800 mb-1">凍結帳戶 / 緊急暫停</h3>
              <p className="text-gray-500 text-sm mb-5">管理員（Admin）可凍結可疑地址或暫停整個合約。</p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">凍結帳戶地址</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={freezeAddress}
                      onChange={(e) => setFreezeAddress(e.target.value)}
                      placeholder="0x..."
                      className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-400 bg-gray-50"
                    />
                    <button onClick={handleFreeze} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm transition-colors" style={{ fontWeight: 600 }}>
                      凍結
                    </button>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-xl">
                  <div>
                    <div className="text-sm text-orange-800" style={{ fontWeight: 600 }}>緊急暫停合約</div>
                    <div className="text-xs text-orange-600 mt-0.5">
                      {state.paused ? "合約目前已暫停，點擊恢復運作" : "暫停後所有代幣轉移都將被阻止"}
                    </div>
                  </div>
                  <button
                    onClick={handlePause}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      state.paused
                        ? "bg-teal-600 hover:bg-teal-700 text-white"
                        : "bg-orange-600 hover:bg-orange-700 text-white"
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    {state.paused ? "▶ 恢復運作" : "⏸ 緊急暫停"}
                  </button>
                </div>
              </div>
              {msg && <Alert type={msg.type} msg={msg.text} />}
            </div>
          )}

          {activeOp === "burn" && (
            <div>
              <h3 className="text-gray-800 mb-1">Burn for Redemption</h3>
              <p className="text-gray-500 text-sm mb-5">投資人申請贖回時，Issuer 銷毀對應的 GGT，保管機構交付實體黃金。</p>
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-5 text-sm text-red-700">
                ⚠️ Burn 為不可逆操作。確認已收到贖回申請與身份驗證後再執行。
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">申請人地址</label>
                  <input
                    type="text"
                    value={burnAddress}
                    onChange={(e) => setBurnAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-red-400 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Burn 數量（公克 GGT）</label>
                  <input
                    type="number"
                    value={burnGrams}
                    onChange={(e) => setBurnGrams(e.target.value)}
                    placeholder="例如：50"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 bg-gray-50"
                  />
                </div>
                <button onClick={handleBurn} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm transition-colors" style={{ fontWeight: 600 }}>
                  🔥 執行 Burn（贖回）
                </button>
              </div>
              {msg && <Alert type={msg.type} msg={msg.text} />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
