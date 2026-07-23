"use client";
import React from "react";

// 高齢者向け: 大きく・高コントラスト・押しやすいボタン
type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  color?: "blue" | "green" | "orange" | "gray";
  type?: "button" | "submit";
  disabled?: boolean;
};

const COLORS: Record<string, string> = {
  blue: "bg-blue-600 text-white",
  green: "bg-green-500 text-white",
  orange: "bg-orange-500 text-white",
  gray: "bg-slate-200 text-slate-800",
};

export default function BigButton({ children, onClick, color = "blue", type = "button", disabled }: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full ${COLORS[color]} font-bold py-4 rounded-xl text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50`}
    >
      {children}
    </button>
  );
}
