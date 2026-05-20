export function BackgroundFX() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--color-glow)_22%,transparent),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,color-mix(in_oklab,var(--color-glow-2)_18%,transparent),transparent_55%)]" />
      <div className="blob anim-float top-[-10%] left-[-10%] h-[420px] w-[420px]" style={{ background: "var(--color-glow)" }} />
      <div className="blob anim-float-2 bottom-[-15%] right-[-10%] h-[520px] w-[520px]" style={{ background: "var(--color-glow-2)" }} />
      <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(var(--color-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
    </div>
  );
}
