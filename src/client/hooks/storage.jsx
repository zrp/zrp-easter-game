import _ from "lodash";
import { useState, useEffect } from "react";

export const useLocalStorage = (key, initialValue) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== "undefined") {
        const ev = new Event('localStorageChanged');
        ev.key = key;
        ev.newValue = valueToStore;
        document.dispatchEvent(ev);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  const cb = ({ key: k, newValue }) => {
    if (key != k) return;

    setStoredValue(newValue);
  }

  useEffect(() => {
    document.addEventListener('localStorageChanged', cb);

    return () => {
      document.removeEventListener('localStorageChanged', cb);
    }
  }, []);

  return [storedValue, setValue];
}
