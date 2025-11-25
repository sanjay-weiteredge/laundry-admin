import Swal from 'sweetalert2';

const baseButtonStyles = {
  confirmButtonColor: '#1d4ed8',
  cancelButtonColor: '#6b7280',
};

export const showSuccessAlert = (title, text = '') => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
};

export const showErrorAlert = (title, text = '') => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Okay',
    ...baseButtonStyles,
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
  });
};


