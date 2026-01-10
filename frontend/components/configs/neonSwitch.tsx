"use client";

interface NeonSwitchProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
}

export default function NeonSwitch({ enabled, onChange }: NeonSwitchProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`
        relative w-12 h-6 rounded-full 
        transition-all duration-300 
        ${enabled ? "bg-orange-500 shadow-[0_0_12px_rgba(255,125,0,0.7)]" : "bg-gray-600"}
      `}
    >
      <div
        className={`
          absolute top-1 left-1 w-4 h-4 rounded-full transition-all duration-300
          ${enabled ? "translate-x-6 bg-black" : "translate-x-0 bg-white"}
        `}
      ></div>
    </button>
  );
}
