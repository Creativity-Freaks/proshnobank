import { ReactNode } from "react";
import { BackButton } from "./BackButton";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  showBack?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  children,
  className = "",
  showBack = true,
}: PageHeaderProps) {
  return (
    <div className={`mb-6 md:mb-8 ${className}`}>
      {showBack && <BackButton className="mb-4 md:mb-6" />}

      <div className="text-center">
        {icon && (
          <div className="flex items-center justify-center gap-2 mb-4 text-primary">{icon}</div>
        )}

        <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">{title}</h1>

        {subtitle && (
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
