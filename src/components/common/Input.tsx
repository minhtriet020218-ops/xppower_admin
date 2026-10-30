import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
}

export const Input: React.FC<InputProps> = ({ icon, style, ...props }) => {
  return (
    <div style={{ marginBottom: '15px', width: '100%' }}>
      <input
        {...props}
        style={{
          width: '100%',
          padding: '12px 20px',
          borderRadius: '25px',
          border: 'none',
          backgroundColor: '#5C9A69',
          color: '#fff',
          fontSize: '14px',
          outline: 'none',
          boxSizing: 'border-box',
          ...style,
        }}
      />
    </div>
  );
};