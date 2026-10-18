import { useEffect, useState } from "react";
import { Link, useLocation } from "../router";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function Nav() {
  const { pathname } = useLocation();
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="logo">
          search<span className="muted">.engine</span>
        </Link>
        <nav className="nav-links">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
            Search
          </Link>
          <Link href="/submit" aria-current={pathname === "/submit" ? "page" : undefined}>
            Submit
          </Link>
          <span className="badge">v1</span>
          <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? "light" : "dark"}
          </button>
        </nav>
      </div>
    </header>
  );
}
