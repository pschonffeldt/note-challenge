"use client";

import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant =
  | "primary" // blue (main actions)
  | "secondary" // dark slate (Edit)
  | "muted" // grey (Cancel)
  | "success" // green (Save)
  | "danger" // red (Delete)
  | "warning" // amber (Archive / Unarchive)
  | "info"; // indigo (Categories)

type Size = "sm" | "md";

export type ButtonStyleOptions = {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center rounded font-semibold " +
  "transition-colors focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-offset-2 focus-visible:ring-blue-500 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const variantClasses: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-slate-600 text-white hover:bg-slate-700",
  muted: "bg-slate-400 text-white hover:bg-slate-500",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  danger: "bg-red-500 text-white hover:bg-red-600",
  warning: "bg-amber-500 text-white hover:bg-amber-600",
  info: "bg-indigo-600 text-white hover:bg-indigo-700",
};

const sizeClasses: Record<Size, string> = {
  md: "h-10 px-4 py-2 text-sm",
  sm: "px-3 py-1 text-xs",
};

export function buttonClasses(options: ButtonStyleOptions = {}) {
  const { variant = "primary", size = "md" } = options;
  return clsx(base, variantClasses[variant], sizeClasses[size]);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleOptions;

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(buttonClasses({ variant, size }), className)}
      {...props}
    />
  );
}
