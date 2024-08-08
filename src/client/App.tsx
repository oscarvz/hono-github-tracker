import { useEffect, useRef } from "hono/jsx";

export function App() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = "Client-side logic works!";
    }
  }, []);

  return (
    <div>
      <h1 ref={ref}>I'm static</h1>
    </div>
  );
}
