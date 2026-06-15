import React, { useState } from "react";

interface Question {
  id: number;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    q: "GGT 代幣的 1:1 映射是指什麼？",
    options: [
      "1 GGT = 1 美元",
      "1 GGT = 1 公克黃金",
      "1 GGT = 1 盎司黃金",
      "1 GGT = 1 台幣",
    ],
    answer: 1,
    explanation: "GoldGram Token（GGT）採用嚴格的 1:1 設計，每一枚 GGT 對應鏈下保管的 1 公克實體黃金，確保代幣有實物支撐。",
  },
  {
    id: 2,
    q: "Proof-of-Reserve 的主要目的是什麼？",
    options: [
      "加快交易速度",
      "降低 Gas 費用",
      "連接鏈下保管文件與鏈上記錄以供驗證",
      "讓合約自動賺取利息",
    ],
    answer: 2,
    explanation: "Proof-of-Reserve 透過 SHA-256 哈希值將實體黃金保管文件的摘要寫入鏈上，任何人都可以比對哈希值來確認文件的真實性與完整性。",
  },
  {
    id: 3,
    q: "當儲備覆蓋率（RCR）低於 100% 時，代表什麼問題？",
    options: [
      "系統運作正常",
      "黃金儲備不足以支撐所有流通 GGT",
      "白名單人數太多",
      "合約需要升級",
    ],
    answer: 1,
    explanation: "RCR = 儲備黃金(g) ÷ 流通 GGT(g)。當 RCR < 100% 時，代表鏈上流通的 GGT 超過了實際黃金儲備，是超發風險的警示信號。",
  },
  {
    id: 4,
    q: "在 GGT 系統中，Auditor（稽核員）可以執行哪些操作？",
    options: [
      "Mint 新代幣、管理白名單",
      "凍結帳戶、暫停合約",
      "上傳 Proof Hash、更新黃金儲備記錄",
      "以上皆可",
    ],
    answer: 2,
    explanation: "Auditor 負責上傳 Proof Hash 與更新黃金儲備量記錄，這是三權分立設計的一部分。Mint/Burn 屬於 Issuer 的職責，凍結/暫停屬於 Admin。",
  },
  {
    id: 5,
    q: "Whitelist（白名單）機制的主要作用是？",
    options: [
      "加快代幣轉移速度",
      "確保只有通過 KYC/AML 的地址能持有 GGT",
      "讓代幣自動升值",
      "減少智能合約的 Gas 費",
    ],
    answer: 1,
    explanation: "白名單確保只有完成 KYC（身份驗證）和 AML（反洗錢）審核的地址才能持有 GGT，防止非法資金流入，是 RWA 合規設計的重要環節。",
  },
  {
    id: 6,
    q: "當 Admin 啟動 Pause（緊急暫停）後，系統會發生什麼？",
    options: [
      "所有代幣被銷毀",
      "所有帳戶被凍結",
      "所有代幣轉移被暫時阻止",
      "合約永久關閉",
    ],
    answer: 2,
    explanation: "Pause 是一種緊急保護機制，啟動後合約暫時停止所有代幣轉移，但不銷毀代幣也不凍結帳戶。待風險排除後可以恢復（Unpause）。",
  },
  {
    id: 7,
    q: "Burn for Redemption 的流程是？",
    options: [
      "投資人銷毀 GGT → 保管機構交付實體黃金",
      "保管機構銷毀黃金 → 系統自動轉帳",
      "Issuer 銷毀所有 GGT → 合約終止",
      "用戶凍結帳戶 → 申請退款",
    ],
    answer: 0,
    explanation: "贖回流程：投資人提交申請 → Issuer 驗證資格 → 執行 Burn 銷毀對應 GGT → 保管機構完成鏈下實體黃金的交割。",
  },
];

export function QuizPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent] = useState(0);

  const q = QUESTIONS[current];
  const selectedAnswer = answers[q.id];
  const score = submitted ? QUESTIONS.filter((q) => answers[q.id] === q.answer).length : 0;
  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined);

  function select(idx: number) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [q.id]: idx }));
  }

  function restart() {
    setAnswers({});
    setSubmitted(false);
    setCurrent(0);
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-6">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">{score >= 6 ? "🏆" : score >= 4 ? "👍" : "📚"}</div>
          <h2 className="text-gray-800 mb-2">測驗結果</h2>
          <div className="text-4xl text-amber-600 mb-2" style={{ fontWeight: 700 }}>{score} / {QUESTIONS.length}</div>
          <p className="text-gray-500">
            {score === QUESTIONS.length ? "完美！你已完全掌握 GGT 核心概念！" :
             score >= 5 ? "優秀！繼續加油，已接近完全掌握！" :
             score >= 3 ? "不錯！建議回顧學習中心的相關章節。" :
             "繼續努力！建議重新閱讀學習中心的所有模組。"}
          </p>
        </div>
        <div className="space-y-4 mb-8">
          {QUESTIONS.map((q) => {
            const userAnswer = answers[q.id];
            const correct = userAnswer === q.answer;
            return (
              <div key={q.id} className={`rounded-2xl border p-5 ${correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <div className="flex gap-2 mb-3">
                  <span>{correct ? "✅" : "❌"}</span>
                  <span className="text-sm text-gray-700" style={{ fontWeight: 500 }}>{q.q}</span>
                </div>
                {!correct && (
                  <div className="text-sm text-gray-600 mb-2">
                    你的答案：<span className="text-red-600">{q.options[userAnswer]}</span>
                  </div>
                )}
                <div className="text-sm text-gray-600 mb-2">
                  正確答案：<span className="text-green-700" style={{ fontWeight: 600 }}>{q.options[q.answer]}</span>
                </div>
                <div className="text-xs text-gray-500 bg-white/60 rounded-lg p-3 border border-white">
                  💡 {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center">
          <button onClick={restart} className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg transition-colors" style={{ fontWeight: 600 }}>
            重新挑戰
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h2 className="text-gray-800 mb-1">小測驗</h2>
        <p className="text-gray-500">7 道題目，測試你對黃金 RWA 的理解程度</p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>題目 {current + 1} / {QUESTIONS.length}</span>
          <span>{Object.keys(answers).length} 道已作答</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all"
            style={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
        {/* Quick Nav */}
        <div className="flex gap-1.5 mt-3">
          {QUESTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-8 h-8 rounded-lg text-xs transition-colors ${
                i === current
                  ? "bg-amber-600 text-white"
                  : answers[QUESTIONS[i].id] !== undefined
                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
        <div className="text-xs text-amber-600 mb-3" style={{ fontWeight: 600 }}>Q{current + 1}</div>
        <h3 className="text-gray-800 mb-5">{q.q}</h3>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => select(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                selectedAnswer === i
                  ? "border-amber-500 bg-amber-50 text-amber-800"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:border-amber-300 hover:bg-amber-50/50"
              }`}
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border mr-3 text-xs flex-shrink-0"
                style={{
                  borderColor: selectedAnswer === i ? "#d97706" : "#d1d5db",
                  color: selectedAnswer === i ? "#d97706" : "#6b7280",
                  background: selectedAnswer === i ? "#fef3c7" : "white",
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          ← 上一題
        </button>

        {current < QUESTIONS.length - 1 ? (
          <button
            onClick={() => setCurrent(current + 1)}
            className="text-sm text-amber-600 hover:text-amber-800 px-4 py-2 rounded-lg border border-amber-300 hover:border-amber-500 transition-colors"
            style={{ fontWeight: 600 }}
          >
            下一題 →
          </button>
        ) : (
          <button
            onClick={() => setSubmitted(true)}
            disabled={!allAnswered}
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm transition-colors"
            style={{ fontWeight: 600 }}
          >
            {allAnswered ? "提交測驗 ✓" : `還有 ${QUESTIONS.length - Object.keys(answers).length} 題未作答`}
          </button>
        )}
      </div>
    </div>
  );
}
