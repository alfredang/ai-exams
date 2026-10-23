/**
 * Storefront-only motion: the animated gradient border on the highlighted
 * Exam Voucher card and a soft shimmer on its ribbon. Entrance animations use
 * Tailwind's `animate-fade-up` with `motion-safe:`; everything here also stops
 * under prefers-reduced-motion.
 */
export function StorefrontMotionStyles() {
  return (
    <style>{`
@keyframes te-border-pan { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }
.te-glow-border {
  background: linear-gradient(90deg, #10b981, #0ea5e9, #6366f1, #10b981);
  background-size: 200% 100%;
  animation: te-border-pan 6s linear infinite;
}
@keyframes te-shimmer { 0% { transform: translateX(-120%); } 55%, 100% { transform: translateX(260%); } }
.te-shimmer { position: relative; overflow: hidden; }
.te-shimmer::after {
  content: ''; position: absolute; inset: 0; width: 45%;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,.45), transparent);
  transform: translateX(-120%);
  animation: te-shimmer 3.6s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .te-glow-border, .te-shimmer::after { animation: none; }
}
`}</style>
  );
}
