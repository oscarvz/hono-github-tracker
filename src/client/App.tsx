import { useEffect, useRef } from "react";
import "simpledotcss/simple.min.css";

import "./style.css";

export function App() {
  const ref = useRef<HTMLHeadingElement>(null);

  // Simple setup to test client-side logic
  useEffect(() => {
    const titleRef = ref.current;
    if (!titleRef) {
      return;
    }

    titleRef.textContent = "Dashboard";
  }, []);

  return <h1 ref={ref}>STATIC</h1>;
}
