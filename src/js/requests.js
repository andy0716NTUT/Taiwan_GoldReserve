(function () {
  const STORAGE_KEY = "tgga.requests.v1";

  function loadRequests() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (error) {
      console.warn("Unable to load requests", error);
      return [];
    }
  }

  function saveRequests(requests) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    window.dispatchEvent(new CustomEvent("tgga-request-change", { detail: requests }));
    return requests;
  }

  async function createRequest(input) {
    const core = window.GoldReserveCore;
    const i18n = window.GoldReserveI18n;
    if (!core.isAddress(input.wallet)) throw new Error(i18n ? i18n.t("error.walletAddress") : "Invalid wallet address.");
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error(i18n ? i18n.t("error.positiveAmount") : "Amount must be greater than zero.");

    const requests = loadRequests();
    const statusKey = input.type === "subscription" ? "request.status.subscription" : "request.status.redemption";
    const payload = {
      type: input.type,
      wallet: core.normalizeAddress(input.wallet),
      amount,
      createdAt: new Date().toISOString(),
      statusKey
    };
    const requestHash = await core.createProofHash(payload);
    requests.unshift({ id: requestHash.slice(0, 14), requestHash, ...payload });
    return saveRequests(requests);
  }

  window.GoldReserveRequests = {
    loadRequests,
    saveRequests,
    createRequest
  };
})();
