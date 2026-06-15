(function () {
  const STORAGE_KEY = "tgga.state.v1";
  const SEPOLIA_CHAIN_ID = "0xaa36a7";

  const sampleInvestor = "0x7d4A9bB9E8a7Db9a193c312d8f44dBaE9c1e60c4";
  const sampleInstructor = "0x91C2E9A69163A91c0dD6E6dFdB20d6Fa77c2C112";

  const defaultState = {
    reserveGrams: 125000,
    totalSupply: 102000,
    proofVersion: 3,
    latestProofHash: "0x8bd0c7af2eeab8ab55e1f0849a8f894d9c2a0ad32d5e148b63d70d1e4a7ac5e3",
    latestAuditDate: "2026-06-14",
    custodian: "Taiwan Secured Vault Co.",
    jurisdiction: "Taiwan",
    contractAddress: "Not deployed",
    paused: false,
    whitelist: {
      [sampleInvestor.toLowerCase()]: "kyc.taiwanPassed",
      [sampleInstructor.toLowerCase()]: "kyc.instructorWallet"
    },
    frozen: {},
    balances: {
      [sampleInvestor.toLowerCase()]: 2500
    },
    missions: {
      checkedReserve: true,
      whitelist: true,
      proofUpdated: true,
      minted: true,
      emergencyControl: false,
      redemption: false
    },
    audits: [
      {
        version: 3,
        date: "2026-06-14",
        auditor: sampleInstructor,
        reserveGrams: 125000,
        totalSupply: 102000,
        proofHash: "0x8bd0c7af2eeab8ab55e1f0849a8f894d9c2a0ad32d5e148b63d70d1e4a7ac5e3",
        txHash: "local-demo-proof-v3"
      },
      {
        version: 2,
        date: "2026-05-29",
        auditor: sampleInstructor,
        reserveGrams: 118000,
        totalSupply: 96500,
        proofHash: "0x5a0a4d026e70f1c81bdfc6138a99da89af0171ca5e230a49005655dcc2ed0ef1",
        txHash: "local-demo-proof-v2"
      },
      {
        version: 1,
        date: "2026-05-12",
        auditor: sampleInstructor,
        reserveGrams: 100000,
        totalSupply: 83000,
        proofHash: "0xf681771c07bdf4282f9d5b5da22810cf3470558f13b16527be50d42dddc55c4a",
        txHash: "local-demo-proof-v1"
      }
    ],
    events: [
      {
        type: "ProofUpdated",
        key: "event.proofPublished",
        params: { version: 3 },
        at: "2026-06-14T10:18:00.000Z"
      },
      {
        type: "Mint",
        key: "event.sampleMint",
        params: { amount: "2,500" },
        at: "2026-06-14T10:22:00.000Z"
      }
    ],
    quizAnswers: {}
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return clone(defaultState);
      return normalizeState({ ...clone(defaultState), ...JSON.parse(saved) });
    } catch (error) {
      console.warn("Unable to load saved demo state", error);
      return clone(defaultState);
    }
  }

  function normalizeState(state) {
    state.whitelist = Object.fromEntries(
      Object.entries(state.whitelist || {}).map(([address, label]) => [address, normalizeKycLabel(label)])
    );
    state.events = (state.events || []).map((event) => {
      if (event.key) return event;
      return { ...event, key: `event.${event.type}`, params: {} };
    });
    return state;
  }

  function normalizeKycLabel(label) {
    const map = {
      "Taiwan KYC passed": "kyc.taiwanPassed",
      "Student demo wallet": "kyc.studentWallet",
      "Instructor wallet": "kyc.instructorWallet"
    };
    return map[label] || label || "kyc.taiwanPassed";
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("tgga-state-change", { detail: state }));
    return state;
  }

  function resetState() {
    localStorage.removeItem(STORAGE_KEY);
    return saveState(clone(defaultState));
  }

  function normalizeAddress(address) {
    return String(address || "").trim().toLowerCase();
  }

  function isAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(String(address || "").trim());
  }

  function shortAddress(address) {
    const value = String(address || "");
    if (!value.startsWith("0x") || value.length < 12) return value || "--";
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-US");
  }

  function formatPercent(value) {
    if (!Number.isFinite(value)) return "0.00%";
    return `${value.toFixed(2)}%`;
  }

  function coverageRatio(state) {
    if (!state.totalSupply) return 100;
    return (state.reserveGrams / state.totalSupply) * 100;
  }

  function reserveStatus(state) {
    const ratio = coverageRatio(state);
    return ratio >= 100 ? "Fully Backed" : "Reserve Warning";
  }

  function t(key, params) {
    return window.GoldReserveI18n ? window.GoldReserveI18n.t(key, params) : key;
  }

  function error(key) {
    return new Error(t(key));
  }

  function addEvent(state, type, key, params = {}) {
    state.events.unshift({
      type,
      key,
      params,
      at: new Date().toISOString()
    });
  }

  function canonicalPayload(payload) {
    const sorted = Object.keys(payload)
      .sort()
      .reduce((acc, key) => {
        acc[key] = payload[key];
        return acc;
      }, {});
    return JSON.stringify(sorted);
  }

  async function sha256Hex(input) {
    const bytes = new TextEncoder().encode(input);
    const buffer = await crypto.subtle.digest("SHA-256", bytes);
    return `0x${Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")}`;
  }

  async function createProofHash(payload) {
    return sha256Hex(canonicalPayload(payload));
  }

  async function updateReserveProof(formData) {
    const state = getState();
    const reserveGrams = Number(formData.reserveGrams);
    if (!Number.isFinite(reserveGrams) || reserveGrams < 0) {
      throw error("error.reservePositive");
    }

    const payload = {
      auditDate: formData.auditDate,
      custodian: formData.custodian,
      jurisdiction: state.jurisdiction,
      reserveGrams,
      summary: formData.summary,
      totalSupply: state.totalSupply,
      version: state.proofVersion + 1
    };

    const proofHash = await createProofHash(payload);
    state.reserveGrams = reserveGrams;
    state.custodian = formData.custodian;
    state.latestAuditDate = formData.auditDate;
    state.proofVersion += 1;
    state.latestProofHash = proofHash;
    state.missions.proofUpdated = true;
    state.audits.unshift({
      version: state.proofVersion,
      date: formData.auditDate,
      auditor: sampleInstructor,
      reserveGrams,
      totalSupply: state.totalSupply,
      proofHash,
      txHash: `local-demo-proof-v${state.proofVersion}`
    });
    addEvent(state, "ProofUpdated", "event.proofUpdated", { reserve: formatNumber(reserveGrams) });
    return saveState(state);
  }

  function setWhitelist(address, label) {
    if (!isAddress(address)) throw error("error.walletAddress");
    const state = getState();
    const normalized = normalizeAddress(address);
    state.whitelist[normalized] = normalizeKycLabel(label);
    state.missions.whitelist = true;
    addEvent(state, "Whitelist", "event.whitelist", { address: shortAddress(address) });
    return saveState(state);
  }

  function toggleFrozen(address) {
    if (!isAddress(address)) throw error("error.walletAddress");
    const state = getState();
    const normalized = normalizeAddress(address);
    state.frozen[normalized] = !state.frozen[normalized];
    state.missions.emergencyControl = true;
    addEvent(state, "Frozen", "event.frozen", {
      address: shortAddress(address),
      frozen: t(state.frozen[normalized] ? "state.yes" : "state.no")
    });
    return saveState(state);
  }

  function togglePaused() {
    const state = getState();
    state.paused = !state.paused;
    state.missions.emergencyControl = true;
    addEvent(state, "Paused", "event.paused", { paused: t(state.paused ? "state.yes" : "state.no") });
    return saveState(state);
  }

  function mint(address, amountValue) {
    if (!isAddress(address)) throw error("error.walletAddress");
    const amount = Number(amountValue);
    if (!Number.isFinite(amount) || amount <= 0) throw error("error.positiveAmount");

    const state = getState();
    const normalized = normalizeAddress(address);
    if (state.paused) throw error("error.paused");
    if (!state.whitelist[normalized]) throw error("error.notWhitelisted");
    if (state.frozen[normalized]) throw error("error.frozen");
    if (state.totalSupply + amount > state.reserveGrams) {
      throw error("error.reserveExceeded");
    }

    state.totalSupply += amount;
    state.balances[normalized] = (state.balances[normalized] || 0) + amount;
    state.missions.minted = true;
    addEvent(state, "Mint", "event.mint", { amount: formatNumber(amount), address: shortAddress(address) });
    return saveState(state);
  }

  function burn(address, amountValue) {
    if (!isAddress(address)) throw error("error.walletAddress");
    const amount = Number(amountValue);
    if (!Number.isFinite(amount) || amount <= 0) throw error("error.positiveAmount");

    const state = getState();
    const normalized = normalizeAddress(address);
    const balance = state.balances[normalized] || 0;
    if (state.paused) throw error("error.paused");
    if (state.frozen[normalized]) throw error("error.frozen");
    if (balance < amount) throw error("error.insufficientBalance");

    state.totalSupply -= amount;
    state.balances[normalized] = balance - amount;
    state.missions.redemption = true;
    addEvent(state, "BurnForRedemption", "event.burn", { amount: formatNumber(amount) });
    return saveState(state);
  }

  function saveQuizAnswer(questionId, answerIndex, correct) {
    const state = getState();
    state.quizAnswers[questionId] = { answerIndex, correct };
    return saveState(state);
  }

  async function connectWallet() {
    if (!window.ethereum) {
      throw error("error.metamaskMissing");
    }

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }]
      });
    } catch (error) {
      if (error && error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: "Sepolia",
              nativeCurrency: { name: "Sepolia Ether", symbol: "SEP", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"]
            }
          ]
        });
      } else {
        throw error;
      }
    }

    return accounts[0];
  }

  window.GoldReserveCore = {
    sampleInvestor,
    sampleInstructor,
    getState,
    saveState,
    resetState,
    setWhitelist,
    toggleFrozen,
    togglePaused,
    mint,
    burn,
    updateReserveProof,
    saveQuizAnswer,
    connectWallet,
    normalizeAddress,
    isAddress,
    shortAddress,
    formatNumber,
    formatPercent,
    coverageRatio,
    reserveStatus,
    createProofHash,
    sha256Hex
  };
})();
