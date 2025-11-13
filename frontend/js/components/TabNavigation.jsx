import React, { useState } from 'react';
import { Calendar, Users, Briefcase, GraduationCap, MoreHorizontal } from 'lucide-react';

const tabs = [
  { id: 'events', label: 'События', icon: Calendar },
  { id: 'clubs', label: 'Клубы', icon: Users },
  { id: 'services', label: 'Услуги', icon: Briefcase },
  { id: 'tutoring', label: 'Репетиторство', icon: GraduationCap },
  { id: 'more', label: 'Еще', icon: MoreHorizontal, dropdown: true },
];

export default function TabNavigation({ activeTab, onTabChange }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleTabClick = (tabId) => {
    if (tabId === 'more') {
      setShowDropdown(!showDropdown);
    } else {
      setShowDropdown(false);
      onTabChange(tabId);
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-all duration-200
                  ${
                    isActive
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dropdown for "More" tab (future features) */}
        {showDropdown && (
          <div className="absolute right-4 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
            <div className="py-2">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Скоро появится...
              </button>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
