
import React, { useState, useEffect } from 'react';
import { Archive, CheckCircle, List, Users, StickyNote, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: '/', label: 'Demandas', icon: null },
    { path: '/geral', label: 'Geral', icon: List },
    { path: '/crm', label: 'CRM', icon: Users },
    { path: '/anotacoes', label: 'Anotações', icon: StickyNote },
    { path: '/eventos-arquivados', label: 'Arquivados', icon: Archive },
    { path: '/demandas-concluidas', label: 'Concluídas', icon: CheckCircle }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 
              className="text-lg sm:text-xl lg:text-2xl font-bold text-white cursor-pointer hover:text-teal-300 transition-all duration-200"
              onClick={() => navigate('/')}
            >
              Lon Demandas
            </h1>
            <p className="text-xs lg:text-sm text-blue-200/80 hidden sm:block">
              Bem-vindo, hoje é {formatDate(currentTime)} – {formatTime(currentTime)}
            </p>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`glass-button px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                    isActive(item.path) ? 'bg-teal-500/40 text-white' : 'text-blue-200 hover:text-white'
                  }`}
                >
                  {Icon && <Icon size={14} />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden btn-teal"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 glass rounded-lg p-3 animate-fade-in">
            <div className="flex flex-col space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`glass-button px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                      isActive(item.path) ? 'bg-teal-500/40 text-white' : 'text-blue-200 hover:text-white'
                    }`}
                  >
                    {Icon && <Icon size={14} />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
