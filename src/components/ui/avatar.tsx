"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: 24 | 32 | 40 | 56 | 96;
  src?: string | null;
  alt?: string;
  fallback?: string;
  name?: string;
}

export function Avatar({
  className,
  size = 40,
  src,
  alt = "User avatar",
  fallback = "U",
  name,
  ...props
}: AvatarProps) {
  const effectiveFallback = name || fallback;
  const sizeClasses = {
    24: "h-6 w-6 text-xs",
    32: "h-8 w-8 text-xs",
    40: "h-10 w-10 text-body-sm font-semibold",
    56: "h-14 w-14 text-title-md font-semibold",
    96: "h-24 w-24 text-display-xl font-bold",
  };

  const getInitials = (text: string) => {
    return text
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full select-none",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center rounded-full bg-cat-rose text-cat-rose-ink uppercase"
      >
        {getInitials(effectiveFallback)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

export function AvatarStack({
  avatars,
  size = 32,
  className,
}: {
  avatars: { src?: string; alt?: string; fallback?: string }[];
  size?: 24 | 32 | 40;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center -space-x-2.5", className)}>
      {avatars.map((item, idx) => (
        <Avatar
          key={idx}
          size={size}
          src={item.src}
          alt={item.alt}
          fallback={item.fallback}
          className="ring-2 ring-canvas"
        />
      ))}
    </div>
  );
}
