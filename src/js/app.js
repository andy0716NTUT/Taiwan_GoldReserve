(function () {
  const core = window.GoldReserveCore;
  const requests = window.GoldReserveRequests;
  const i18n = window.GoldReserveI18n;
  const TAB_STORAGE_KEY = "tgga.student.activeTab";

  const missions = [
    ["checkedReserve", "mission.checkedReserve"],
    ["whitelist", "mission.whitelist"],
    ["proofUpdated", "mission.proofUpdated"],
    ["minted", "mission.minted"],
    ["emergencyControl", "mission.emergencyControl"],
    ["redemption", "mission.redemption"]
  ];

  const journey = [
    ["journey.investor", "journey.wallet"],
    ["journey.compliance", "journey.kyc"],
    ["journey.auditor", "journey.proof"],
    ["journey.issuer", "journey.mint"],
    ["journey.investor", "journey.portfolio"],
    ["journey.investor", "journey.requestRedemption"],
    ["journey.issuer", "journey.burn"],
    ["journey.custodian", "journey.settle"]
  ];

  const quiz = [
    { id: "proof", question: "quiz.proof.q", options: ["quiz.proof.a1", "quiz.proof.a2", "quiz.proof.a3"], answer: 0 },
    { id: "reserve", question: "quiz.reserve.q", options: ["quiz.reserve.a1", "quiz.reserve.a2", "quiz.reserve.a3"], answer: 0 },
    { id: "whitelist", question: "quiz.whitelist.q", options: ["quiz.whitelist.a1", "quiz.whitelist.a2", "quiz.whitelist.a3"], answer: 0 },
    { id: "offchain", question: "quiz.offchain.q", options: ["quiz.offchain.a1", "quiz.offchain.a2", "quiz.offchain.a3"], answer: 0 },
    { id: "burn", question: "quiz.burn.q", options: ["quiz.burn.a1", "quiz.burn.a2", "quiz.burn.a3"], answer: 0 }
  ];

  function text(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function statusText(state) {
    return core.coverageRatio(state) >= 100 ? i18n.t("status.fullyBacked") : i18n.t("status.reserveWarning");
  }

  function requestStatus(request) {
    if (request.statusKey) return i18n.t(request.statusKey);
    const legacy = {
      "Pending KYC / issuer review": "request.status.subscription",
      "Pending offchain settlement": "request.status.redemption"
    };
    return i18n.t(legacy[request.status] || request.status);
  }

  function renderMetrics(state) {
    const ratio = core.coverageRatio(state);
    text("reserveGrams", core.formatNumber(state.reserveGrams));
    text("totalSupply", core.formatNumber(state.totalSupply));
    text("coverageRatio", core.formatPercent(ratio));
    text("coverageStatus", statusText(state));
    text("proofVersion", `v${state.proofVersion}`);
    text("latestAuditDate", state.latestAuditDate);
    text("latestProofHash", state.latestProofHash);

    const reserveBadge = document.getElementById("reserveBadge");
    if (reserveBadge) {
      reserveBadge.textContent = statusText(state);
      reserveBadge.classList.toggle("warning", ratio < 100);
    }

    const max = Math.max(state.reserveGrams, state.totalSupply, 1);
    document.getElementById("reserveBar").style.width = `${Math.min((state.reserveGrams / max) * 100, 100)}%`;
    document.getElementById("supplyBar").style.width = `${Math.min((state.totalSupply / max) * 100, 100)}%`;
  }

  function renderMissions(state) {
    const list = document.getElementById("missionList");
    const doneCount = missions.filter(([key]) => state.missions[key]).length;
    text("missionScore", i18n.t("mission.score", { score: doneCount }));
    list.innerHTML = missions
      .map(([key, labelKey]) => {
        const done = Boolean(state.missions[key]);
        return `<li class="${done ? "done" : ""}"><i>${done ? "✓" : "·"}</i><span>${i18n.t(labelKey)}</span></li>`;
      })
      .join("");
  }

  function renderJourney() {
    document.getElementById("journey").innerHTML = journey
      .map(([roleKey, actionKey]) => `<div class="journey-step"><strong>${i18n.t(roleKey)}</strong><span>${i18n.t(actionKey)}</span></div>`)
      .join("");
  }

  function renderRisk(state) {
    const whitelistCount = Object.keys(state.whitelist).length;
    const frozenCount = Object.values(state.frozen).filter(Boolean).length;
    const values = [
      [i18n.t("risk.kyc"), i18n.t("risk.kycValue", { count: whitelistCount })],
      [i18n.t("risk.jurisdiction"), state.jurisdiction],
      [i18n.t("risk.transfer"), i18n.t("risk.transferValue")],
      [i18n.t("risk.frozen"), String(frozenCount)],
      [i18n.t("risk.paused"), state.paused ? i18n.t("state.yes") : i18n.t("state.no")],
      [i18n.t("risk.legal"), i18n.t("risk.legalValue")]
    ];
    document.getElementById("riskGrid").innerHTML = values
      .map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`)
      .join("");
  }

  function renderTimeline(state) {
    document.getElementById("auditTimeline").innerHTML = state.audits
      .map(
        (audit) => `
          <article class="timeline-item">
            <div>
              <strong>${i18n.t("timeline.version", { version: audit.version })}</strong>
              <p class="tagline">${audit.date}</p>
            </div>
            <div>
              <p>${i18n.t("timeline.detail", {
                reserve: core.formatNumber(audit.reserveGrams),
                supply: core.formatNumber(audit.totalSupply)
              })}</p>
              <code>${audit.proofHash}</code>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderRequests() {
    const list = document.getElementById("requestList");
    const items = requests.loadRequests();
    if (!items.length) {
      list.innerHTML = `<p class="hint">${i18n.t("request.empty")}</p>`;
      return;
    }
    list.innerHTML = items
      .slice(0, 5)
      .map(
        (request) => `
          <article class="request-card">
            <strong>${i18n.t(`request.${request.type}`)} · ${core.formatNumber(request.amount)} GGT</strong>
            <p class="tagline">${requestStatus(request)} · ${core.shortAddress(request.wallet)}</p>
            <code>${request.requestHash}</code>
          </article>
        `
      )
      .join("");
  }

  function renderQuiz(state) {
    const score = quiz.filter((item) => state.quizAnswers[item.id]?.correct).length;
    text("quizScore", i18n.t("quiz.score", { score }));
    document.getElementById("quiz").innerHTML = quiz
      .map((item) => {
        const saved = state.quizAnswers[item.id];
        const options = item.options
          .map((optionKey, index) => {
            let className = "";
            if (saved && saved.answerIndex === index) className = saved.correct ? "correct" : "wrong";
            if (saved && index === item.answer) className = "correct";
            return `<button type="button" class="${className}" data-question="${item.id}" data-answer="${index}">${i18n.t(optionKey)}</button>`;
          })
          .join("");
        return `<article class="quiz-card"><strong>${i18n.t(item.question)}</strong><div class="quiz-options">${options}</div></article>`;
      })
      .join("");
  }

  function setActiveTab(tabId) {
    const buttons = Array.from(document.querySelectorAll("[data-tab-target]"));
    const panels = Array.from(document.querySelectorAll("[data-tab-panel]"));
    const nextTab = buttons.some((button) => button.dataset.tabTarget === tabId) ? tabId : buttons[0]?.dataset.tabTarget;
    if (!nextTab) return;

    buttons.forEach((button) => {
      const selected = button.dataset.tabTarget === nextTab;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
      button.setAttribute("tabindex", selected ? "0" : "-1");
    });
    panels.forEach((panel) => {
      const selected = panel.dataset.tabPanel === nextTab;
      panel.classList.toggle("active", selected);
      panel.hidden = !selected;
    });
    localStorage.setItem(TAB_STORAGE_KEY, nextTab);
  }

  function bindTabs() {
    const buttons = Array.from(document.querySelectorAll("[data-tab-target]"));
    if (!buttons.length) return;

    buttons.forEach((button) => {
      button.addEventListener("click", () => setActiveTab(button.dataset.tabTarget));
    });
    setActiveTab(localStorage.getItem(TAB_STORAGE_KEY) || buttons[0].dataset.tabTarget);
  }

  function render() {
    const state = core.getState();
    i18n.apply();
    renderMetrics(state);
    renderMissions(state);
    renderJourney();
    renderRisk(state);
    renderTimeline(state);
    renderRequests();
    renderQuiz(state);
  }

  function bindEvents() {
    document.getElementById("connectWalletButton").addEventListener("click", async (event) => {
      try {
        const account = await core.connectWallet();
        event.currentTarget.textContent = i18n.t("hero.connected", { address: core.shortAddress(account) });
      } catch (error) {
        alert(error.message || i18n.t("error.walletConnect"));
      }
    });

    document.getElementById("requestForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      try {
        await requests.createRequest(Object.fromEntries(form.entries()));
        event.currentTarget.reset();
        renderRequests();
      } catch (error) {
        alert(error.message || i18n.t("error.actionFailed"));
      }
    });

    document.getElementById("quiz").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-question]");
      if (!button) return;
      const item = quiz.find((entry) => entry.id === button.dataset.question);
      const answerIndex = Number(button.dataset.answer);
      core.saveQuizAnswer(item.id, answerIndex, answerIndex === item.answer);
      render();
    });

    window.addEventListener("tgga-state-change", render);
    window.addEventListener("tgga-request-change", renderRequests);
    window.addEventListener("tgga-lang-change", render);
    window.addEventListener("storage", render);
  }

  bindTabs();
  bindEvents();
  render();
})();
