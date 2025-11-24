import React from 'react';
import '../../styles/components/ui.css';

const InputField = ({
  label,
  id,
  type = 'text',
  helperText,
  ...props
}) => {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="ui-field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input id={inputId} type={type} {...props} />
      {helperText && <small>{helperText}</small>}
    </div>
  );
};

export default InputField;


