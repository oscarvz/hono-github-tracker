import { useEffect, useRef } from "hono/jsx";

export function Client() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = "I'm dynamic!";
    }
  }, []);

  return (
    <div>
      <h1 ref={ref}>I'm static</h1>
    </div>
  );
}
