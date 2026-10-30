import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <div style={{ backgroundColor: '#fff', padding: '8px 30px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: '10px' }}>
      <select style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #D1D5DB', fontSize: '12px' }}>
        <option>VN - Vietnam</option>
      </select>
    </div>
  );
};