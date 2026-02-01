import React, { useState } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  userType?: 'worker' | 'contractor';
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className = '',
  fullWidth = false,
  userType 
}) => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Simple responsive detection
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType={userType} />
      
      <div className="flex">
        {!isMobile && <Sidebar userType={userType} />}
        
        <main className={`flex-1 transition-all duration-300 ${isMobile ? 'pb-20' : 'md:ml-64'} ${className}`}>
          <div className={`${fullWidth ? '' : 'container mx-auto px-4 py-4 sm:py-6'}`}>
            {children}
          </div>
        </main>
      </div>
      
      {isMobile && <BottomNav userType={userType} />}
    </div>
  );
};