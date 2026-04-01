import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  textClassName?: string;
  imageClassName?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
};

const sizeStyles = {
  sm: {
    image: "h-8 w-8",
    text: "text-lg",
  },
  md: {
    image: "h-10 w-10",
    text: "text-xl",
  },
  lg: {
    image: "h-12 w-12",
    text: "text-2xl",
  },
};

const BrandLogo = ({
  className,
  textClassName,
  imageClassName,
  size = "md",
  showText = true,
}: BrandLogoProps) => {
  const current = sizeStyles[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src="/proshnobank.png"
        alt="প্রশ্নব্যাংক লোগো"
        className={cn(current.image, "rounded-xl object-cover", imageClassName)}
        loading="eager"
        decoding="async"
      />
      {showText ? (
        <span className={cn(current.text, "font-bold font-bengali text-foreground", textClassName)}>
          প্রশ্নব্যাংক
        </span>
      ) : null}
    </div>
  );
};

export default BrandLogo;
