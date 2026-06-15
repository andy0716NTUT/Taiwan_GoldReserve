import { useState, useCallback } from "react";

const STORAGE_KEY = "ggt_state_v1";

const DEFAULT_STATE = {
  supply: 1250,
  reserve: 1500,
  proofHash: "0xabc123def456789...demo",
  proofUpdated: new Date(Date.now() - 86400000 * 2).toISOString(),
  whitelist: ["0xAlice...demo", "0xBob...demo"],
  frozen: [],
  paused: false,
  events: [
    {
      id: "e1",
      time: new Date(Date.now() - 86400000 * 3).toISOString(),
      type: "proof",
      actor: "Auditor",
      detail: "初始 Proof-of-Reserve 上傳，黃金儲備 1500g",
    },
    {
      id: "e2",
      time: new Date(Date.now() - 86400000 * 2).toISOString(),
      type: "whitelist",
      actor: "Issuer",
      detail: "加入白名單：0xAlice...demo、0xBob...demo",
    },
    {
      id: "e3",
      time: new Date(Date.now() - 86400000).toISOString(),
      type: "mint",
      actor: "Issuer",
      detail: "Mint 1250 GGT → 0xAlice...demo",
    },
  ],
  completedTasks: [],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_STATE;
}

function saveState(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function useGoldState() {
  const [state, setState] = useState(loadState);

  const update = useCallback((fn) => {
    setState((prev) => {
      const next = fn(prev);
      saveState(next);
      return next;
    });
  }, []);

  const addEvent = useCallback((type, actor, detail) => {
    update((s) => ({
      ...s,
      events: [
        { id: `e${Date.now()}`, time: new Date().toISOString(), type, actor, detail },
        ...s.events,
      ],
    }));
  }, [update]);

  const completeTask = useCallback((taskId) => {
    update((s) => ({
      ...s,
      completedTasks: s.completedTasks.includes(taskId)
        ? s.completedTasks
        : [...s.completedTasks, taskId],
    }));
  }, [update]);

  const resetState = useCallback(() => {
    saveState(DEFAULT_STATE);
    setState(DEFAULT_STATE);
  }, []);

  return { state, update, addEvent, completeTask, resetState };
}
