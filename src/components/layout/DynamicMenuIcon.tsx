import React from 'react';
import { 
  Truck, 
  FileClock, 
  HardHat, 
  Users, 
  ShieldCheck, 
  LayoutGrid 
} from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
}

export const DynamicMenuIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-5 h-5' }) => {
  const iconMap: Record<string, React.ReactElement> = {
    'truck': <Truck className={className} />,
    'file-clock': <FileClock className={className} />,
    'hard-hat': <HardHat className={className} />,
    'users': <Users className={className} />,
    'shield-check': <ShieldCheck className={className} />
  };

  return iconMap[name.toLowerCase()] || <LayoutGrid className={className} />;
};
