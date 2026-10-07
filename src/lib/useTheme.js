"use client";
import { useEffect, useState } from "react";

// Follows the data-theme attribute that the theme toggle sets on <html>.
export function useTheme() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const read = () => setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
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
    borderRadius: "0.75rem",
  },
  light: {
    colorPrimary: "#15803d",
    colorBackground: "#ffffff",
    colorText: "#0d1b14",
    colorTextSecondary: "#546459",
    colorTextOnPrimaryBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#0d1b14",
    colorNeutral: "#0d1b14",
    borderRadius: "0.75rem",
  },
};
