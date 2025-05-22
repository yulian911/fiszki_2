'use client';

import { useEffect } from 'react';

// Type for the handlers record, mapping key strings to functions
export type KeyboardShortcutHandlers = Record<string, (event: KeyboardEvent) => void>;

export const useKeyboardShortcuts = (handlers: KeyboardShortcutHandlers, active: boolean = true) => {
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Allow shortcuts only if the event target is the body or not an input/textarea/select
      // to avoid interfering with typing in form fields.
      const targetElement = event.target as HTMLElement;
      const  isTargetEditable = targetElement.isContentEditable || 
                               targetElement.tagName === 'INPUT' || 
                               targetElement.tagName === 'TEXTAREA' || 
                               targetElement.tagName === 'SELECT';

      // Check if the pressed key is one of the defined handlers
      const handler = handlers[event.key];
      
      if (handler) {
        // If a specific element is focused that is not editable (e.g. a button), allow shortcut
        // If body is focused, allow shortcut.
        // If an editable element is focused, prevent shortcut.
        if (document.activeElement === document.body || !isTargetEditable) {
            event.preventDefault(); // Prevent default browser action for this key (e.g., space scrolling)
            handler(event); // Execute the handler
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlers, active]); // Re-run effect if handlers or active state change
}; 