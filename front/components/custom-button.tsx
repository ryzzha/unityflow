import React, { ButtonHTMLAttributes } from "react";

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  className?: string;
}

export default function CustomButton({
  variant = "primary",
  className,
  children,
  ...props
}: CustomButtonProps) {
  let variantClasses = "";
  
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

  return (
    <button
      className={`
        text-sm
        font-semibold 
        rounded-md 
        px-4 
        py-2
        transition-colors 
        duration-300 
        ${variantClasses} 
        ${className ?? ""}
      `}
      {...props}
    >
      {children}
    </button>
  );
}