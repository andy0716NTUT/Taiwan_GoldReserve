import React, { useState } from "react";
import { useGoldState } from "./components/useGoldState";
import { HomePage } from "./components/HomePage";
import { LearnPage } from "./components/LearnPage";
import { DashboardPage } from "./components/DashboardPage";
import { AdminPage } from "./components/AdminPage";
import { QuizPage } from "./components/QuizPage";

const TABS = [
  { id: "home", label: "首頁", icon: "🏠" },
  { id: "learn", label: "學習中心", icon: "📖" },
  { id: "dashboard", label: "學生儀表板", icon: "📊" },
  { id: "admin", label: "管理台", icon: "⚙️" },
  { id: "quiz", label: "小測驗", icon: "✏️" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const { state, update, addEvent, completeTask, resetState } = useGoldState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* MARKER-MAKE-KIT-INVOKED */}
      {/* MARKER-MAKE-KIT-DISCOVERY-READ */}
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => setActiveTab("home")}
              className="flex items-center gap-2.5 flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white text-sm" style={{ fontWeight: 700 }}>
                G
              </div>
              <span className="text-gray-800 hidden sm:block" style={{ fontWeight: 600 }}>
                GoldReserve Academy
              </span>
            </button>

            {/* Desktop Nav Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${
                    activeTab === tab.id
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                  style={{ fontWeight: activeTab === tab.id ? 600 : 400 }}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Status + Reset */}
            <div className="flex items-center gap-2">
              {state.paused && (
                <span className="hidden sm:block text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-1 rounded-full">
                  ⏸ 已暫停
                </span>
              )}
              <button
                onClick={() => {
                  if (confirm("確定要重置所有示範資料嗎？")) resetState();
                }}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded border border-gray-200 hover:border-gray-300 transition-colors"
              >
                重置
              </button>
              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg mb-1 transition-all ${
                    activeTab === tab.id
                      ? "bg-amber-50 text-amber-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  style={{ fontWeight: activeTab === tab.id ? 600 : 400 }}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        {activeTab === "home" && <HomePage state={state} onNavigate={setActiveTab} />}
        {activeTab === "learn" && <LearnPage />}
        {activeTab === "dashboard" && <DashboardPage state={state} onNavigate={setActiveTab} />}
        {activeTab === "admin" && (
          <AdminPage
            state={state}
            update={update}
            addEvent={addEvent}
            completeTask={completeTask}
          />
        )}
        {activeTab === "quiz" && <QuizPage />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-4 px-6 text-center text-xs text-gray-400">
        Taiwan GoldReserve Academy — 教學展示 PoC，不構成投資建議 · 資料儲存於 localStorage
      </footer>
    </div>
  );
}
