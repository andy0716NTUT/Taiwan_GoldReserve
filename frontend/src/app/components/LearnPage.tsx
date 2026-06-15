import React, { useState } from "react";

const modules = [
  {
    id: "rwa",
    icon: "🌍",
    title: "什麼是 RWA？",
    badge: "基礎",
    sections: [
      {
        heading: "Real World Asset 代幣化",
        content: `RWA（Real World Asset）是指將現實世界的有形或無形資產透過區塊鏈技術進行數位化、代幣化的過程。

傳統金融資產（黃金、不動產、債券）的轉移需要複雜的中介機構、繁瑣的文件審核，且流動性受限。RWA 代幣化能夠：

• 提升資產流動性 — 可 24/7 在全球交易
• 降低進入門檻 — 分割持有，小額投資
• 增加透明度 — 鏈上可追溯的所有權紀錄
• 減少中介成本 — 智能合約自動執行`,
      },
      {
        heading: "黃金 RWA 的運作流程",
        content: `1. 保管機構 持有實體黃金並出具保管證明
2. 稽核員 (Auditor) 驗證實體儲備，上傳 Proof Hash 至鏈上
3. 發行商 (Issuer) 依據儲備量 Mint 對應的 GGT 代幣
4. 投資人 進行 KYC/AML 後加入白名單，取得 GGT
5. 贖回時，投資人 Burn GGT，保管機構交付黃金`,
      },
    ],
  },
  {
    id: "ggt",
    icon: "🪙",
    title: "GGT 代幣設計",
    badge: "進階",
    sections: [
      {
        heading: "1 GGT = 1 公克黃金",
        content: `GoldGram Token（GGT）採用嚴格的 1:1 實物支撐設計：

每一枚流通中的 GGT 都必須對應鏈下保管庫中的 1 公克實體黃金。這個設計確保代幣不會憑空增發，維持系統的可信度。

儲備覆蓋率（Reserve Coverage Ratio）是核心健康指標：
• RCR = 儲備黃金(g) ÷ 流通 GGT(g) × 100%
• RCR ≥ 100% → 系統健康，完全支撐
• RCR < 100% → 警告，存在超發風險`,
      },
      {
        heading: "ERC-20 合約架構",
        content: `GGT 基於 ERC-20 標準擴充，加入以下特性：

• AccessControl — 多角色權限（Owner / Issuer / Auditor）
• Pausable — 緊急暫停所有代幣轉移
• Whitelist — 僅允許 KYC 通過的地址持有
• Freeze — 凍結特定可疑地址
• Mint/Burn — 受控的增發與銷毀機制`,
      },
    ],
  },
  {
    id: "por",
    icon: "🔐",
    title: "Proof-of-Reserve",
    badge: "核心",
    sections: [
      {
        heading: "鏈下文件 ↔ 鏈上紀錄",
        content: `Proof-of-Reserve（PoR）機制解決了「代幣背後真的有黃金嗎？」的信任問題。

運作原理：
1. 保管機構出具含日期戳記的黃金重量報告
2. 稽核員計算報告文件的 SHA-256 雜湊值
3. 將雜湊值寫入智能合約（鏈上不可篡改）
4. 任何人皆可比對：本地雜湊 vs 鏈上雜湊

只要雜湊值吻合，即可確認：
✓ 文件內容未被竄改
✓ 稽核員確實看過真實文件
✓ 儲備量在稽核當下是真實的`,
      },
      {
        heading: "PoR 的局限性",
        content: `學習 PoR 同時也要了解它的限制：

• 時間點快照 — 僅能證明稽核當下的狀態，非即時
• 依賴稽核員誠信 — 稽核員必須是可信的第三方
• 無法防止「同一黃金用於多個 PoR」的欺詐
• 實體資產仍需實體保管，智能合約無法驗證實體

這就是為什麼需要定期稽核、多方見證與保險機制。`,
      },
    ],
  },
  {
    id: "roles",
    icon: "🛡️",
    title: "角色與權限",
    badge: "安全",
    sections: [
      {
        heading: "三權分立設計",
        content: `GGT 系統採用最小權限原則，將不同職責分配給不同角色：

👑 Owner（合約擁有者）
• 授予/撤銷其他角色
• 緊急凍結、暫停合約
• 升級合約邏輯（Proxy 架構）

💎 Issuer（發行商）
• Mint 新 GGT（不得超出儲備量）
• Burn GGT 執行贖回
• 管理白名單

🔍 Auditor（稽核員）
• 上傳 Proof Hash
• 更新黃金儲備數量記錄
• 不可 Mint 或操作白名單`,
      },
      {
        heading: "Whitelist / Freeze / Pause",
        content: `三層安全機制形成縱深防禦：

📋 Whitelist（白名單）
只有通過 KYC/AML 審核的地址才能持有 GGT，防止洗錢。

🔒 Freeze（凍結）
當特定地址出現可疑活動，可凍結該地址的轉帳功能，但不影響其他用戶。

⏸ Pause（暫停）
系統性風險或合約漏洞時，可緊急暫停所有代幣轉移，保護所有用戶資產。`,
      },
    ],
  },
];

export function LearnPage() {
  const [activeModule, setActiveModule] = useState("rwa");
  const current = modules.find((m) => m.id === activeModule);
  const idx = modules.findIndex((m) => m.id === activeModule);

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h2 className="text-gray-800 mb-1">學習中心</h2>
        <p className="text-gray-500">深入了解黃金 RWA 的核心知識，每個模組約需 5 分鐘閱讀</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-56 flex-shrink-0">
          <nav className="flex md:flex-col gap-2">
            {modules.map((m) => (
              <button key={m.id} onClick={() => setActiveModule(m.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all w-full ${
                  activeModule === m.id
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-700"
                }`}>
                <span className="text-xl">{m.icon}</span>
                <div className="min-w-0">
                  <div className="text-sm truncate" style={{ fontWeight: 600 }}>{m.title}</div>
                  <div className={`text-xs mt-0.5 ${activeModule === m.id ? "text-amber-200" : "text-gray-400"}`}>{m.badge}</div>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-center gap-3">
              <span className="text-2xl">{current.icon}</span>
              <div>
                <h3 className="text-gray-800">{current.title}</h3>
                <span className="inline-block bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full mt-0.5">{current.badge}</span>
              </div>
            </div>
            <div className="p-6 space-y-8">
              {current.sections.map((sec) => (
                <div key={sec.heading}>
                  <h4 className="text-gray-700 mb-3 pb-2 border-b border-gray-100">{sec.heading}</h4>
                  <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{sec.content}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-4">
            {modules[idx - 1] ? (
              <button onClick={() => setActiveModule(modules[idx - 1].id)} className="text-sm text-amber-600 hover:text-amber-800">
                ← {modules[idx - 1].title}
              </button>
            ) : <div />}
            {modules[idx + 1] ? (
              <button onClick={() => setActiveModule(modules[idx + 1].id)} className="text-sm text-amber-600 hover:text-amber-800">
                {modules[idx + 1].title} →
              </button>
            ) : <div />}
          </div>
        </main>
      </div>
    </div>
  );
}
