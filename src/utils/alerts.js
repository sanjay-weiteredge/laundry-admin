import Swal from 'sweetalert2';

const baseButtonStyles = {
  confirmButtonColor: '#1d4ed8',
  cancelButtonColor: '#6b7280',
};

const basePopupStyles = {
  width: 360,
  padding: '1.25rem',
  customClass: {
    popup: 'sweet-alert-popup',
    confirmButton: 'sweet-alert-btn',
    cancelButton: 'sweet-alert-btn sweet-alert-btn--cancel',
  },
};

export const showSuccessAlert = (title, text = '') => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'OK',
    ...baseButtonStyles,
    ...basePopupStyles,
  });
};

export const showErrorAlert = (title, text = '') => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Okay',
    ...baseButtonStyles,
    ...basePopupStyles,
  });
};

export const showConfirmAlert = ({
  title,
  text,
  confirmButtonText = 'Yes, continue',
  cancelButtonText = 'Cancel',
  icon = 'warning',
}) => {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    focusCancel: true,
    ...baseButtonStyles,
    ...basePopupStyles,
  });
};


