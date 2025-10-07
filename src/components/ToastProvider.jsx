import React, { createContext, useContext, useMemo, useState } from 'react';

const ToastCtx = createContext(null);

export function useToast() {
  return useContext(ToastCtx);
}

function Toast({ id, type, message, onClose }) {
  return (
    <div className={`toast ${type}`} role="status">
      <span>{message}</span>
      <button className="toast-close" onClick={() => onClose(id)} aria-label="Close">×</button>
    </div>
  );
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function remove(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function show(message, opts = {}) {
    const id = Date.now() + Math.random();
    const type = opts.type || 'info';
    setToasts((prev) => [...prev, { id, type, message }]);
    const ttl = opts.ttl ?? 3000;
    if (ttl > 0) {
      setTimeout(() => remove(id), ttl);
    }
  }

  const value = useMemo(() => ({ show }), []);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={remove} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}


