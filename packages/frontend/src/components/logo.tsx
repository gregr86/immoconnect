import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "white";
  className?: string;
}

export function Logo({ variant = "default", className }: LogoProps) {
  return (
    <img
      src={variant === "white" ? "/logo-white.svg" : "/logo.svg"}
      alt="ImmoConnect.ai"
      className={cn("h-8 w-auto", className)}
    />
  );
}
