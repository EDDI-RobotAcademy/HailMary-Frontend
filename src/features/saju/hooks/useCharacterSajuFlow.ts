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
      localStorage.setItem(requestIdKey, saju.data.sajuRequestId);
    } catch {}
  }, [saju.status, saju.data, requestIdKey]);

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
      const sajuRequestId =
        saju.data?.sajuRequestId ??
        (typeof window !== "undefined" ? localStorage.getItem(requestIdKey) : null);
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

  return { userName, userGender, userBirthYear, userBirthMonth, userCalendar, hasSubmittedInfo, surveyAnswers, setSurveyAnswers, submitInfo, finalizeSurvey };
}
