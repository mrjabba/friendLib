import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ className = "", disabled, ...props }: ButtonProps) {
  const baseClasses = "bg-slate-800 text-stone-100 px-4 py-2 rounded hover:bg-slate-700 transition";
  const disabledClasses = "disabled:opacity-50";

  return (
    <button
      className={`${baseClasses} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}
