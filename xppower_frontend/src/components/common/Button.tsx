import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, style, ...props }) => {
  return (
    <button
      {...props}
      style={{
        width: '100%',
        padding: '12px',
        borderRadius: '25px',
        border: 'none',
        backgroundColor: '#23522B',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        ...style,
      }}
    >
      {children}
    </button>
  );
};