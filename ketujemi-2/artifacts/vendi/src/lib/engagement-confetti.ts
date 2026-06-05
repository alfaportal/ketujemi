/** Lightweight confetti burst without extra dependencies. */
export function fireEngagementConfetti(durationMs = 2800): void {
  if (typeof document === "undefined") return;

  const colors = ["#2563eb", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6"];
  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  container.style.cssText =
    "pointer-events:none;position:fixed;inset:0;z-index:9999;overflow:hidden;";
  document.body.appendChild(container);

  const pieces = 72;
  for (let i = 0; i < pieces; i++) {
    const el = document.createElement("span");
    const size = 6 + Math.random() * 8;
    const left = Math.random() * 100;
    const delay = Math.random() * 400;
    const rotate = Math.random() * 360;
    const color = colors[i % colors.length];
    el.style.cssText = [
      "position:absolute",
      "top:-12px",
      `left:${left}%`,
      `width:${size}px`,
      `height:${size * 0.6}px`,
      `background:${color}`,
      `transform:rotate(${rotate}deg)`,
      "opacity:0.95",
      "border-radius:1px",
      `animation:kj-confetti-fall ${1.6 + Math.random()}s ease-in ${delay}ms forwards`,
    ].join(";");
    container.appendChild(el);
  }

  if (!document.getElementById("kj-confetti-style")) {
    const style = document.createElement("style");
    style.id = "kj-confetti-style";
    style.textContent = `@keyframes kj-confetti-fall {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
    }`;
    document.head.appendChild(style);
  }

  window.setTimeout(() => container.remove(), durationMs);
}
