import { useCallback, useState } from "react";

const STORAGE_KEY = "ggt_state_v1";
const LEGACY_STATE_KEY = "tgga.state.v1";
const LEGACY_REQUESTS_KEY = "tgga.requests.v1";
const SEPOLIA_CHAIN_ID = "0xaa36a7";
const CONTRACT_ADDRESS = "0x77Ae85B8A3b83F69f55FBF0c15ad44C63d2931D7";

export interface GoldEvent {
  id: string;
  time: string;
  type: string;
  actor: string;
  detail: string;
}

export interface GoldRequest {
  id: string;
  type: "subscription" | "redemption";
  wallet: string;
  amount: number;
  status: string;
  requestHash: string;
  createdAt: string;
}

export interface GoldState {
  supply: number;
  reserve: number;
  proofHash: string;
  proofUpdated: string;
  whitelist: string[];
  frozen: string[];
  paused: boolean;
  events: GoldEvent[];
  completedTasks: string[];
  walletAddress?: string;
  walletNetwork?: string;
  contractAddress: string;
  requests: GoldRequest[];
}

const DEFAULT_STATE: GoldState = {
  supply: 102000,
  reserve: 125000,
  proofHash: "0x8bd0c7af2eeab8ab55e1f0849a8f894d9c2a0ad32d5e148b63d70d1e4a7ac5e3",
  proofUpdated: "2026-06-14T10:18:00.000Z",
  whitelist: [
    "0x7d4A9bB9E8a7Db9a193c312d8f44dBaE9c1e60c4",
    "0x91C2E9A69163A91c0dD6E6dFdB20d6Fa77c2C112",
  ],
  frozen: [],
  paused: false,
  events: [
    {
      id: "proof-v3",
      time: "2026-06-14T10:18:00.000Z",
      type: "proof",
      actor: "Auditor",
      detail: "Auditor published reserve proof v3 for 125,000g Taiwan gold reserve.",
    },
    {
      id: "mint-sample",
      time: "2026-06-14T10:22:00.000Z",
      type: "mint",
      actor: "Issuer",
      detail: "Issuer minted 2,500 GGT to the sample investor wallet.",
    },
  ],
  completedTasks: ["proof", "whitelist", "mint"],
  contractAddress: CONTRACT_ADDRESS,
  requests: [],
};

function cloneState(state: GoldState): GoldState {
  return JSON.parse(JSON.stringify(state));
}

function normalizeAddress(address: string) {
  return String(address || "").trim();
}

function isAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(normalizeAddress(address));
}

function shortAddress(address: string) {
  const value = normalizeAddress(address);
  if (!value.startsWith("0x") || value.length < 12) return value || "--";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function normalizeState(input: Partial<GoldState>): GoldState {
  return {
    ...cloneState(DEFAULT_STATE),
    ...input,
    supply: Number(input.supply ?? DEFAULT_STATE.supply),
    reserve: Number(input.reserve ?? DEFAULT_STATE.reserve),
    whitelist: Array.from(new Set(input.whitelist || DEFAULT_STATE.whitelist)),
    frozen: Array.from(new Set(input.frozen || [])),
    events: input.events?.length ? input.events : DEFAULT_STATE.events,
    completedTasks: Array.from(new Set(input.completedTasks || [])),
    requests: input.requests || [],
  };
}

function migrateLegacyState(): Partial<GoldState> | null {
  try {
    const raw = localStorage.getItem(LEGACY_STATE_KEY);
    if (!raw) return null;

    const legacy = JSON.parse(raw);
    const legacyRequests = JSON.parse(localStorage.getItem(LEGACY_REQUESTS_KEY) || "[]");
    const whitelist = Object.keys(legacy.whitelist || {});
    const frozen = Object.entries(legacy.frozen || {})
      .filter(([, value]) => Boolean(value))
      .map(([address]) => address);

    return {
      supply: Number(legacy.totalSupply ?? DEFAULT_STATE.supply),
      reserve: Number(legacy.reserveGrams ?? DEFAULT_STATE.reserve),
      proofHash: legacy.latestProofHash || DEFAULT_STATE.proofHash,
      proofUpdated: legacy.latestAuditDate
        ? new Date(`${legacy.latestAuditDate}T00:00:00.000Z`).toISOString()
        : DEFAULT_STATE.proofUpdated,
      whitelist,
      frozen,
      paused: Boolean(legacy.paused),
      contractAddress: legacy.contractAddress && legacy.contractAddress !== "Not deployed" ? legacy.contractAddress : CONTRACT_ADDRESS,
      completedTasks: Object.entries(legacy.missions || {})
        .filter(([, done]) => Boolean(done))
        .map(([key]) => {
          const taskMap: Record<string, string> = {
            proofUpdated: "proof",
            whitelist: "whitelist",
            minted: "mint",
            emergencyControl: "freeze",
            redemption: "burn",
          };
          return taskMap[key] || key;
        }),
      events: (legacy.events || []).map((event: any, index: number) => ({
        id: `${event.type || "event"}-${index}-${event.at || Date.now()}`,
        time: event.at || new Date().toISOString(),
        type: String(event.type || "request").toLowerCase(),
        actor: event.type || "System",
        detail: event.key || event.type || "Legacy event",
      })),
      requests: legacyRequests.map((request: any) => ({
        id: request.id || request.requestHash?.slice(0, 14) || `req-${Date.now()}`,
        type: request.type === "redemption" ? "redemption" : "subscription",
        wallet: request.wallet,
        amount: Number(request.amount || 0),
        status: request.statusKey || request.status || "Pending review",
        requestHash: request.requestHash,
        createdAt: request.createdAt || new Date().toISOString(),
      })),
    };
  } catch {
    return null;
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));

    const migrated = migrateLegacyState();
    if (migrated) {
      const next = normalizeState(migrated);
      saveState(next);
      return next;
    }
  } catch {
    // Fall through to demo defaults.
  }
  return cloneState(DEFAULT_STATE);
}

function saveState(state: GoldState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function addEventToState(state: GoldState, type: string, actor: string, detail: string): GoldState {
  return {
    ...state,
    events: [{ id: `${type}-${Date.now()}`, time: new Date().toISOString(), type, actor, detail }, ...state.events],
  };
}

async function sha256Hex(input: string) {
  const bytes = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest("SHA-256", bytes);
  return `0x${Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function useGoldState() {
  const [state, setState] = useState(loadState);

  const update = useCallback((fn: (state: GoldState) => GoldState) => {
    setState((prev) => {
      const next = normalizeState(fn(prev));
      saveState(next);
      return next;
    });
  }, []);

  const addEvent = useCallback(
    (type: string, actor: string, detail: string) => {
      update((s) => addEventToState(s, type, actor, detail));
    },
    [update]
  );

  const completeTask = useCallback(
    (taskId: string) => {
      update((s) => ({
        ...s,
        completedTasks: s.completedTasks.includes(taskId) ? s.completedTasks : [...s.completedTasks, taskId],
      }));
    },
    [update]
  );

  const connectWallet = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      throw new Error("MetaMask is not available in this browser.");
    }

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const account = accounts?.[0];
    if (!account) throw new Error("No wallet account was returned.");

    try {
      await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: SEPOLIA_CHAIN_ID }] });
    } catch (chainError: any) {
      if (chainError?.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: "Sepolia",
                nativeCurrency: { name: "Sepolia Ether", symbol: "SEP", decimals: 18 },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } catch (addChainError) {
          console.warn("Wallet connected, but Sepolia could not be added.", addChainError);
        }
      } else {
        console.warn("Wallet connected, but Sepolia could not be selected.", chainError);
      }
    }

    update((s) =>
      addEventToState(
        { ...s, walletAddress: account, walletNetwork: "Sepolia" },
        "wallet",
        "Investor",
        `Connected wallet ${shortAddress(account)}`
      )
    );
    return account;
  }, [update]);

  const createRequest = useCallback(
    async (input: { type: "subscription" | "redemption"; wallet: string; amount: number }) => {
      const wallet = normalizeAddress(input.wallet);
      const amount = Number(input.amount);
      if (!isAddress(wallet)) throw new Error("Please enter a valid 0x wallet address.");
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Amount must be greater than zero.");

      const payload = {
        amount,
        createdAt: new Date().toISOString(),
        type: input.type,
        wallet: wallet.toLowerCase(),
      };
      const requestHash = await sha256Hex(JSON.stringify(payload));
      const request: GoldRequest = {
        id: requestHash.slice(0, 14),
        type: input.type,
        wallet,
        amount,
        status: input.type === "subscription" ? "Pending KYC / issuer review" : "Pending offchain settlement",
        requestHash,
        createdAt: payload.createdAt,
      };

      update((s) =>
        addEventToState(
          { ...s, requests: [request, ...s.requests] },
          "request",
          "Investor",
          `${input.type === "subscription" ? "Subscription" : "Redemption"} request ${amount} GGT from ${shortAddress(wallet)}`
        )
      );
      return request;
    },
    [update]
  );

  const updateRequestStatus = useCallback(
    (requestId: string, status: string) => {
      update((s) => {
        const request = s.requests.find((item) => item.id === requestId);
        const next = {
          ...s,
          requests: s.requests.map((item) => (item.id === requestId ? { ...item, status } : item)),
        };
        return addEventToState(
          next,
          "request",
          "Back Office",
          request ? `Updated ${shortAddress(request.wallet)} request to ${status}` : `Updated request ${requestId}`
        );
      });
    },
    [update]
  );

  const resetState = useCallback(() => {
    const next = cloneState(DEFAULT_STATE);
    saveState(next);
    setState(next);
  }, []);

  return {
    state,
    update,
    addEvent,
    completeTask,
    connectWallet,
    createRequest,
    updateRequestStatus,
    resetState,
    helpers: { isAddress, shortAddress, sha256Hex },
  };
}
