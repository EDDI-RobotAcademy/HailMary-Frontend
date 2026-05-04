"use client";

import { useCallback, useEffect, useState } from "react";
import { postSajuSurvey, useSajuCalculate } from "@/features/saju";
import type { SajuInfo } from "../views/shared/InfoForm";
import type { SurveyAnswers } from "../domain/types";

export type CharacterSajuFlowConfig = {
  storageKeyPrefix: string;
};

export function useCharacterSajuFlow(config: CharacterSajuFlowConfig) {
  const { storageKeyPrefix } = config;
  const infoKey = `${storageKeyPrefix}Saju`;
  // 기존 sajuRequestId 자리 — 이제 sessionToken 문자열을 보관. 결정론적 카피 picker용 시드로도 사용.
  const requestIdKey = `${storageKeyPrefix}SajuRequestId`;
  const surveyKey = `${storageKeyPrefix}Survey`;

  const [userName, setUserName] = useState<string>("");
  const [userGender, setUserGender] = useState<string>("");
  const [userBirthYear, setUserBirthYear] = useState<string>("");
  const [userBirthMonth, setUserBirthMonth] = useState<string>("");
  const [userCalendar, setUserCalendar] = useState<string>("");
  const [hasSubmittedInfo, setHasSubmittedInfo] = useState<boolean>(false);
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswers>({
    step1: [],
    step2: [],
    step3: "",
  });
  const saju = useSajuCalculate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(infoKey);
      if (!raw) return;
      const info = JSON.parse(raw) as { name?: string; gender?: string; birth?: string; calendar?: string };
      if (info?.name) setUserName(info.name);
      if (info?.gender) setUserGender(info.gender);
      if (info?.birth) setUserBirthYear(info.birth.slice(0, 4));
      if (info?.birth) setUserBirthMonth(info.birth.slice(5, 7));
      if (info?.calendar) setUserCalendar(info.calendar);
    } catch {}
  }, [infoKey]);

  useEffect(() => {
    if (saju.status !== "success" || !saju.data) return;
    try {
      const dataKey = `${storageKeyPrefix}SajuData`;
      // 백엔드 응답에서 sessionToken을 제외한 나머지를 저장.
      // sajuData(FT raw) + charm/blocking/spouseAvoid/spouseMatch/monthlyRomanceFlow 모두 포함.
      const { sessionToken, sajuData, ...analysisFields } = saju.data as unknown as {
        sessionToken: string;
        sajuData?: Record<string, unknown>;
        [key: string]: unknown;
      };
      const toStore = { ...(sajuData ?? {}), ...analysisFields };
      localStorage.setItem(dataKey, JSON.stringify(toStore));
      // 결정론적 카피 picker는 unique seed가 필요할 뿐 → sessionToken을 그대로 시드로 사용.
      localStorage.setItem(requestIdKey, String(sessionToken ?? ""));
    } catch {}
  }, [saju.status, saju.data, requestIdKey, storageKeyPrefix]);

  const submitInfo = useCallback(
    (info: SajuInfo) => {
      try {
        localStorage.setItem(infoKey, JSON.stringify(info));
      } catch {}
      setUserGender(info.gender);
      setUserBirthYear(info.birth.slice(0, 4));
      setUserBirthMonth(info.birth.slice(5, 7));
      setUserCalendar(info.calendar);
      setHasSubmittedInfo(true);
      void saju.submit({
        name: info.name,
        birth: info.birth.replace(/\./g, "-"),
        time: info.time,
        calendar: info.calendar,
        gender: info.gender,
      });
    },
    [infoKey, saju],
  );

  const finalizeSurvey = useCallback(
    (finalAnswers: SurveyAnswers) => {
      setSurveyAnswers(finalAnswers);
      try {
        localStorage.setItem(surveyKey, JSON.stringify(finalAnswers));
      } catch {}
      // sessionToken은 lib/api.ts의 buildHeaders에서 자동 첨부됨. 누락 시 401.
      void postSajuSurvey({
        surveyVersion: "v1",
        step1: finalAnswers.step1,
        step2: finalAnswers.step2,
        step3: finalAnswers.step3.length > 0 ? finalAnswers.step3 : null,
      });
    },
    [surveyKey],
  );

  return { userName, userGender, userBirthYear, userBirthMonth, userCalendar, hasSubmittedInfo, surveyAnswers, setSurveyAnswers, submitInfo, finalizeSurvey };
}
