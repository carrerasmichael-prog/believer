// src/shared/components/nav/NavItem.tsx
import { ReactNode, MouseEventHandler } from 'react';
import Icon from '@/shared/components/Icons/Icon';
import classNames from 'classnames';
import NavLink from './NavLink';

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
  return (
    <li>
      <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
          classNames(
            'w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition',
            {
              'bg-base-300': isActive,
              'hover:bg-base-300': !isActive,
            },
            className
          )
        }
      >
        {({ isActive }) => (
          <>
            {icon && (
              <Icon
                className="w-6 h-6 !block !text-base-content"
                name={isActive ? activeIcon || `${icon}-fill` : inactiveIcon || `${icon}-line`}
              />
            )}
            <span className="font-medium">{label}</span>
            {badge && (
              <span className="ml-auto text-xs bg-primary text-white px-2 py-1 rounded-full">
                {badge}
              </span>
            )}
          </>
        )}
      </NavLink>
    </li>
  );
};