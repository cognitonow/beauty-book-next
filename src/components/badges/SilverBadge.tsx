import React from 'react';
import { Award } from 'lucide-react';

interface SilverBadgeProps {
  children: React.ReactNode;
}

const SilverBadge: React.FC<SilverBadgeProps> = ({ children }) => {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#C0C0C0', color: '#000', borderRadius: '9999px', padding: '4px 12px', fontSize: '14px', fontWeight: 'bold' }}>
      <Award size={16} style={{ marginRight: '6px', color: '#000' }} />
      {children}
    </span>
  );
};

export default SilverBadge;