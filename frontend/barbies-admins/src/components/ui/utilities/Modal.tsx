import type { ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[90%] max-w-md p-6 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-purple-500"
        >
          <X size={20} />
        </button>
        {title && (
          <h2 className="text-xl font-semibold text-purple-600 mb-4">
            {title}
          </h2>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;

// usage

// const [open, setOpen] = useState(false);

// <Button onClick={() => setOpen(true)}>Open Modal</Button>

// <Modal isOpen={open} onClose={() => setOpen(false)} title="Review Product">
//   <p>Here you can submit your product review.</p>
// </Modal>
