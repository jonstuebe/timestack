import { Modal } from './Modal';

interface ConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({ open, onCancel, onConfirm }: ConfirmModalProps) {
  return (
    <Modal title="Lock it in?" open={open} onClose={onCancel} className="modal-small">
      <p>You only get one try per day. Ready to see how you did?</p>
      <div className="button-row">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Keep arranging
        </button>
        <button type="button" className="primary-button" onClick={onConfirm} data-autofocus>
          Lock it in
        </button>
      </div>
    </Modal>
  );
}
