// src/shared/components/RoomSelector.tsx
import { MENU_ITEMS } from '@/shared/constants/menuItems';
import { useNavigate } from '@/navigation';
import { useState, useRef, useEffect } from 'react';

interface RoomSelectorProps {
  iconOnly?: boolean;
}

const RoomSelector = ({ iconOnly }: RoomSelectorProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const isSmallScreen = window.innerWidth < 768;

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <div ref={triggerRef} className="relative">
      {/* Button */}
      {iconOnly ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center shadow-xl hover:scale-110 transition"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      ) : (
        <button
    onClick={() => setIsOpen(!isOpen)}
    className="mx-auto bg-primary hover:bg-primary-focus text-primary-content rounded-full px-8 py-3 text-xl font-bold shadow-xl transition-all"
    style={{ maxWidth: 'fit-content' }}
  >
    Destiny
  </button>
      )}

      {/* Dropdown — opens UP only on mobile bottom nav */}
      {isOpen && (
        <div
          className={`
            ${isSmallScreen && iconOnly
              ? 'bottom-full mb-3 left-1/2 -translate-x-1/2'
              : 'top-full mt-3 left-0 right-0'
            }
            absolute w-40 bg-base-200 border-4 border-primary rounded-3xl shadow-2xl z-[999999] overflow-hidden
          `}
        >
          {MENU_ITEMS.map((item, i) => {
            if (item.type === 'separator') return null;
            return (
              <button
                key={i}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-6 py-1.5 text-base font-medium hover:bg-primary hover:text-primary-content transition"
          >
            {item.label}
          </button>
        );
})}
        </div>
      )}
    </div>
  );
};

export default RoomSelector;
