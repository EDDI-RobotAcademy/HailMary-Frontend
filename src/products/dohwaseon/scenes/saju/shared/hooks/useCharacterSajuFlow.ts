"use client";

// 도화선 사주 씬의 폼·API·localStorage 오케스트레이션.
// - 정보 입력 저장, 사주 계산 API 호출
// - 서베이 단계별 답변 상태, 최종 제출 시 서버 전송
// - 로딩 3초 초과 시 문구 전환
// - 도윤/연우 씬이 storageKeyPrefix 만 달리해서 공용으로 사용.

import { useCallback, useEffect, useState } from "react";
import {
  postSajuSurvey,
  useSajuCalculate,
} from "@/features/saju";
import type { SajuInfo } from "../components/InfoForm";
import type { SurveyAnswers } from "../types";

export type CharacterSajuFlowConfig = {
  // "doyoon" → ("doyoonSaju", "doyoonSajuRequestId", "doyoonSurvey")
  storageKeyPrefix: string;
};

const SLOW_MESSAGE_THRESHOLD_MS = 3000;

export function useCharacterSajuFlow(config: CharacterSajuFlowConfig) {
  const { storageKeyPrefix } = config;
  const infoKey = `${storageKeyPrefix}Saju`;
  const requestIdKey = `${storageKeyPrefix}SajuRequestId`;
  const surveyKey = `${storageKeyPrefix}Survey`;

  const [userName, setUserName] = useState<string>("");
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswers>({
    step1: [],
    step2: [],
    step3: "",
  });
  const [loadingStartedAt, setLoadingStartedAt] = useState<number | null>(null);
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  const saju = useSajuCalculate();

  // mount 시 localStorage 에서 userName 복원.
  // 참고: 원본 동작 보존 — 첫 방문에 InfoForm 제출 후 userName state 가 즉시 갱신되지 않아
  // 결과 컷에서 이름이 비어보이는 기존 거동이 있다. Step 6 에서 별도 논의.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(infoKey);
      if (!raw) return;
      const info = JSON.parse(raw) as { name?: string };
      if (info?.name) setUserName(info.name);
    } catch {}
  }, [infoKey]);

  // 로딩 3초 초과 시 "별의 배치를 읽는 중…" 으로 문구 전환
  useEffect(() => {
    if (saju.status !== "loading") {
      setShowSlowMessage(false);
      return;
    }
    const t = setTimeout(
      () => setShowSlowMessage(true),
      SLOW_MESSAGE_THRESHOLD_MS,
    );
    return () => clearTimeout(t);
  }, [saju.status]);

  // 성공 응답의 sajuRequestId 보관 (서베이 전송 시 참조)
  useEffect(() => {
    if (saju.status !== "success" || !saju.data) return;
    try {
      localStorage.setItem(requestIdKey, saju.data.sajuRequestId);
    } catch {}
  }, [saju.status, saju.data, requestIdKey]);

  // InfoForm 제출 → localStorage 저장 + 사주 계산 API 호출
  const submitInfo = useCallback(
    (info: SajuInfo) => {
      try {
        localStorage.setItem(infoKey, JSON.stringify(info));
      } catch {}
      setLoadingStartedAt(Date.now());
      void saju.submit({
        birth: info.birth.replace(/\./g, "-"),
        time: info.time,
        calendar: info.calendar,
        gender: info.gender,
      });
    },
    [infoKey, saju],
  );

  // 서베이 step3 최종 제출 → localStorage 저장 + 서버 전송
  const finalizeSurvey = useCallback(
    (finalAnswers: SurveyAnswers) => {
      setSurveyAnswers(finalAnswers);
      try {
        localStorage.setItem(surveyKey, JSON.stringify(finalAnswers));
      } catch {}
      const sajuRequestId =
        saju.data?.sajuRequestId ??
        (typeof window !== "undefined"
          ? localStorage.getItem(requestIdKey)
          : null);
      if (sajuRequestId) {
        void postSajuSurvey({
          sajuRequestId,
          surveyVersion: "v1",
          step1: finalAnswers.step1,
          step2: finalAnswers.step2,
          step3: finalAnswers.step3.length > 0 ? finalAnswers.step3 : null,
        });
      }
    },
    [surveyKey, saju.data, requestIdKey],
  );

  // 에러 상태에서 "다시 시도" 클릭
  const retrySaju = useCallback(() => {
    setLoadingStartedAt(Date.now());
    void saju.retry();
  }, [saju]);

  return {
    userName,
    surveyAnswers,
    setSurveyAnswers,
    loadingStartedAt,
    showSlowMessage,
    sajuStatus: saju.status,
    sajuData: saju.data,
    sajuError: saju.error,
    submitInfo,
    finalizeSurvey,
    retrySaju,
  };
}
