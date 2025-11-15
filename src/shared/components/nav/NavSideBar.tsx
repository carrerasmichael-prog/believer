// src/shared/components/nav/NavSideBar.tsx
import { RiLoginBoxLine, RiLockLine, RiBugLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import NavLink from "./NavLink";
import PublishButton from "../ui/PublishButton";
import ErrorBoundary from "../ui/ErrorBoundary";
import { usePublicKey } from "@/stores/user";
import { useSettingsStore } from "@/stores/settings";
import { UserRow } from "../user/UserRow";
import { useUIStore } from "@/stores/ui";
import { ndk } from "@/utils/ndk";
import { RelayConnectivityIndicator } from "../RelayConnectivityIndicator";
import RoomSelector from "../RoomSelector";

const useResponsive = () => {
  const [width, setWidth] = useState(1024);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return {
    isLarge: width >= 1200,
    isSmall: width < 768,
  };
};

const NavSideBar = () => {
  const { setShowLoginDialog } = useUIStore();
  const myPubKey = usePublicKey();
  const { debug, appearance, toggleTheme } = useSettingsStore();
  const { isLarge, isSmall } = useResponsive();

  const logoUrl = CONFIG.navLogo;

  // Mobile: Bottom Nav
  if (isSmall) {
    return (
      <ErrorBoundary>
        <nav className="fixed bottom-0 left-0 right-0 bg-base-200 border-t border-custom z-50 flex justify-around items-center h-16 px-2">
          <button className="flex flex-col items-center gap-1 text-xs" onClick={toggleTheme}>
            <img
              src={appearance.theme === "dark" ? "/icons/lightmode.png" : "/icons/darkmode.png"}
              alt="Mode"
              className="w-6 h-6"
            />
            <span>Mode</span>
          </button>

          <div className="flex flex-col items-center gap-1">
            <RoomSelector iconOnly />
            <span className="text-xs">Destiny</span>
          </div>

          {!myPubKey ? (
            <button onClick={() => setShowLoginDialog(true)} className="flex flex-col items-center gap-1 text-xs">
              <RiLoginBoxLine className="w-6 h-6" />
              <span>Sign In</span>
            </button>
          ) : (
            <NavLink to="/settings" className="flex flex-col items-center gap-1 text-xs">
              <span className="ri-settings-3-line w-6 h-6" />
              <span>Settings</span>
            </NavLink>
          )}

          {myPubKey && (
            <NavLink to="/profile" className="flex flex-col items-center gap-1 text-xs">
              <span className="ri-user-line w-6 h-6" />
              <span>Profile</span>
            </NavLink>
          )}
        </nav>
      </ErrorBoundary>
    );
  }

  // Desktop: Sidebar (Medium + Large)
  return (
    <ErrorBoundary>
      <div className="bg-base-200 hidden md:flex md:sticky top-0 h-screen z-[9999] flex-col justify-between border-r border-custom overflow-y-visible scrollbar-hide pt-[env(safe-area-inset-top)] flex-shrink-0 md:w-20 xl:w-64">
        <div className="flex flex-col gap-6 p-4">
          <NavLink to="/" className="flex items-center gap-3 text-3xl font-bold mt-4">
            <img src={logoUrl} alt="Logo" className="w-10 h-10" />
            {isLarge && <span>{CONFIG.appName}</span>}
          </NavLink>

          {myPubKey && !ndk().signer && (
            <div className="text-error flex items-center gap-2">
              <RiLockLine className="w-6 h-6" />
              {isLarge && <span>Read-only</span>}
            </div>
          )}

          {debug.enabled && (
            <div className="text-warning flex items-center gap-2">
              <RiBugLine className="w-6 h-6" />
              {isLarge && <span>Debug</span>}
            </div>
          )}

          {/* Room Selector: Icon on Medium, Full on Large */}
          <RoomSelector iconOnly={!isLarge} />

          <button onClick={toggleTheme} className="flex items-center gap-3 p-3 hover:bg-base-300 rounded-lg">
            <img
              src={appearance.theme === "dark" ? "/icons/lightmode.png" : "/icons/darkmode.png"}
              alt="Mode"
              className="w-6 h-6"
            />
            {isLarge && <span>Mode</span>}
          </button>
        </div>

        {/* Sign Up Button: Icon on Medium, Compact Pill on Large */}
        {!myPubKey && !isSmall && (
          <div className="p-4 border-t border-base-300">
            <button
              onClick={() => setShowLoginDialog(true)}
              className={`
                flex items-center justify-center gap-2 transition-all
                ${isLarge
                  ? 'w-auto justify-start btn btn-primary px-8 py-3 text-base font-bold rounded-full shadow-xl'
                  : 'w-full p-3 hover:bg-base-300 rounded-lg'
                }
              `}
            >
              <RiLoginBoxLine className="w-6 h-6" />
              {isLarge && <span>Sign up</span>}
            </button>
          </div>
        )}

        {/* Publish Button (Logged In) */}
        {myPubKey && ndk().signer && (
          <div className="p-4 border-t border-base-300">
            <PublishButton />
          </div>
        )}

        {/* User Row (Logged In) */}
        {myPubKey && (
          <div className="p-4 border-t border-base-300">
            <RelayConnectivityIndicator className="mb-3" />
            <UserRow pubKey={myPubKey} showBadge={false} avatarWidth={45} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default NavSideBar;