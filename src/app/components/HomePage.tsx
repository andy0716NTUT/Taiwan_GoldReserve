import React from "react";

const concepts = [
  { icon: "🌍", title: "RWA 代幣化", desc: "Real World Asset — 把現實世界的黃金資產映射到區塊鏈上的數位代幣，實現可驗證的所有權記錄。" },
  { icon: "⚖️", title: "1 GGT = 1 公克黃金", desc: "GoldGram Token（GGT）以 1:1 比例對應實體黃金。每枚代幣背後都有等量的黃金儲備作為支撐。" },
  { icon: "🔐", title: "Proof-of-Reserve", desc: "透過加密哈希值將鏈下保管文件與鏈上記錄連接，任何人都能驗證儲備是否真實存在。" },
  { icon: "🛡️", title: "角色權限設計", desc: "Issuer 負責 mint/burn，Auditor 負責上傳儲備證明，Admin 掌管 pause/freeze，三權分立確保安全。" },
];

const steps = [
  { step: "01", label: "了解概念", desc: "前往學習中心，掌握 RWA 基本知識", tab: "learn" },
  { step: "02", label: "查看儀表板", desc: "觀察儲備覆蓋率與審計時間軸", tab: "dashboard" },
  { step: "03", label: "操作管理台", desc: "以老師身份執行 mint、freeze 等操作", tab: "admin" },
  { step: "04", label: "挑戰小測驗", desc: "測試你對 RWA 的理解程度", tab: "quiz" },
];

export function HomePage({ state, onNavigate }) {
  const coverage = state.reserve > 0 ? (state.reserve / state.supply) * 100 : 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-yellow-700 text-white py-20 px-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-yellow-300" style={{ filter: "blur(60px)" }} />
          <div className="absolute bottom-10 right-20 w-60 h-60 rounded-full bg-amber-300" style={{ filter: "blur(80px)" }} />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-400/30 rounded-full px-4 py-1.5 mb-6">
            <span className="text-yellow-300 text-sm">教學展示 PoC — 非投資建議</span>
          </div>
          <h1 className="text-4xl md:text-5xl mb-4" style={{ color: "white", fontWeight: 700 }}>
            Taiwan GoldReserve Academy
          </h1>
          <p className="text-amber-100 text-lg md:text-xl mb-8 leading-relaxed">
            互動式黃金 RWA 教學沙盒<br />
            從零開始理解黃金代幣化、Proof-of-Reserve 與鏈上角色權限
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => onNavigate("learn")} className="bg-yellow-500 hover:bg-yellow-400 text-amber-900 px-6 py-3 rounded-lg transition-colors" style={{ fontWeight: 600 }}>
              開始學習 →
            </button>
            <button onClick={() => onNavigate("dashboard")} className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-lg transition-colors">
              查看儀表板
            </button>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="bg-amber-50 border-b border-amber-100 py-6 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "GGT 總發行量", value: `${state.supply.toLocaleString()} g`, sub: "流通中" },
            { label: "黃金儲備", value: `${state.reserve.toLocaleString()} g`, sub: "鏈下保管" },
            { label: "儲備覆蓋率", value: `${coverage.toFixed(1)}%`, sub: coverage >= 100 ? "✅ 充足" : "⚠️ 不足" },
            { label: "白名單人數", value: `${state.whitelist.length}`, sub: "已認證帳戶" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-white rounded-xl border border-amber-100 shadow-sm">
              <div className="text-2xl text-amber-700" style={{ fontWeight: 700 }}>{stat.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
              <div className="text-xs text-amber-600 mt-1">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Concepts */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center mb-2 text-gray-800">核心概念</h2>
          <p className="text-center text-gray-500 mb-10">四個關鍵知識點，幫助你建立 RWA 基礎認識</p>
          <div className="grid md:grid-cols-2 gap-6">
            {concepts.map((c) => (
              <div key={c.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="text-gray-800 mb-2">{c.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center mb-2 text-gray-800">學習路徑</h2>
          <p className="text-center text-gray-500 mb-10">建議按照以下步驟探索本教學平台</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((s) => (
              <button key={s.step} onClick={() => onNavigate(s.tab)} className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:border-amber-400 hover:shadow-md transition-all">
                <div className="text-3xl text-amber-500 mb-3" style={{ fontWeight: 700 }}>{s.step}</div>
                <div className="text-gray-800 mb-1" style={{ fontWeight: 600 }}>{s.label}</div>
                <div className="text-gray-500 text-sm">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 px-6 text-center text-gray-400 text-sm border-t border-gray-100">
        <p>本專案為教學展示，不構成投資建議，也不宣稱已符合正式金融商品、證券、商品或虛擬資產法規。</p>
        <p className="mt-1">所有數據儲存於瀏覽器 localStorage，僅供 Demo 使用。</p>
      </section>
    </div>
  );
}
