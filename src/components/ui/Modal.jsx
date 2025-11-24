import React from 'react';
import { Modal as BootstrapModal, Button as BootstrapButton } from 'react-bootstrap';
import '../../styles/components/ui.css';

const Modal = ({
  open,
  isOpen,
  title,
  children,
  onClose,
  actions = [],
  size,
  ...props
}) => {
  const isModalOpen = open || isOpen;
  const modalSize = size === 'medium' ? 'lg' : size || undefined;

  return (
    <BootstrapModal
      show={isModalOpen}
      onHide={onClose}
      size={modalSize}
      centered
      {...props}
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>{children}</BootstrapModal.Body>
      {actions.length > 0 && (
        <BootstrapModal.Footer>
          {actions.map((action) => (
            <BootstrapButton
              key={action.label}
              variant={action.variant || 'secondary'}
              onClick={action.onClick}
            >
              {action.label}
            </BootstrapButton>
          ))}
        </BootstrapModal.Footer>
      )}
    </BootstrapModal>
  );
};

export default Modal;


