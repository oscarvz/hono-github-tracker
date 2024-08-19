import { useEffect, useRef } from "react";

import style from "./App.module.css";
import "./style.css";

export function App() {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = "Client-side logic works!";
    }
  }, []);

  return (
    <div className={style.app}>
      <h1 ref={ref}>I'm static</h1>
    </div>
  );
}
