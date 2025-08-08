import React from 'react';
import { Award } from 'lucide-react';

interface ExperiencedBadgeProps {
  serviceName?: string;
}

const ExperiencedBadge: React.FC<ExperiencedBadgeProps> = ({ serviceName = 'Gel Manicure' }) => {
  return (
    <div className="flex items-center space-x-2 p-2 border-2 border-silver rounded-lg shadow-md bg-white">
      <Award size={24} className="text-gray-600" />
      <span className="text-lg font-semibold text-gray-800">Experienced: {serviceName}</span>
      <span className="text-xl">🥈</span>
    </div>
  );
};

export default ExperiencedBadge;
