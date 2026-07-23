import { useCallback, useEffect, useState } from "react";

/**
 * SGR 시리즈 공통 학생 답안 상태 훅.
 * lessonId 기준으로 localStorage에 저장/복원.
 * 값 형태:
 *  - number : MCQ 선택 인덱스
 *  - string : 텍스트 입력(빈칸/작문)
 *  - boolean: T/F 선택
 */
export type AnswerValue = number | string | boolean | null;

interface AnswerBucket {
  [key: string]: AnswerValue;
}

const KEY = (ns: string, lessonId: string) => `${ns}_answers_${lessonId}`;

export function useAnswers(ns: string, lessonId: string) {
  const [bucket, setBucket] = useState<AnswerBucket>({});

  // 초기 로드
  useEffect(() => {
    if (!lessonId) return;
    try {
      const raw = localStorage.getItem(KEY(ns, lessonId));
      setBucket(raw ? JSON.parse(raw) : {});
    } catch {
      setBucket({});
    }
  }, [ns, lessonId]);

  const set = useCallback(
    (key: string, value: AnswerValue) => {
      setBucket((prev) => {
        const next = { ...prev, [key]: value };
        try {
          localStorage.setItem(KEY(ns, lessonId), JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [ns, lessonId]
  );

  const clear = useCallback(() => {
    setBucket({});
    try {
      localStorage.removeItem(KEY(ns, lessonId));
    } catch {}
  }, [ns, lessonId]);

  return { bucket, set, clear };
}

/** 텍스트 정답 비교 유틸 */
export function isTextCorrect(user: string | null | undefined, answer: string): boolean {
  if (!user) return false;
  return user.trim().toLowerCase() === answer.trim().toLowerCase();
}
