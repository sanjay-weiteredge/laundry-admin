import React from 'react';
import '../../styles/components/ui.css';

const Button = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const classes = ['ui-button', `ui-button--${variant}`];
  if (fullWidth) classes.push('ui-button--block');
  if (className) classes.push(className);

  return (
    <button className={classes.join(' ')} {...props}>
      {children}
    </button>
  );
};

export default Button;


