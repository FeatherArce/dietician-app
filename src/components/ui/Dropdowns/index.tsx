
import React, { useCallback, useEffect, useRef, useState } from "react";

export interface DropdownItem {
  key?: string;
  label?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface DropdownsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  items: DropdownItem[];
  onSelect?: (key: string) => void;
  disabled?: boolean;
  trigger?: React.ReactNode;
  placement?: "bottom" | "top";
  className?: string;
}

const defaultTrigger = (
  <button className="btn m-1" type="button" aria-haspopup="listbox">
    選擇
  </button>
);

export default function Dropdowns({
  items,
  onSelect,
  disabled = false,
  trigger = defaultTrigger,
  placement = "bottom",
  className = "",
  ...props
}: DropdownsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Toggle dropdown
  const handleToggle = useCallback((event?: React.MouseEvent | Event) => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  }, [disabled]);

  // Close dropdown
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  // Outside click to close
  useEffect(() => {
    if (!isOpen) return;
    const listener = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [isOpen, handleClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!menuRef.current) return;
      const enabledItems = items.filter((item) => !item.disabled && !item.divider);
      switch (event.key) {
        case "Escape":
          handleClose();
          break;
        case "ArrowDown": {
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev + 1;
            return next >= enabledItems.length ? 0 : next;
          });
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev - 1;
            return next < 0 ? enabledItems.length - 1 : next;
          });
          break;
        }
        case "Tab":
          handleClose();
          break;
        case "Enter": {
          event.preventDefault();
          if (focusedIndex >= 0 && enabledItems[focusedIndex]) {
            const key = enabledItems[focusedIndex].key;
            if (key) {
              onSelect?.(key);
              handleClose();
            }
          }
          break;
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, focusedIndex, items, onSelect, handleClose]);

  // Focus item when index changes
  useEffect(() => {
    if (!isOpen || focusedIndex < 0 || !menuRef.current) return;
    const enabledItems = items.filter((item) => !item.disabled && !item.divider);
    const item = menuRef.current.querySelectorAll<HTMLLIElement>("li[role='option']:not(.disabled)")[focusedIndex];
    item?.focus();
  }, [focusedIndex, isOpen, items]);

  // Render menu items
  const renderMenuItems = () => {
    return items.map((item, idx) => {
      if (item.divider) {
        return <li
          key={item.key || `item-${idx}`}
          className="menu-divider my-1 h-px bg-gray-200"
          aria-hidden="true"
        />;
      }
      return (
        <li
          key={item.key || `item-${idx}`}
          role="option"
          tabIndex={item.disabled ? -1 : 0}
          aria-disabled={item.disabled}
          className={`px-2 py-1 rounded cursor-pointer select-none ${item.disabled ? "disabled text-gray-400" : "hover:bg-base-200"} ${item.danger ? "text-red-500" : ""}`}
          onClick={() => {
            if (item.disabled) return;
            if (!item.key) return;
            onSelect?.(item.key);
            handleClose();
          }}
        >
          {item.label}
        </li>
      );
    });
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block ${className}`}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      {...props}
    >
      <span
        onClick={handleToggle}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className={disabled ? "pointer-events-none opacity-50" : ""}
      >
        {trigger}
      </span>
      {isOpen && (
        <ul
          ref={menuRef}
          className={`menu dropdown-content bg-base-100 rounded-box z-10 w-52 p-2 shadow-sm absolute ${placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2"}`}
          role="listbox"
        >
          {renderMenuItems()}
        </ul>
      )}
    </div>
  );
}
