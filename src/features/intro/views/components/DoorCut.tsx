"use client";

interface DoorCutProps {
  bgImage: string;
  fading: boolean;
  onDoorClick: () => void;
}

export function DoorCut({ fading, onDoorClick }: DoorCutProps) {
  if (fading) return null;

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDoorClick();
        }}
        className="absolute left-1/2 top-[72%] z-20 h-20 w-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full animate-[doorGlow_2s_ease-in-out_infinite]"
      />
      <p className="absolute bottom-24 left-0 right-0 z-20 animate-pulse text-center text-base font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
        문을 눌러 안으로 입장합니다
      </p>
    </>
  );
}
