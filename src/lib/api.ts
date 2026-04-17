import { env } from "./env";

export const api = {
  get: <T>(path: string): Promise<T> =>
    fetch(`${env.API_URL}${path}`).then((r) => r.json() as Promise<T>),

  post: <T>(path: string, body: unknown): Promise<T> =>
    fetch(`${env.API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json() as Promise<T>),
};
