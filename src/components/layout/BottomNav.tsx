import React from 'react';
import { Home, Search, MessageCircle, Briefcase, User, Plus, MapPin } from 'lucide-react';

interface BottomNavProps {
  userType?: 'worker' | 'contractor';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  userType = 'worker',
  activeTab = 'home',
  onTabChange
}) => {
  const workerNavItems: NavItem[] = [
    {
      id: 'home',
      label: 'Inicio',
      icon: <Home size={20} />,
      href: '/'
    },
    {
      id: 'jobs',
      label: 'Trabajos',
      icon: <Search size={20} />,
      href: '/jobs'
    },
    {
      id: 'nearby',
      label: 'Cerca',
      icon: <MapPin size={20} />,
      href: '/nearby'
    },
    {
      id: 'messages',
      label: 'Mensajes',
      icon: <MessageCircle size={20} />,
      href: '/messages',
      badge: 2 // Example unread count
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: <User size={20} />,
      href: '/profile'
    }
  ];

  const contractorNavItems: NavItem[] = [
    {
      id: 'home',
      label: 'Inicio',
      icon: <Home size={20} />,
      href: '/'
    },
    {
      id: 'workers',
      label: 'Trabajadores',
      icon: <Search size={20} />,
      href: '/workers'
    },
    {
      id: 'post-job',
      label: 'Publicar',
      icon: <Plus size={20} />,
      href: '/jobs/new'
    },
    {
      id: 'my-jobs',
      label: 'Mis Trabajos',
      icon: <Briefcase size={20} />,
      href: '/jobs/mine'
    },
    {
      id: 'messages',
      label: 'Mensajes',
      icon: <MessageCircle size={20} />,
      href: '/messages',
      badge: 1
    }
  ];

  const navItems = userType === 'worker' ? workerNavItems : contractorNavItems;

  const handleTabClick = (item: NavItem) => {
    onTabChange?.(item.id);
    // Handle navigation here if using router
    console.log(`Navigate to ${item.href}`);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-50"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className={`
                flex flex-col items-center justify-center px-2 py-1 min-w-0 flex-1
                transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset
                ${isActive 
                  ? 'text-primary-600' 
                  : 'text-gray-600 hover:text-gray-900 active:text-primary-600'
                }
              `}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </div>
                
                {/* Badge for unread messages */}
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </div>
                )}
              </div>
              
              <span 
                className={`
                  text-xs mt-1 truncate max-w-full leading-tight
                  ${isActive ? 'font-medium' : 'font-normal'}
                `}
              >
                {item.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
};