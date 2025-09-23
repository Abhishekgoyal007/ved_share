// components/Modal.jsx
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-gray-900 text-gray-200 p-6 rounded-lg w-full max-w-md shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
