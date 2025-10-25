import { ReactNode, MouseEventHandler, useState } from "react";
import Icon from "@/shared/components/Icons/Icon";
import classNames from "classnames";
import NavLink from "./NavLink";
import Dropdown from "@/shared/components/ui/Dropdown";
import { rooms } from "@/rooms/roomlist";

interface NavItemProps {
  to: string;
  icon?: string;
  activeIcon?: string;
  inactiveIcon?: string;
  label: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children?: ReactNode;
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
  children,
  className,
  badge,
}: NavItemProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (label === "Destiny") { // Updated to match new label
      e.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      onClick?.(e);
    }
  };

  return (
    <li className="relative">
      <NavLink
        title={label}
        to={to}
        onClick={handleClick}
        className={({ isActive }) =>
          classNames(className, {
            "bg-base-100": isActive,
            "rounded-full md:aspect-square xl:aspect-auto flex md:justify-center xl:justify-start items-center": true,
          })
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              className="w-6 h-6"
              name={
                (isActive ? activeIcon : inactiveIcon) ||
                (icon ? `${icon}-${isActive ? "solid" : "outline"}` : "")
              }
            />
            <span className="inline md:hidden xl:inline">{label}</span>
            {badge && (
              <span className="absolute bottom-0 xl:bottom-auto xl:top-1/2 xl:-translate-y-1/2 xl:right-2 whitespace-nowrap text-sm">
                {badge}
              </span>
            )}
            {children}
          </>
        )}
      </NavLink>
      {label === "Destiny" && isDropdownOpen && (
        <Dropdown onClose={() => setIsDropdownOpen(false)}>
          <ul className="menu bg-base-100 rounded-box shadow-lg p-2">
            <li>
              <NavLink
                to="/"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2"
              >
                <span>Home</span>
              </NavLink>
            </li>
            {Object.entries(rooms).map(([roomKey, roomConfig]) => (
              <li key={roomKey}>
                <NavLink
                  to={roomKey === "news" ? `/rooms/${roomKey}` : `/room/${roomKey}`} // Match Apps.tsx routes
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2"
                >
                  <span>{roomConfig.name || roomKey}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </Dropdown>
      )}
    </li>
  );
};
