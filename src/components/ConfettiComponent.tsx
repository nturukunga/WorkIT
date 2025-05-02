"use client";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";

export default function ConfettiComponent() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function updateSize() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return <Confetti width={dimensions.width} height={dimensions.height} />;
} 