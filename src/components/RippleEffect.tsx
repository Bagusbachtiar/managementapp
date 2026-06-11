"use client";

import { useEffect } from "react";

export function RippleEffect() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const button = target.closest("button");
      if (!button || button.disabled) return;

      const rect = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple-effect";
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      button.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
