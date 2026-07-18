import { projectId, publicAnonKey } from './supabase/info';

/**
 * Centralized server API configuration.
 */
const SERVER_ORIGIN: string =
  `https://${projectId}.supabase.co/functions/v1`;

export const SERVER_BASE_PATH: string = '/make-server-7db3bef3';

export const SERVER_BASE_URL = `${SERVER_ORIGIN}${SERVER_BASE_PATH}`;

/** Authorization headers required by the Supabase edge function. */
export const getServerHeaders = (): Record<string, string> => ({
  Authorization: `Bearer ${publicAnonKey}`,
});

/** Convenience helper used by fetch utilities. */
export const getServerRequestContext = () => ({
  headers: getServerHeaders(),
  baseUrl: SERVER_BASE_URL,
});
