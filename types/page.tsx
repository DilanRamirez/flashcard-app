"use client";

import { useState, useEffect } from "react";
import { StudyApp } from "@/components/study-app";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading App
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return <StudyApp />;
}
