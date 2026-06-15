(function () {
  const core = window.GoldReserveCore;
  const i18n = window.GoldReserveI18n;

  function text(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function fillDefaults(state) {
    const proofForm = document.getElementById("proofForm");
    proofForm.reserveGrams.value = state.reserveGrams;
    proofForm.custodian.value = state.custodian;
    proofForm.auditDate.value = new Date().toISOString().slice(0, 10);
    proofForm.summary.value = i18n.t("admin.proof.defaultSummary", { version: state.proofVersion + 1 });

    document.querySelectorAll("input[name='address']").forEach((input) => {
      if (!input.value) input.value = core.sampleInvestor;
    });
    const mintAmount = document.querySelector("#mintForm input[name='amount']");
    const burnAmount = document.querySelector("#burnForm input[name='amount']");
    if (!mintAmount.value) mintAmount.value = 100;
    if (!burnAmount.value) burnAmount.value = 50;
  }

  function renderMetrics(state) {
    text("reserveGrams", core.formatNumber(state.reserveGrams));
    text("totalSupply", core.formatNumber(state.totalSupply));
    text("coverageRatio", core.formatPercent(core.coverageRatio(state)));
    text("coverageStatus", core.coverageRatio(state) >= 100 ? i18n.t("status.fullyBacked") : i18n.t("status.reserveWarning"));
    text("pausedStatus", state.paused ? i18n.t("state.paused") : i18n.t("state.active"));
  }

  function renderAccounts(state) {
    const addresses = Array.from(
      new Set([...Object.keys(state.whitelist), ...Object.keys(state.balances), ...Object.keys(state.frozen)])
    );
    const list = document.getElementById("accountList");
    if (!addresses.length) {
      list.innerHTML = `<p class="hint">${i18n.t("admin.accounts.empty")}</p>`;
      return;
    }
    list.innerHTML = addresses
      .map((address) => {
        const whitelisted = state.whitelist[address] ? i18n.t(state.whitelist[address]) : i18n.t("state.notWhitelisted");
        const balance = state.balances[address] || 0;
        const frozen = state.frozen[address] ? i18n.t("state.frozen") : i18n.t("state.active");
        return `
          <article class="account-row">
            <div>
              <strong>${core.shortAddress(address)}</strong>
              <p class="tagline">${whitelisted} · ${frozen}</p>
              <code>${address}</code>
            </div>
            <strong>${core.formatNumber(balance)} GGT</strong>
          </article>
        `;
      })
      .join("");
  }

  function renderEvents(state) {
    const list = document.getElementById("eventLog");
    list.innerHTML = state.events
      .slice(0, 12)
      .map(
        (event) => `
          <article class="event-item">
            <strong>${event.type}</strong>
            <p>${i18n.t(event.key || `event.${event.type}`, event.params || {})}</p>
            <code>${new Date(event.at).toLocaleString()}</code>
          </article>
        `
      )
      .join("");
  }

  function render() {
    const state = core.getState();
    i18n.apply();
    renderMetrics(state);
    renderAccounts(state);
    renderEvents(state);
  }

  function bindForm(id, handler) {
    document.getElementById(id).addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await handler(Object.fromEntries(new FormData(event.currentTarget).entries()));
        render();
      } catch (error) {
        alert(error.message || i18n.t("error.actionFailed"));
      }
    });
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

    document.getElementById("resetButton").addEventListener("click", () => {
      if (!confirm(i18n.t("admin.resetConfirm"))) return;
      const state = core.resetState();
      fillDefaults(state);
      render();
    });

    bindForm("proofForm", core.updateReserveProof);
    bindForm("whitelistForm", (data) => core.setWhitelist(data.address, data.label));
    bindForm("mintForm", (data) => core.mint(data.address, data.amount));
    bindForm("freezeForm", (data) => core.toggleFrozen(data.address));
    bindForm("burnForm", (data) => core.burn(data.address, data.amount));

    document.getElementById("pauseButton").addEventListener("click", () => {
      core.togglePaused();
      render();
    });

    window.addEventListener("tgga-state-change", render);
    window.addEventListener("tgga-lang-change", () => {
      fillDefaults(core.getState());
      render();
    });
    window.addEventListener("storage", render);
  }

  const state = core.getState();
  fillDefaults(state);
  bindEvents();
  render();
})();
