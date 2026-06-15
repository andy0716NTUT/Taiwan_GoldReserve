import React, { useState } from "react";
import { useGoldState } from "./components/useGoldState";
import { HomePage } from "./components/HomePage";
import { LearnPage } from "./components/LearnPage";
import { DashboardPage } from "./components/DashboardPage";
import { AdminPage } from "./components/AdminPage";
import { QuizPage } from "./components/QuizPage";
import { BackOfficePage } from "./components/BackOfficePage";

type Role = "student" | "teacher" | "admin";

const ROLE_CONFIG: Record<Role, { title: string; subtitle: string; code?: string }> = {
  student: {
    title: "學生",
    subtitle: "直接進入學生頁面，可學習、查看儀表板並送出申購 / 贖回申請。",
  },
  teacher: {
    title: "教師",
    subtitle: "進入教室頁面，操作 Proof、白名單、Mint、Freeze、Burn 的課堂示範。",
    code: "TEACHER2026",
  },
  admin: {
    title: "後台管理者",
    subtitle: "進入後台管理者頁面，審核與處理學生送出的申請。",
    code: "ADMIN2026",
  },
};

const ROLE_TABS: Record<Role, Array<{ id: string; label: string }>> = {
  student: [
    { id: "home", label: "學生首頁" },
    { id: "learn", label: "學習內容" },
    { id: "dashboard", label: "申請 / 儀表板" },
    { id: "quiz", label: "測驗" },
  ],
  teacher: [
    { id: "classroom", label: "教室操作台" },
    { id: "learn", label: "課程內容" },
    { id: "dashboard", label: "儀表板" },
  ],
  admin: [
    { id: "backoffice", label: "申請處理" },
    { id: "dashboard", label: "系統狀態" },
  ],
};

function shortAddress(address?: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function RoleGate({ onEnter }: { onEnter: (role: Role) => void }) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function chooseRole(role: Role) {
    setError("");
    setCode("");
    if (role === "student") {
      onEnter(role);
      return;
    }
    setSelectedRole(role);
  }

  function verify(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedRole) return;
    if (code.trim() === ROLE_CONFIG[selectedRole].code) {
      onEnter(selectedRole);
      return;
    }
    setError("驗證碼不正確。");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 items-center justify-center text-white mb-4" style={{ fontWeight: 800 }}>
            G
          </div>
          <h1 className="text-gray-900 mb-2">台灣黃金儲備系統</h1>
          <p className="text-gray-500">請先選擇你的身分。學生不需要驗證；教師與後台管理者需要驗證。</p>
        </div>

        <section className="grid md:grid-cols-3 gap-4 mb-8">
          {(Object.keys(ROLE_CONFIG) as Role[]).map((role) => (
            <button
              key={role}
              onClick={() => chooseRole(role)}
              className={`text-left bg-white border rounded-2xl p-6 shadow-sm transition-all ${
                selectedRole === role ? "border-amber-400 ring-2 ring-amber-100" : "border-gray-100 hover:border-amber-300"
              }`}
            >
              <div className="text-xs text-amber-700 mb-2" style={{ fontWeight: 700 }}>
                {role.toUpperCase()}
              </div>
              <h2 className="text-gray-900 mb-2">{ROLE_CONFIG[role].title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{ROLE_CONFIG[role].subtitle}</p>
            </button>
          ))}
        </section>

        {selectedRole && selectedRole !== "student" && (
          <form onSubmit={verify} className="max-w-md mx-auto bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-gray-900 mb-2">{ROLE_CONFIG[selectedRole].title}驗證</h2>
            <p className="text-sm text-gray-500 mb-4">請輸入驗證碼進入此角色頁面。</p>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              type="password"
              placeholder="輸入驗證碼"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 mb-3"
            />
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg text-sm" style={{ fontWeight: 700 }}>
              驗證並進入
            </button>
            <p className="text-xs text-gray-400 mt-3">Demo 驗證碼：教師 TEACHER2026，管理者 ADMIN2026。</p>
          </form>
        )}
      </div>
    </main>
  );
}

export default function App() {
  const [role, setRole] = useState<Role | null>(() => (localStorage.getItem("ggt_role") as Role | null) || null);
  const [activeTab, setActiveTab] = useState(() => {
    const savedRole = localStorage.getItem("ggt_role") as Role | null;
    return savedRole ? ROLE_TABS[savedRole]?.[0]?.id || "home" : "home";
  });
  const [walletError, setWalletError] = useState("");
  const { state, update, addEvent, completeTask, connectWallet, createRequest, updateRequestStatus, resetState } = useGoldState();

  if (!role) {
    return (
      <RoleGate
        onEnter={(nextRole) => {
          localStorage.setItem("ggt_role", nextRole);
          setRole(nextRole);
          setActiveTab(ROLE_TABS[nextRole][0].id);
        }}
      />
    );
  }

  const tabs = ROLE_TABS[role];

  async function handleConnectWallet() {
    setWalletError("");
    try {
      await connectWallet();
    } catch (error) {
      setWalletError(error instanceof Error ? error.message : "Unable to connect wallet.");
    }
  }

  function leaveRole() {
    localStorage.removeItem("ggt_role");
    setRole(null);
    setActiveTab("home");
  }

  function goToTab(tabId: string) {
    const nextTab = tabId === "admin" && role === "teacher" ? "classroom" : tabId;
    const allowed = tabs.some((tab) => tab.id === nextTab);
    setActiveTab(allowed ? nextTab : tabs[0].id);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between min-h-16 gap-3 py-3">
            <button onClick={() => goToTab(tabs[0].id)} className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white text-sm" style={{ fontWeight: 700 }}>
                G
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-gray-800" style={{ fontWeight: 700 }}>GoldReserve</span>
                <span className="block text-xs text-gray-400">{ROLE_CONFIG[role].title}</span>
              </div>
            </button>

            <nav className="flex items-center gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => goToTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm transition-all ${
                    activeTab === tab.id
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                  style={{ fontWeight: activeTab === tab.id ? 700 : 500 }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={handleConnectWallet}
                className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
              >
                {state.walletAddress ? shortAddress(state.walletAddress) : "MetaMask"}
              </button>
              <button
                onClick={() => {
                  if (confirm("重設本機 demo 狀態？")) resetState();
                }}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded border border-gray-200 hover:border-gray-300 transition-colors"
              >
                重設
              </button>
              <button onClick={leaveRole} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded border border-gray-200 hover:border-gray-300 transition-colors">
                換身分
              </button>
            </div>
          </div>
          {walletError && <div className="pb-3 text-xs text-red-600">{walletError}</div>}
        </div>
      </header>

      <main className="flex-1">
        {activeTab === "home" && <HomePage state={state} onNavigate={goToTab} />}
        {activeTab === "learn" && <LearnPage />}
        {activeTab === "dashboard" && <DashboardPage state={state} onNavigate={goToTab} createRequest={createRequest} />}
        {activeTab === "quiz" && <QuizPage />}
        {activeTab === "classroom" && (
          <AdminPage state={state} update={update} addEvent={addEvent} completeTask={completeTask} />
        )}
        {activeTab === "backoffice" && <BackOfficePage state={state} updateRequestStatus={updateRequestStatus} />}
      </main>

      <footer className="bg-white border-t border-gray-100 py-4 px-6 text-center text-xs text-gray-400">
        Taiwan GoldReserve demo uses browser localStorage. Sepolia contract: {state.contractAddress}
      </footer>
    </div>
  );
}
