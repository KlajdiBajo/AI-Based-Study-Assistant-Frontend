import * as React from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 3000;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const toastTimeouts = new Map();

const addToRemoveQueue = (toastId, delay = TOAST_REMOVE_DELAY) => {
  if (toastTimeouts.has(toastId)) {
    clearTimeout(toastTimeouts.get(toastId))
  };

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, delay);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId, immediate = false } = action;
      
      if (immediate) {
        // For immediate dismissal (manual X click), remove right away
        if (toastId && toastTimeouts.has(toastId)) {
          clearTimeout(toastTimeouts.get(toastId));
          toastTimeouts.delete(toastId);
        }
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== toastId),
        };
      }
      
      // For auto-dismiss, set open to false and queue for removal
      if (toastId && toastTimeouts.has(toastId)) {
        clearTimeout(toastTimeouts.get(toastId));
        toastTimeouts.delete(toastId);
      }
      
      if (toastId) {
        addToRemoveQueue(toastId, 300);
      } else {
        state.toasts.forEach((toast) => {
          if (toastTimeouts.has(toast.id)) {
            clearTimeout(toastTimeouts.get(toast.id));
            toastTimeouts.delete(toast.id);
          }
          addToRemoveQueue(toast.id, 300);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t
        ),
      };
    }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

const listeners = [];
let memoryState = { toasts: [] };

function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

const ToastItem = ({ toast }) => {
  const getToastStyles = () => {
    const baseStyles = "flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 ease-in-out transform max-w-sm";
    
    switch (toast.variant) {
      case "destructive":
        return `${baseStyles} bg-red-50/95 border-red-200 text-red-800`;
      case "success":
        return `${baseStyles} bg-green-50/95 border-green-200 text-green-800`;
      case "warning":
        return `${baseStyles} bg-yellow-50/95 border-yellow-200 text-yellow-800`;
      default:
        return `${baseStyles} bg-blue-50/95 border-blue-200 text-blue-800`;
    }
  };

  const getIcon = () => {
    const iconStyles = "w-5 h-5 flex-shrink-0 mt-0.5";
    
    switch (toast.variant) {
      case "destructive":
        return <XCircle className={`${iconStyles} text-red-500`} />;
      case "success":
        return <CheckCircle className={`${iconStyles} text-green-500`} />;
      case "warning":
        return <AlertCircle className={`${iconStyles} text-yellow-500`} />;
      default:
        return <CheckCircle className={`${iconStyles} text-blue-500`} />;
    }
  };

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="font-semibold text-sm mb-1">{toast.title}</div>
        )}
        {toast.description && (
          <div className="text-sm opacity-90">{toast.description}</div>
        )}
      </div>
      <button
        onClick={() => dispatch({ type: "DISMISS_TOAST", toastId: toast.id, immediate: true })}
        className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast Container Component - FIXED
export const Toaster = () => {
  const state = useToast(); // Changed from [state] to state

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {state.toasts.map((toast) => (
        <div
          key={toast.id}
          className={`transition-all duration-300 ease-in-out ${
            toast.open 
              ? "animate-in slide-in-from-right-full" 
              : "animate-out slide-out-to-right-full"
          }`}
        >
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
};

function toast(props) {
  const id = genId();

  const update = (updateProps) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...updateProps, id },
    });

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });
  
  addToRemoveQueue(id);

  return {
    id,
    dismiss,
    update,
  };
}

// Enhanced toast methods
toast.success = (message, title = "Success") => {
  return toast({
    title,
    description: message,
    variant: "success",
  });
};

toast.error = (message, title = "Error") => {
  return toast({
    title,
    description: message,
    variant: "destructive",
  });
};

toast.warning = (message, title = "Warning") => {
  return toast({
    title,
    description: message,
    variant: "warning",
  });
};

toast.info = (message, title = "Info") => {
  return toast({
    title,
    description: message,
    variant: "default",
  });
};

function useToast() {
  const [state, setState] = React.useState(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };