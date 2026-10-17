"use client";

import { useCallback, useEffect, useState } from "react";
import type { BackendMode } from "./mock/types";

const URL_KEY = "company-brain.backend-url";
const MODE_KEY = "company-brain.backend-mode";

export function getStoredBackendUrl(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(URL_KEY) ?? "";
}

export function getStoredBackendMode(): BackendMode {
  if (typeof window === "undefined") return "mock";
  const raw = window.localStorage.getItem(MODE_KEY);
  return raw === "live" || raw === "auto" ? raw : "mock";
}

export function resolveBackendMode(
  mode: BackendMode,
  baseUrl: string,
): "mock" | "live" {
  if (mode === "mock") return "mock";
  if (!baseUrl.trim()) return "mock";
  return "live";
}

export function useBackendConfig() {
  const [baseUrl, setBaseUrlState] = useState("");
  const [mode, setModeState] = useState<BackendMode>("mock");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setBaseUrlState(getStoredBackendUrl());
    setModeState(getStoredBackendMode());
    setHydrated(true);
  }, []);

  const setBaseUrl = useCallback((url: string) => {
    setBaseUrlState(url);
    try {
      window.localStorage.setItem(URL_KEY, url);
    } catch {
      // ignore (private mode)
    }
  }, []);

  const setMode = useCallback((m: BackendMode) => {
    setModeState(m);
    try {
      window.localStorage.setItem(MODE_KEY, m);
    } catch {
      // ignore
    }
  }, []);

  const reset = useCallback(() => {
    setBaseUrlState("");
    setModeState("mock");
    try {
      window.localStorage.removeItem(URL_KEY);
      window.localStorage.removeItem(MODE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return {
    baseUrl,
    mode,
    hydrated,
    effective: resolveBackendMode(mode, baseUrl),
    setBaseUrl,
    setMode,
    reset,
  };
}
