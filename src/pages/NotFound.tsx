import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSEO } from "@/hooks/useSEO";

const NotFound = () => {
  const location = useLocation();
  useSEO({ title: "Page not found — First Vote", description: "The page you're looking for doesn't exist." });

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="container pt-16 pb-24 text-center">
      <div className="glass rounded-3xl p-10 max-w-md mx-auto">
        <div className="text-7xl mb-4">🗺️</div>
        <h1 className="text-4xl font-extrabold mb-2">404</h1>
        <p className="text-muted-foreground mb-6">This page wandered off the ballot.</p>
        <Link to="/" className="btn-3d">Back to home</Link>
      </div>
    </div>
  );
};

export default NotFound;
