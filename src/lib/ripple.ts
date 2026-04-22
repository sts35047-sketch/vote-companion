import { MouseEvent } from "react";

/**
 * Adds a liquid ripple effect on click.
 * Usage: <button onClick={withRipple(myHandler)} className="ripple-host">…
 */
export function withRipple<T extends HTMLElement>(
  handler?: (e: MouseEvent<T>) => void,
) {
  return (e: MouseEvent<T>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const span = document.createElement("span");
    span.className = "ripple-fx";
    span.style.width = span.style.height = `${size}px`;
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;
    target.appendChild(span);
    window.setTimeout(() => span.remove(), 650);
    handler?.(e);
  };
}
