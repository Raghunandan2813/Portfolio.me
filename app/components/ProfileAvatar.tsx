"use client";

import Image from "next/image";
import { useState } from "react";
import { PROFILE_PHOTO, SITE_NAME } from "@/lib/site";

type ProfileAvatarProps = {
  /** Rendered pixel size of the square image request. */
  size: number;
  className?: string;
  /** Shown until the photo exists, or if it fails to load. */
  initials?: string;
  priority?: boolean;
};

/**
 * Shows the profile photo, falling back to the monogram.
 *
 * The fallback matters because `public/profile.jpg` is added by hand: without
 * it the page would otherwise render a broken-image icon in the hero.
 */
export function ProfileAvatar({
  size,
  className,
  initials = "RK",
  priority = false,
}: ProfileAvatarProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return <span className={className}>{initials}</span>;

  return (
    <span className={className}>
      <Image
        src={PROFILE_PHOTO}
        alt={`${SITE_NAME}, ${"Full Stack & Agentic AI Engineer"}`}
        width={size}
        height={size}
        priority={priority}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
