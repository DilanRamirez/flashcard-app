"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import theme from "@/theme/theme";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useState, useEffect } from "react";
import { Preferences } from "@/types/study";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const defaultPreferences: Preferences = {
  theme: "light",
  fontSize: "med",
  fontFamily: "default",
  lineHeight: 1.6,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);

  // Load saved preferences on mount
  useEffect(() => {
    const saved = localStorage.getItem("awsStudyApp_preferences");
    if (saved) setPreferences(JSON.parse(saved));
  }, []);

  // Save preferences to localStorage whenever preferences change
  useEffect(() => {
    localStorage.setItem(
      "awsStudyApp_preferences",
      JSON.stringify(preferences),
    );
  }, [preferences]);

  // Apply theme, typography, and line-height to <html>
  useEffect(() => {
    const root = document.documentElement;
    // Theme class
    root.classList.remove("theme-light", "theme-dark");
    root.classList.add(`theme-${preferences.theme}`);
    // Font size classes
    root.classList.remove("font-sm", "font-med", "font-lg");
    root.classList.add(`font-${preferences.fontSize}`);
    // Line-height CSS var
    root.style.setProperty("--line-height", preferences.lineHeight.toString());
  }, [preferences]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
