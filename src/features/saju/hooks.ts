"use client";

import { useCallback, useRef, useState } from "react";
import { postSajuFree } from "./api";
import type { SajuError, SajuFreeRequest, SajuFreeResponse } from "./types";

type Status = "idle" | "loading" | "success" | "error";

interface State {
  status: Status;
  data?: SajuFreeResponse;
  error?: SajuError;
  startedAt?: number;
}

export function useSajuCalculate() {
  const [state, setState] = useState<State>({ status: "idle" });
  const lastReq = useRef<SajuFreeRequest | null>(null);

  const submit = useCallback(async (req: SajuFreeRequest) => {
    lastReq.current = req;
    setState({ status: "loading", startedAt: Date.now() });
    const res = await postSajuFree(req);
    if (res.ok) {
      setState({ status: "success", data: res.data });
    } else {
      setState({ status: "error", error: res.error });
    }
    return res;
  }, []);

  const retry = useCallback(async () => {
    if (!lastReq.current) return null;
    return submit(lastReq.current);
  }, [submit]);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { ...state, submit, retry, reset };
}
