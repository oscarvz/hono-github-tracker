import { useEffect, useRef } from "react";
import "simpledotcss/simple.min.css";

import "./style.css";

type AppProps = {
  greeting: string;
};

export function App({ greeting }: AppProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const titleRef = ref.current;
    if (!titleRef) {
      return;
    }

    // Simple setup to get feedback on hydration
    titleRef.textContent = `Hydrated: ${greeting}`;

    // Remove the data-props attribute after hydration
    const rootElement = document.getElementById("root");
    rootElement?.removeAttribute("data-props");
  }, [greeting]);

  return <h1 ref={ref}>{greeting}</h1>;
}
