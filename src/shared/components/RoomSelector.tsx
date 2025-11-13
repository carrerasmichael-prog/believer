import { ROOM_CONFIGS, RoomConfig } from '@/rooms/roomConfig.tsx';
import { useNavigate, useParams } from '@/navigation';
import { useState, useRef, useEffect } from 'react';

interface RoomSelectorProps {
  iconOnly?: boolean;
}

const RoomSelector = ({ iconOnly }: RoomSelectorProps) => {
  const navigate = useNavigate();
  const { roomid = 'lobby' } = useParams();
  const current = roomid.toLowerCase();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const handleSelect = (id: string) => {
    if (ROOM_CONFIGS[id]) {
      navigate(`/room/${id}`);
      setIsOpen(false);
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (
      buttonRef.current &&
      dropdownRef.current &&
      !buttonRef.current.contains(e.target as Node) &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const getDropdownPosition = () => {
    if (!buttonRef.current) return { top: '', bottom: '' };
    const rect = buttonRef.current.getBoundingClientRect();
    const isBottomNav = rect.bottom > window.innerHeight * 0.8;
    return isBottomNav
      ? { bottom: '100%', top: 'auto', margin: 'mb-2' }
      : { top: '100%', bottom: 'auto', margin: 'mt-2' };
  };

  const { top, bottom } = iconOnly ? getDropdownPosition() : { top: '100%', bottom: 'auto' };

  if (iconOnly) {
    return (
      <div className="relative pointer-events-auto z-[9999]">

        <button
          ref={buttonRef}
          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-base-300 focus:outline-none pointer-events-auto z-[1001]"
          onClick={toggleDropdown}
          aria-label="Select Room"
          aria-expanded={isOpen}
        >
          <svg className="w-6 h-6 text-base-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </button>
        {isOpen && (
          <ul
            ref={dropdownRef}
            className="absolute left-0 w-48 bg-base-200 border border-base-300 rounded-md shadow-lg z-[9999] ..."
            style={{ top, bottom }}
          >
            {/* New "Home" option */}
            <li>
              <button
                className="w-full px-4 py-2 text-left text-base-content hover:bg-base-300 focus:outline-none pointer-events-auto"
                onClick={() => {
                  navigate('/');
                  setIsOpen(false);
                }}
              >
                Home
              </button>
            </li>

            {Object.entries(ROOM_CONFIGS).map(([id, config]: [string, RoomConfig]) => (
              <li key={id}>
                <button
                  className="w-full px-4 py-2 text-left text-base-content hover:bg-base-300 focus:outline-none pointer-events-auto"
                  onClick={() => handleSelect(id)}
                >
                  {config.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="relative pointer-events-auto z-[9999]">
      <button
        ref={buttonRef}
        className="flex items-center justify-between w-full px-4 py-2 text-base-content bg-base-100 border border-base-300 rounded-md font-medium hover:bg-base-300 focus:outline-none pointer-events-auto z-[1001]"
        onClick={toggleDropdown}
        aria-label="Select Room"
        aria-expanded={isOpen}
      >
        <span>{ROOM_CONFIGS[current]?.name || 'Select Room'}</span>
        <svg className={`w-5 h-5 transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <ul
        ref={dropdownRef}
        className="absolute left-0 w-48 bg-base-200 border border-base-300 rounded-md shadow-lg z-[9999] ..."

        >
          {/* New "Home" option */}
          <li>
            <button
              className="w-full px-4 py-2 text-left text-base-content hover:bg-base-300 focus:outline-none pointer-events-auto"
              onClick={() => {
                navigate('/');
                setIsOpen(false);
              }}
            >
              Home
            </button>
          </li>

          {Object.entries(ROOM_CONFIGS).map(([id, config]: [string, RoomConfig]) => (
            <li key={id}>
              <button
                className="w-full px-4 py-2 text-left text-base-content hover:bg-base-300 focus:outline-none pointer-events-auto"
                onClick={() => handleSelect(id)}
              >
                {config.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RoomSelector;
