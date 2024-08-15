import { useEffect, useState } from "react";
import "simpledotcss/simple.min.css";

import "./style.css";

type AppProps = {
  greeting: string;
};

export function App({ greeting }: AppProps) {
  const [currentGreeting, setCurrentGreeting] = useState(greeting);

  const handleClick = () => setCurrentGreeting(`Clicked: ${greeting}`);

  useEffect(() => {
    // Simple setup to get feedback on hydration
    setCurrentGreeting(`Hydrated: ${greeting}`);

    // Remove the data-props attribute after hydration
    const rootElement = document.getElementById("root");
    rootElement?.removeAttribute("data-props");
  }, [greeting]);

  return (
    <div>
      <h1>{currentGreeting}</h1>
      <button type="button" onClick={handleClick}>
        click me!
      </button>
    </div>
  );
}
