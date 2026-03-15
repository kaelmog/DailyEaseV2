"use client";
import { useState, useEffect } from "react";

export function useAutoSave(storageKey, defaultState) {
  const [state, setState] = useState(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  // 1. ON LOAD: Grab data from browser memory if it exists
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        // eslint-disable-next-line
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse auto-save data");
      }
    }
    // eslint-disable-next-line
    setIsHydrated(true); // Tells the app we finished loading memory
  }, [storageKey]);

  // 2. ON CHANGE: If the user types anything, save it to memory immediately
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, storageKey, isHydrated]);

  // 3. ON SUBMIT: Clear the memory so the next shift starts fresh
  const clearSavedData = () => {
    localStorage.removeItem(storageKey);
    setState(defaultState);
  };

  return [state, setState, clearSavedData, isHydrated];
}
