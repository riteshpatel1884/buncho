"use client";
import { useEffect, useState } from "react";

// Follows the data-theme attribute that the theme toggle sets on <html>. Light is the default.
export function useTheme() {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const read = () => setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return theme;
}

// Clerk's own components can't read our CSS, so they get the matching colours here.
export const CLERK_VARS = {
  dark: {
    colorPrimary: "#34d67b",
    colorBackground: "#0e1110",
    colorText: "#ecf3ee",
    colorTextSecondary: "#8a9a90",
    colorTextOnPrimaryBackground: "#04140a",
    colorInputBackground: "#161b18",
    colorInputText: "#ecf3ee",
    colorNeutral: "#ecf3ee",
    borderRadius: "0.5rem",
  },
  light: {
    colorPrimary: "#2347f5",
    colorBackground: "#ffffff",
    colorText: "#0b1b33",
    colorTextSecondary: "#566277",
    colorTextOnPrimaryBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#0b1b33",
    colorNeutral: "#0b1b33",
    borderRadius: "0.5rem",
  },
};