"use client"
import React, { ButtonHTMLAttributes } from "react";

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "base" | "big";
  className?: string;
}

export default function CustomButton({
  variant = "primary",
  size = "base",
  className,
  children,
  ...props
}: CustomButtonProps) {
  let variantClasses = "";
  let sizeClasses = "";
  
  switch (variant) {
    case "primary":
      variantClasses = "bg-green-400 hover:bg-green-500 text-white";
      break;
    case "secondary":
      variantClasses = "bg-gray-200 hover:bg-gray-300 text-gray-800";
      break;
    case "danger":
      variantClasses = "bg-red-500 hover:bg-red-600 text-white";
      break;
    default:
      variantClasses = "bg-green-500 hover:bg-green-600 text-white";
  }

  switch (size) {
    case "small":
      sizeClasses = "px-2 py-1";
      break;
    case "base":
      sizeClasses = "px-4 py-2";
      break;
    case "big":
      sizeClasses = "px-4 py-3";
      break;
    default:
      variantClasses = "bg-green-500 hover:bg-green-600 text-white";
  }

  return (
    <button
      className={`
        text-sm
        font-semibold 
        rounded-md 
        transition-colors 
        duration-300 
        ${variantClasses} 
        ${sizeClasses} 
        ${className ?? ""}
        ${props.disabled ? "opacity-50 pointer-events-none" : ""}
      `}
      {...props}
    >
      {children}
    </button>
  );
}