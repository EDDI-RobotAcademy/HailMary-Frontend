"use client";

import DoyoonSajuScene from "./doyoon/DoyoonSajuScene";
import YeonwooSajuScene from "./yeonwoo/YeonwooSajuScene";

export type SajuCharacter = "yeonwoo" | "doyoon";

export default function SajuScene({ character }: { character: SajuCharacter }) {
  if (character === "doyoon") return <DoyoonSajuScene />;
  return <YeonwooSajuScene />;
}
