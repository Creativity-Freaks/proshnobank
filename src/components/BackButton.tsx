import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  className?: string;
}

export function BackButton({ label = "ফিরে যান", className = "" }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center gap-2 text-primary hover:text-primary/80 transition-colors ${className}`}
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="text-sm md:text-base">{label}</span>
    </button>
  );
}
