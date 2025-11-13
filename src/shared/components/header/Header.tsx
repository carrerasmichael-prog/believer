// src/shared/components/header/Header.tsx
import { ReactNode, useRef } from "react";
import { useScrollableParent } from "@/shared/hooks/useScrollableParent";
import NotificationButton from "./NotificationButton";
import UnseenMessagesBadge from "@/shared/components/messages/UnseenMessagesBadge";
import Icon from "@/shared/components/Icons/Icon";
import { useUserStore } from "@/stores/user";
import { useLocation, useNavigate } from "@/navigation";
import { useUIStore } from "@/stores/ui";
import classNames from "classnames";
import { useHeaderScroll } from "./useHeaderScroll";
import { useHeaderClick } from "./useHeaderClick";
import { RelayConnectivityIndicator } from "../RelayConnectivityIndicator";
import RoomSelector from '@/shared/components/RoomSelector';
import { HeaderNavigation } from './HeaderNavigation'; // Fixed import

interface HeaderProps {
  children?: ReactNode;
  title?: string;
  rightContent?: ReactNode;
  showBack?: boolean;
  showNotifications?: boolean;
  scrollDown?: boolean;
  slideUp?: boolean;
  bold?: boolean;
}

const Header = ({
  rightContent,
  showBack = true,
  showNotifications = false,
  scrollDown = false,
  slideUp = true,
}: HeaderProps) => {
  const { setShowLoginDialog } = useUIStore();
  const myPubKey = useUserStore((state) => state.publicKey);
  const location = useLocation();
  const navigate = useNavigate();

  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { scrollContainer, findScrollableParent } = useScrollableParent(headerRef);

  useHeaderScroll({
    slideUp,
    headerRef,
    contentRef,
    pathname: location.pathname,
  });

  const handleHeaderClick = useHeaderClick({
    headerRef,
    scrollContainer,
    findScrollableParent,
    scrollDown,
  });

  const leftButton = showBack ? <HeaderNavigation showBack={showBack} /> : null;

  return (
    <header
      ref={headerRef}
      onClick={handleHeaderClick}
      style={slideUp ? { transform: "translateY(0px)" } : undefined}
      className={classNames(
        "pt-[env(safe-area-inset-top)] min-h-16 flex top-0 bg-base-200 md:bg-opacity-80 md:backdrop-blur-sm text-base-content px-2 z-30 select-none w-full cursor-pointer",
        "fixed md:sticky"
      )}
    >
      <div
        ref={contentRef}
        className="flex justify-between items-center flex-1 w-full py-2"
      >
        <div className="flex items-center gap-2 flex-1">
          {leftButton}
          <div className="flex-1 flex justify-center">
            <div className="relative z-[1000] w-full max-w-xs">
              <RoomSelector />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mr-2 flex-shrink-0">
          <div className="md:hidden">
            <RelayConnectivityIndicator />
          </div>
          {rightContent}
          {myPubKey && (
            <>
              {location.pathname === "/" && (
                <button
                  onClick={() => navigate("/chats")}
                  className="md:hidden btn btn-ghost btn-circle relative"
                  title="Messages"
                >
                  <span className="indicator">
                    <UnseenMessagesBadge />
                    <Icon
                      className="w-6 h-6"
                      name={
                        location.pathname.startsWith("/chats")
                          ? "mail-solid"
                          : "mail-outline"
                      }
                    />
                  </span>
                </button>
              )}
              {showNotifications && (
                <div className="md:hidden ml-2">
                  <NotificationButton />
                </div>
              )}
            </>
          )}
          {!myPubKey && (
            <button
              className="md:hidden btn btn-sm btn-primary whitespace-nowrap"
              onClick={() => setShowLoginDialog(true)}
            >
              Sign up
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
