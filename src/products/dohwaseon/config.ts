export const SCENES = ["landing", "intro", "character-select"] as const;

export type SceneName = (typeof SCENES)[number];

export const SCENE_ROUTES: Record<SceneName, string> = {
  landing: "/",
  intro: "/intro",
  "character-select": "/select",
};
