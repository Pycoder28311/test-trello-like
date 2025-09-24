'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
  children?: SidebarItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const navigation: SidebarItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: '📁',
      children: [
        { name: 'All Projects', href: '/projects', icon: '📂' },
        { name: 'Create New', href: '/projects/new', icon: '🆕' },
        { name: 'Templates', href: '/projects/templates', icon: '📋' },
      ],
    },
    {
      name: 'Team',
      href: '/team',
      icon: '👥',
      children: [
        { name: 'Members', href: '/team/members', icon: '👤' },
        { name: 'Roles', href: '/team/roles', icon: '🎭' },
        { name: 'Permissions', href: '/team/permissions', icon: '🔐' },
      ],
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: '📈',
      children: [
        { name: 'Overview', href: '/analytics', icon: '👁️' },
        { name: 'Reports', href: '/analytics/reports', icon: '📄' },
        { name: 'Export Data', href: '/analytics/export', icon: '💾' },
      ],
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: '⚙️',
      children: [
        { name: 'Profile', href: '/settings/profile', icon: '👤' },
        { name: 'Account', href: '/settings/account', icon: '🔧' },
        { name: 'Billing', href: '/settings/billing', icon: '💳' },
        { name: 'Notifications', href: '/settings/notifications', icon: '🔔' },
      ],
    },
    {
      name: 'Help & Support',
      href: '/support',
      icon: '❓',
      children: [
        { name: 'Documentation', href: '/support/docs', icon: '📚' },
        { name: 'Contact Us', href: '/support/contact', icon: '📞' },
        { name: 'Feedback', href: '/support/feedback', icon: '💬' },
      ],
    },
  ];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const hasActiveChild = (item: SidebarItem): boolean => {
    if (item.children) {
      return item.children.some(child => isActive(child.href));
    }
    return false;
  };

  // Close sidebar when route changes on mobile
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static top-0 left-0 h-full w-64 bg-gray-900 text-white 
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white">L</span>
              </div>
              <span className="text-xl font-bold">Logo</span>
            </Link>
            <button 
              onClick={onClose}
              className="md:hidden p-1 rounded hover:bg-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-lg
                        transition-colors duration-200
                        ${hasActiveChild(item) 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          expandedItems.has(item.name) ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedItems.has(item.name) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`
                              flex items-center space-x-3 px-3 py-2 rounded-lg text-sm
                              transition-colors duration-200
                              ${isActive(child.href)
                                ? 'bg-blue-700 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                              }
                            `}
                          >
                            <span>{child.icon}</span>
                            <span>{child.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg
                      transition-colors duration-200
                      ${isActive(item.href)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="font-bold text-white">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-gray-400 truncate">admin@example.com</p>
            </div>
            <button className="p-1 rounded hover:bg-gray-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;