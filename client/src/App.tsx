import "./index.css";
import { Nav } from "./components/Nav";
import { Home } from "./pages/Home";
import { Submit } from "./pages/Submit";
import { Link, useLocation } from "./router";

export function App() {
  const { pathname } = useLocation();

  let page;
  if (pathname === "/") page = <Home />;
  else if (pathname === "/submit") page = <Submit />;
  else
    page = (
      <main className="home-hero">
        <p className="section-label">404</p>
        <h1 className="hero-title">
          Page not <span className="muted">found.</span>
        </h1>
        <Link href="/" className="link-arrow">
          Back to search →
        </Link>
      </main>
    );

  return (
    <div className="app">
      <Nav />
      {page}
    </div>
  );
}

export default App;
