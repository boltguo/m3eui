import * as React from "react";

export function useOffscreen(
  ref: React.RefObject<Element | null>,
  enabled = true,
): boolean {
  const [offscreen, setOffscreen] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof IntersectionObserver === "undefined") {
      setOffscreen(false);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) setOffscreen(!entry.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, enabled]);

  return offscreen;
}
