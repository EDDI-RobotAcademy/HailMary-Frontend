import { notFound } from "next/navigation";
import SajuScene, {
  type SajuCharacter,
} from "@/products/dohwaseon/scenes/saju/SajuScene";

const VALID_CHARACTERS: readonly SajuCharacter[] = ["yeonwoo", "doyoon"];

export default async function SajuPage({
  params,
}: {
  params: Promise<{ character: string }>;
}) {
  const { character } = await params;
  if (!VALID_CHARACTERS.includes(character as SajuCharacter)) {
    notFound();
  }
  return <SajuScene character={character as SajuCharacter} />;
}
