import { projectId, publicAnonKey } from './supabase/info';

/**
 * Centralized server API configuration.
 */
const SERVER_ORIGIN: string =
  `https://${projectId}.supabase.co/functions/v1`;

export const SERVER_BASE_PATH: string = '/make-server-7db3bef3';

export const SERVER_BASE_URL = `${SERVER_ORIGIN}${SERVER_BASE_PATH}`;

/**
 * 커스텀 User-Agent 문자열.
 * - OBS (Open Broadcast Software) 식별자를 포함시켜, 스트리밍/녹화 환경에서
 *   트래픽 모니터링이나 화면 캡처 도구와의 연동을 쉽게 함.
 * - 실제 브라우저 UA 도 함께 포함하여 호환성 유지.
 */
const OBS_UA_PREFIX = 'OBS/30.0.0 ';

function buildUserAgent(): string {
  if (typeof navigator === 'undefined') return `${OBS_UA_PREFIX}AllMyExam/1.0`;
  return `${OBS_UA_PREFIX}${navigator.userAgent}`;
}

/** Authorization headers required by the Supabase edge function. */
export const getServerHeaders = (): Record<string, string> => ({
  Authorization: `Bearer ${publicAnonKey}`,
  'User-Agent': buildUserAgent(),
});

/** Convenience helper used by fetch utilities. */
export const getServerRequestContext = () => ({
  headers: getServerHeaders(),
  baseUrl: SERVER_BASE_URL,
});

/**
 * Claude API 서버 프록시 엔드포인트.
 * 클라이언트가 apiclaude.cc를 직접 호출하지 않고 서버를 경유하도록 우회.
 * (GLM은 클라이언트에서 직접 호출 — 이 엔드포인트 미사용)
 */
export const CLAUDE_PROXY_URL = `${SERVER_BASE_URL}/ai/claude-chat`;
