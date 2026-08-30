import { FiCheckCircle, FiXCircle, FiInfo, FiAlertCircle } from "react-icons/fi";
import { useToast } from "../../../context/ToastContext";
import "./Toast.css";

function Toast() {
  const { toast, hideToast } = useToast();

  if (!toast) {
    return null;
  }

  const icons = {
    success: <FiCheckCircle />,
    error: <FiXCircle />,
    info: <FiInfo />,
    warning: <FiAlertCircle />,
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-icon">
        {icons[toast.type]}
      </div>

      <div className="toast-message">
        {toast.message}
      </div>

      <button
        type="button"
        className="toast-close"
        onClick={hideToast}
      >
        ×
      </button>
    </div>
  );
}

export default Toast;