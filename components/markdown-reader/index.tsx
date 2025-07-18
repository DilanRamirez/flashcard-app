"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "./loading-spinner";
import { StudyApp } from "./study-app";

export default function Reader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <StudyApp />;
}
