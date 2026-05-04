import { notFound } from "next/navigation";
import DoyoonSajuScene from "@/features/saju/views/doyoon/DoyoonSajuScene";
import YeonwooSajuScene from "@/features/saju/views/yeonwoo/YeonwooSajuScene";

type Props = { params: Promise<{ character: string }> };

export function generateStaticParams() {
  return [{ character: "doyoon" }, { character: "yeonwoo" }];
}

export default async function SajuPage({ params }: Props) {
  const { character } = await params;

  if (character === "doyoon") return <DoyoonSajuScene />;
  if (character === "yeonwoo") return <YeonwooSajuScene />;

  notFound();
}
