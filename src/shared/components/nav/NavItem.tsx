// src/shared/components/nav/NavItem.tsx
import { ReactNode, MouseEventHandler, useState } from 'react';
import Icon from '@/shared/components/Icons/Icon';
import classNames from 'classnames';
import NavLink from './NavLink';
import Dropdown from '@/shared/components/ui/Dropdown';
import { ROOM_CONFIGS } from '@/rooms/roomConfig';
import { useLocation } from '@/navigation';

interface NavItemProps {
  to: string;
  icon?: string;
  activeIcon?: string;
  inactiveIcon?: string;
  label: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  className?: string;
  badge?: ReactNode;
}

export const NavItem = ({
  to,
  icon,
  activeIcon,
  inactiveIcon,
  label,
  onClick,
  className,
  badge,
}: NavItemProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const handleClick: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> = (e) => {
    if (label === 'Destiny') {
      e.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
      console.log('Destiny button clicked, isDropdownOpen:', isDropdownOpen); // Debug
      return;
    }
    onClick?.(e as React.MouseEvent<HTMLAnchorElement>);
  };

  const isDestiny = label === 'Destiny';

  return (
    <li className="relative">
      {isDestiny ? (
        <button
          onClick={handleClick}
          className={classNames(
            'w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition',
            {
              'bg-base-200': isDropdownOpen,
              'hover:bg-base-200': !isDropdownOpen,
            },
            className
          )}
          title={label}
        >
          <Icon
            className="w-6 h-6 !block !text-base-content"
            name={icon || 'ri-map-pin-line'}
          />
          <span className="font-medium">{label}</span>
          {badge && (
            <span className="ml-auto text-xs bg-primary text-white px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </button>
      ) : (
        <NavLink
          to={to}
          onClick={handleClick}
          className={({ isActive }) =>
            classNames(
              'w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition',
              {
                'bg-base-200': isActive,
                'hover:bg-base-200': !isActive,
              },
              className
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                className="w-6 h-6 !block !text-base-content"
                name={isActive ? activeIcon || `${icon}-fill` : inactiveIcon || `${icon}-line`}
              />
              <span className="font-medium">{label}</span>
              {badge && (
                <span className="ml-auto text-xs bg-primary text-white px-2 py-1 rounded-full">
                  {badge}
                </span>
              )}
            </>
          )}
        </NavLink>
      )}

      {isDestiny && isDropdownOpen && (
        <Dropdown onClose={() => setIsDropdownOpen(false)}>
          <div className="bg-base-100 rounded-box shadow-lg p-3 min-w-[200px] mt-1">
            <ul className="space-y-1">
              <li>
                <NavLink
                  to="/"
                  onClick={() => setIsDropdownOpen(false)}
                  className={classNames(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition',
                    {
                      'bg-primary text-white': location.pathname === '/',
                      'hover:bg-base-200': location.pathname !== '/',
                    }
                  )}
                >
                  <Icon name="ri-home-line" className="w-5 h-5 !block !text-base-content" />
                  <span>Home</span>
                </NavLink>
              </li>
              {Object.entries(ROOM_CONFIGS).map(([id, config]) => {
                const isActive = location.pathname === `/room/${id}`;
                return (
                  <li key={id}>
                    <NavLink
                      to={`/room/${id}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className={classNames(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition',
                        {
                          'bg-primary text-white': isActive,
                          'hover:bg-base-200': !isActive,
                        }
                      )}
                    >
                      <img
                        src={`/icons/${id}.png`}
                        alt=""
                        className="w-5 h-5 !block"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span>{config.name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        </Dropdown>
      )}
    </li>
  );
};