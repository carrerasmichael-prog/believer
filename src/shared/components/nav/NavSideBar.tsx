import { RiLoginBoxLine, RiLockLine, RiBugLine } from "@remixicon/react";
import { useRef, useMemo, useState, useEffect } from "react";
import NavLink from "./NavLink";
import { useWalletBalance } from "../../hooks/useWalletBalance";
import { NotificationNavItem } from "./NotificationNavItem";
import { SubscriptionNavItem } from "./SubscriptionNavItem";
import { MessagesNavItem } from "./MessagesNavItem";
import PublishButton from "../ui/PublishButton";
import ErrorBoundary from "../ui/ErrorBoundary";
import { formatAmount } from "@/utils/utils";
import { usePublicKey, useUserStore } from "@/stores/user";
import { useSettingsStore } from "@/stores/settings";
import { navItemsConfig } from "./navConfig";
import { UserRow } from "../user/UserRow";
import { useUIStore } from "@/stores/ui";
import { NavItem } from "./NavItem";
import { ndk } from "@/utils/ndk";
import { RelayConnectivityIndicator } from "../RelayConnectivityIndicator";
import RoomSelector from "../RoomSelector";

const useResponsive = () => {
  const [width, setWidth] = useState(1024);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return {
    isLarge: width >= 1024,
    isMedium: width >= 768 && width < 1024,
    isSmall: width < 768,
  };
};

const NavSideBar = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { setShowLoginDialog } = useUIStore();
  const { balance } = useWalletBalance();
  const myPubKey = usePublicKey();
  const nip07Login = useUserStore((state) => state.nip07Login);
  const { debug, appearance, toggleTheme } = useSettingsStore();

  const hasSigner = !!(myPubKey || nip07Login);
  const { isLarge, isMedium, isSmall } = useResponsive();

  const navItems = useMemo(() => {
    const configItems = navItemsConfig();
    return Object.values(configItems).filter((item) => {
      if (item.label === "Chats" && !hasSigner) return false;
      if (isLarge && item.includeInLargeScreen === false) return false;
      return !("requireLogin" in item) || (item.requireLogin && myPubKey);
    });
  }, [myPubKey, hasSigner, isLarge]);

  const logoUrl = CONFIG.navLogo;

  // Small Screen Bottom Nav
  if (isSmall) {
    return (
      <ErrorBoundary>
        <nav
          className="fixed bottom-0 left-0 right-0 bg-base-200 border-t border-custom z-50 flex justify-around items-center h-16 px-2"
        >
          <button
            className="flex flex-col items-center gap-1 text-xs"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            <img
              src={appearance.theme === "dark" ? "/icons/lightmode.png" : "/icons/darkmode.png"}
              alt="Toggle Theme"
              className="w-6 h-6 !block"
            />
            <span>Mode</span>
          </button>

          <div className="flex flex-col items-center gap-1">
            <RoomSelector iconOnly />
            <span className="text-xs">Destiny</span>
          </div>

          {!myPubKey ? (
            <button
              onClick={() => setShowLoginDialog(true)}
              className="flex flex-col items-center gap-1 text-xs"
            >
              <RiLoginBoxLine className="w-6 h-6 !block" />
              <span>Sign In</span>
            </button>
          ) : (
            <NavLink to="/settings" className="flex flex-col items-center gap-1 text-xs">
              <span className="ri-settings-3-line w-6 h-6 !block" />
              <span>Settings</span>
            </NavLink>
          )}

          {myPubKey && (
            <NavLink to="/profile" className="flex flex-col items-center gap-1 text-xs">
              <span className="ri-user-line w-6 h-6 !block" />
              <span>Profile</span>
            </NavLink>
          )}
        </nav>
      </ErrorBoundary>
    );
  }

  // Medium/Large Screen Sidebar
  return (
    <ErrorBoundary>
      <div
        ref={ref}
        className={`bg-base-200 hidden md:sticky md:flex top-0 select-none h-screen z-40 flex-col md:justify-between border-r border-custom overflow-y-auto scrollbar-hide pt-[env(safe-area-inset-top)] flex-shrink-0 ${
          isMedium ? "md:w-20" : "md:w-20 xl:w-64"
        }`}
      >
        <div className="flex flex-col items-start md:items-center xl:items-start gap-4 md:gap-2 xl:gap-4">
          <NavLink
            className="md:mb-2 xl:mb-0 mt-4 ml-4 md:ml-0 xl:ml-5 flex flex-row gap-2 items-center md:justify-center font-bold text-3xl"
            to="/"
          >
            <img className="w-8 h-8 !block" src={logoUrl} alt="Logo" />
            {isLarge && <span>{CONFIG.appName}</span>}
          </NavLink>

          {myPubKey && !ndk().signer && (
            <div
              title="Read-only mode"
              className="px-4 py-2 mx-2 md:mx-0 xl:mx-2 flex items-center gap-2 text-error text-xl"
            >
              <RiLockLine className="w-6 h-6 !block" />
              {isLarge && <span>Read-only mode</span>}
            </div>
          )}

          {debug.enabled && (
            <NavLink
              to="/settings/system"
              title="Debug mode active"
              className="px-4 py-2 mx-2 md:mx-0 xl:mx-2 flex items-center gap-2 text-warning text-xl hover:bg-base-300 rounded-full"
            >
              <RiBugLine className="w-6 h-6 !block" />
              {isLarge && <span>Debug mode</span>}
            </NavLink>
          )}

          <ul className="px-2 py-0 text-xl flex flex-col gap-4 md:gap-2 xl:gap-4 w-full items-center md:items-center xl:items-start">
            {navItems.map(({ to, icon, activeIcon, inactiveIcon, label, onClick }) => {
              
              if (label === "Destiny" && isMedium) {
                return (
                  <li key="destiny" className="flex flex-row items-center justify-center gap-2 pointer-events-auto">
                    <RoomSelector iconOnly />
                  </li>
                );
              }
              if (label === "Chats" && to) {
                return (
                  <li key={to} className="flex items-center">
                    <MessagesNavItem to={to} label={isLarge ? label : ""} onClick={onClick} />
                  </li>
                );
              }
              if (label === "Notifications" && to) {
                return (
                  <li key={to} className="flex items-center">
                    <NotificationNavItem to={to} onClick={onClick} />
                  </li>
                );
              }
              if (label === "Subscription" && to) {
                return (
                  <li key={to} className="flex items-center">
                    <SubscriptionNavItem to={to} onClick={onClick} />
                  </li>
                );
              }
              
              if (to) {
                return (
                  <li key={to} className="flex items-center">
                    <NavItem
                      to={to}
                      icon={icon}
                      activeIcon={activeIcon}
                      inactiveIcon={inactiveIcon}
                      label={isLarge ? (label === "Home" ? "Destiny" : label) : ""}
                      onClick={onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}
                      badge={
                        label === "Wallet" && balance !== null ? (
                          <>
                            {formatAmount(balance)}
                            <span className="text-[0.85em]">Bitcoin</span>
                          </>
                        ) : undefined
                      }
                    />
                  </li>
                );
              }
              return null;
            })}
            <li className="flex items-center">
              <button
                className="w-full px-4 py-2 text-left text-base-content hover:bg-base-300 flex items-center gap-2"
                onClick={toggleTheme}
              >
                <img
                  src={appearance.theme === "dark" ? "/icons/lightmode.png" : "/icons/darkmode.png"}
                  alt="Toggle Theme"
                  className="w-5 h-5 !block"
                />
                {isLarge && <span>Mode</span>}
              </button>
            </li>
          </ul>

          {!myPubKey && (
            <div className="ml-2 md:ml-0 xl:px-2 md:mt-2 w-full">
              <button
                className={`btn btn-primary ${
                  isMedium ? "btn-circle" : "xl:w-full xl:rounded-full"
                } text-lg signup-btn`}
                onClick={() => setShowLoginDialog(true)}
              >
                {isMedium ? <RiLoginBoxLine className="w-6 h-6 !block" /> : <span>Sign up</span>}
              </button>
            </div>
          )}

          {myPubKey && ndk().signer && <PublishButton />}
        </div>

        {myPubKey && (
          <div className="flex flex-col p-4 gap-2">
            <div className="flex justify-center md:justify-center xl:justify-start mb-2">
              <RelayConnectivityIndicator className="md:hidden xl:flex" />
              <RelayConnectivityIndicator className="hidden md:flex xl:hidden" />
            </div>
            <div className="flex-1">
              <UserRow
                pubKey={myPubKey}
                showBadge={false}
                textClassName={isLarge ? "md:hidden xl:inline font-bold" : "hidden"}
                avatarWidth={45}
              />
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default NavSideBar;

