import React, { useState } from 'react';
import { 
  Home, 
  Search, 
  MessageCircle, 
  Briefcase, 
  User, 
  Plus, 
  MapPin, 
  Settings, 
  Bell,
  Star,
  Calendar,
  DollarSign,
  ChevronLeft,
  LogOut
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface SidebarProps {
  userType?: 'worker' | 'contractor';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number;
  description?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userType = 'worker',
  activeTab = 'home',
  onTabChange,
  collapsed = false,
  onToggleCollapse
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const workerSections: NavSection[] = [
    {
      title: 'Principal',
      items: [
        {
          id: 'home',
          label: 'Inicio',
          icon: <Home size={20} />,
          href: '/',
          description: 'Panel principal'
        },
        {
          id: 'jobs',
          label: 'Buscar Trabajos',
          icon: <Search size={20} />,
          href: '/jobs',
          description: 'Encuentra oportunidades'
        },
        {
          id: 'nearby',
          label: 'Trabajos Cercanos',
          icon: <MapPin size={20} />,
          href: '/nearby',
          description: 'Trabajos en tu área'
        }
      ]
    },
    {
      title: 'Comunicación',
      items: [
        {
          id: 'messages',
          label: 'Mensajes',
          icon: <MessageCircle size={20} />,
          href: '/messages',
          badge: 2,
          description: 'Conversaciones activas'
        }
      ]
    },
    {
      title: 'Mi Trabajo',
      items: [
        {
          id: 'applications',
          label: 'Mis Aplicaciones',
          icon: <Briefcase size={20} />,
          href: '/applications',
          description: 'Trabajos aplicados'
        },
        {
          id: 'schedule',
          label: 'Mi Horario',
          icon: <Calendar size={20} />,
          href: '/schedule',
          description: 'Disponibilidad'
        },
        {
          id: 'earnings',
          label: 'Ganancias',
          icon: <DollarSign size={20} />,
          href: '/earnings',
          description: 'Historial de pagos'
        }
      ]
    },
    {
      title: 'Cuenta',
      items: [
        {
          id: 'profile',
          label: 'Mi Perfil',
          icon: <User size={20} />,
          href: '/profile',
          description: 'Información personal'
        },
        {
          id: 'reviews',
          label: 'Mis Reseñas',
          icon: <Star size={20} />,
          href: '/reviews',
          description: 'Calificaciones recibidas'
        },
        {
          id: 'notifications',
          label: 'Notificaciones',
          icon: <Bell size={20} />,
          href: '/notifications',
          badge: 3,
          description: 'Alertas y avisos'
        },
        {
          id: 'settings',
          label: 'Configuración',
          icon: <Settings size={20} />,
          href: '/settings',
          description: 'Preferencias'
        }
      ]
    }
  ];

  const contractorSections: NavSection[] = [
    {
      title: 'Principal',
      items: [
        {
          id: 'dashboard',
          label: 'Panel de Control',
          icon: <Home size={20} />,
          href: '/',
          description: 'Vista general'
        },
        {
          id: 'workers',
          label: 'Buscar Trabajadores',
          icon: <Search size={20} />,
          href: '/workers',
          description: 'Encuentra profesionales'
        }
      ]
    },
    {
      title: 'Trabajos',
      items: [
        {
          id: 'post-job',
          label: 'Publicar Trabajo',
          icon: <Plus size={20} />,
          href: '/jobs/new',
          description: 'Crear nueva oferta'
        },
        {
          id: 'my-jobs',
          label: 'Mis Trabajos',
          icon: <Briefcase size={20} />,
          href: '/jobs/mine',
          description: 'Gestionar ofertas'
        },
        {
          id: 'applications',
          label: 'Aplicaciones',
          icon: <Calendar size={20} />,
          href: '/applications',
          badge: 5,
          description: 'Candidatos interesados'
        }
      ]
    },
    {
      title: 'Comunicación',
      items: [
        {
          id: 'messages',
          label: 'Mensajes',
          icon: <MessageCircle size={20} />,
          href: '/messages',
          badge: 1,
          description: 'Chat con trabajadores'
        }
      ]
    },
    {
      title: 'Cuenta',
      items: [
        {
          id: 'company-profile',
          label: 'Perfil de Empresa',
          icon: <User size={20} />,
          href: '/company-profile',
          description: 'Información de la empresa'
        },
        {
          id: 'reviews',
          label: 'Mis Reseñas',
          icon: <Star size={20} />,
          href: '/reviews',
          description: 'Calificaciones recibidas'
        },
        {
          id: 'billing',
          label: 'Facturación',
          icon: <DollarSign size={20} />,
          href: '/billing',
          description: 'Pagos y facturas'
        },
        {
          id: 'settings',
          label: 'Configuración',
          icon: <Settings size={20} />,
          href: '/settings',
          description: 'Preferencias'
        }
      ]
    }
  ];

  const sections = userType === 'worker' ? workerSections : contractorSections;

  const handleTabClick = (item: NavItem) => {
    onTabChange?.(item.id);
    console.log(`Navigate to ${item.href}`);
  };

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
    onToggleCollapse?.();
  };

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
      role="navigation"
      aria-label="Navegación lateral"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">HP</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Home Depot</h2>
                <p className="text-xs text-gray-600">Paisano</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className={`p-2 ${isCollapsed ? 'mx-auto' : ''}`}
            icon={
              <ChevronLeft 
                size={16} 
                className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
              />
            }
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.title}>
                {!isCollapsed && (
                  <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {section.title}
                  </h3>
                )}
                
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = activeTab === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item)}
                        className={`
                          w-full flex items-center px-4 py-2 text-sm font-medium
                          transition-all duration-200 group
                          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset
                          ${isActive 
                            ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                        title={isCollapsed ? item.label : undefined}
                        aria-label={isCollapsed ? item.label : undefined}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <div className="relative flex items-center">
                          <div className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
                            {item.icon}
                          </div>
                          
                          {/* Badge */}
                          {item.badge && item.badge > 0 && isCollapsed && (
                            <div className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                              {item.badge > 9 ? '9+' : item.badge}
                            </div>
                          )}
                        </div>

                        {!isCollapsed && (
                          <>
                            <div className="flex-1 text-left">
                              <div className="flex items-center justify-between">
                                <span>{item.label}</span>
                                {item.badge && item.badge > 0 && (
                                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {item.badge > 9 ? '9+' : item.badge}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </>
                        )}
                        
                        {/* Hover tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="
                            absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded
                            opacity-0 invisible group-hover:opacity-100 group-hover:visible
                            transition-all duration-200 whitespace-nowrap z-50
                          ">
                            {item.label}
                            {item.badge && item.badge > 0 && (
                              <span className="ml-1 bg-red-500 text-white px-1 rounded">
                                {item.badge > 9 ? '9+' : item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4">
          {!isCollapsed ? (
            <Card className="p-3">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userType === 'worker' ? 'Juan Pérez' : 'ABC Construcciones'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userType === 'worker' ? 'Trabajador verificado' : 'Empresa verificada'}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                icon={<LogOut size={16} />}
                className="text-gray-600 hover:text-red-600"
              >
                Cerrar Sesión
              </Button>
            </Card>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary-600" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<LogOut size={16} />}
                className="p-2 text-gray-600 hover:text-red-600"
                title="Cerrar Sesión"
                aria-label="Cerrar Sesión"
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};