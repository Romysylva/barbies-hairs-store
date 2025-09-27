/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  FocusManager,
  KeyboardNavigation,
  ARIAUtils,
  ScreenReaderUtils,
} from "@/lib/accessibility";

// =============================================================================
// SKIP LINKS COMPONENT
// =============================================================================

interface SkipLink {
  id: string;
  label: string;
  target: string;
}

interface SkipLinksProps {
  links: SkipLink[];
  className?: string;
}

const SkipLinks: React.FC<SkipLinksProps> = ({ links, className }) => {
  const handleSkipClick = (targetId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
      ScreenReaderUtils.announce(
        `Skipped to ${target.textContent || targetId}`,
        "polite"
      );
    }
  };

  if (links.length === 0) return null;

  return (
    <div className={cn("sr-only focus-within:not-sr-only", className)}>
      <nav
        className="fixed top-4 left-4 z-[9999] bg-primary text-primary-foreground p-2 rounded-md shadow-lg"
        role="navigation"
        aria-label="Skip navigation"
      >
        <ul className="flex flex-col gap-1">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.target}`}
                onClick={(e) => handleSkipClick(link.target, e)}
                className={cn(
                  "block px-3 py-2 text-sm font-medium rounded",
                  "hover:bg-primary/90 focus:bg-primary/90",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "transition-colors duration-200"
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

// =============================================================================
// FOCUS TRAP COMPONENT
// =============================================================================

interface FocusTrapProps {
  children: React.ReactNode;
  enabled?: boolean;
  restoreFocus?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  className?: string;
}

const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  enabled = true,
  restoreFocus = true,
  initialFocus,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Save previously focused element
    if (restoreFocus) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
    }

    // Set initial focus
    if (initialFocus?.current) {
      initialFocus.current.focus();
    } else {
      const firstFocusable = FocusManager.getFocusableElements(
        containerRef.current
      )[0];
      firstFocusable?.focus();
    }

    // Set up focus trap
    const cleanup = FocusManager.trapFocus(containerRef.current);

    return () => {
      cleanup();

      // Restore focus
      if (restoreFocus && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [enabled, initialFocus, restoreFocus]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// =============================================================================
// ROVING TAB INDEX (FOR TOOLBARS, MENUS, etc.)
// =============================================================================

interface RovingTabIndexProps {
  children: React.ReactElement[];
  orientation?: "horizontal" | "vertical" | "both";
  loop?: boolean;
  className?: string;
  onSelectionChange?: (index: number) => void;
}

const RovingTabIndex: React.FC<RovingTabIndexProps> = ({
  children,
  orientation = "horizontal",
  loop = true,
  className,
  onSelectionChange,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cleanup = KeyboardNavigation.createArrowNavigation(
      containerRef.current,
      orientation
    );

    return cleanup;
  }, [orientation]);

  useEffect(() => {
    onSelectionChange?.(activeIndex);
  }, [activeIndex, onSelectionChange]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = activeIndex;

    switch (e.key) {
      case "ArrowDown":
        if (orientation === "vertical" || orientation === "both") {
          e.preventDefault();
          newIndex = loop
            ? (index + 1) % children.length
            : Math.min(index + 1, children.length - 1);
        }
        break;
      case "ArrowUp":
        if (orientation === "vertical" || orientation === "both") {
          e.preventDefault();
          newIndex = loop
            ? (index - 1 + children.length) % children.length
            : Math.max(index - 1, 0);
        }
        break;
      case "ArrowRight":
        if (orientation === "horizontal" || orientation === "both") {
          e.preventDefault();
          newIndex = loop
            ? (index + 1) % children.length
            : Math.min(index + 1, children.length - 1);
        }
        break;
      case "ArrowLeft":
        if (orientation === "horizontal" || orientation === "both") {
          e.preventDefault();
          newIndex = loop
            ? (index - 1 + children.length) % children.length
            : Math.max(index - 1, 0);
        }
        break;
      case "Home":
        e.preventDefault();
        newIndex = 0;
        break;
      case "End":
        e.preventDefault();
        newIndex = children.length - 1;
        break;
    }

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div ref={containerRef} className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        return React.cloneElement(child as React.ReactElement<any>, {
          tabIndex: index === activeIndex ? 0 : -1,
          onFocus: () => setActiveIndex(index),
          onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
            handleKeyDown(e, index);
            (
              child.props as {
                onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
              }
            ).onKeyDown?.(e);
          },
        });
      })}
    </div>
  );
};

// =============================================================================
// KEYBOARD SHORTCUTS PROVIDER
// =============================================================================

interface KeyboardShortcut {
  keys: string;
  description: string;
  action: () => void;
  enabled?: boolean;
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  children: React.ReactNode;
  showHelp?: boolean;
}

const KeyboardShortcutsProvider: React.FC<KeyboardShortcutsProps> = ({
  shortcuts,
  children,
  showHelp = false,
}) => {
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  useEffect(() => {
    const shortcutMap = shortcuts.reduce(
      (acc, shortcut) => {
        if (shortcut.enabled !== false) {
          acc[shortcut.keys] = shortcut.action;
        }
        return acc;
      },
      {} as Record<string, () => void>
    );

    // Add help shortcut
    shortcutMap["ctrl+/"] = () => setShowHelpDialog(true);
    shortcutMap["?"] = () => setShowHelpDialog(true);

    const cleanup = KeyboardNavigation.createShortcuts(shortcutMap);

    return cleanup;
  }, [shortcuts]);

  return (
    <>
      {children}

      {/* Help Dialog */}
      {showHelp && showHelpDialog && (
        <FocusTrap enabled={showHelpDialog}>
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
          >
            <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 id="shortcuts-title" className="text-lg font-semibold">
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setShowHelpDialog(false)}
                  className="text-muted-foreground hover:text-foreground focus-visible-ring rounded p-1"
                  aria-label="Close shortcuts help"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {shortcuts
                  .filter((s) => s.enabled !== false)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 bg-muted text-xs font-mono rounded">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    Show this help
                  </span>
                  <kbd className="px-2 py-1 bg-muted text-xs font-mono rounded">
                    Ctrl+/
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </FocusTrap>
      )}
    </>
  );
};

// =============================================================================
// LIVE REGION FOR ANNOUNCEMENTS
// =============================================================================

interface LiveRegionProps {
  priority?: "polite" | "assertive";
  atomic?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const LiveRegion: React.FC<LiveRegionProps> = ({
  priority = "polite",
  atomic = true,
  children,
  className,
}) => {
  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  );
};

// =============================================================================
// ACCESSIBLE MODAL WITH FULL KEYBOARD SUPPORT
// =============================================================================

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  initialFocus?: React.RefObject<HTMLElement>;
  className?: string;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
}

const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  initialFocus,
  className,
  closeOnEscape = true,
  closeOnOverlayClick = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = ARIAUtils.generateId("modal-title");
  const descId = description ? ARIAUtils.generateId("modal-desc") : undefined;

  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <FocusTrap enabled={isOpen} initialFocus={initialFocus}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            ref={modalRef}
            className={cn(
              "bg-card border border-border rounded-lg shadow-xl max-w-md w-full",
              "animate-fade-in",
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground focus-visible-ring rounded p-1"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Description */}
            {description && (
              <div
                id={descId}
                className="px-6 pt-4 text-sm text-muted-foreground"
              >
                {description}
              </div>
            )}

            {/* Content */}
            <div className="p-6">{children}</div>
          </div>
        </div>
      </FocusTrap>
    </>
  );
};

// =============================================================================
// ACCESSIBLE TABS WITH KEYBOARD NAVIGATION
// =============================================================================

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccessibleTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

const AccessibleTabs: React.FC<AccessibleTabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  orientation = "horizontal",
  className,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tabListId = ARIAUtils.generateId("tablist");

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab List */}
      <RovingTabIndex
        orientation={orientation}
        className={cn(
          "flex border-b border-border",
          orientation === "vertical" && "flex-col border-b-0 border-r"
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeTab}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              "hover:text-foreground focus-visible-ring",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              tab.id === activeTab
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground",
              orientation === "vertical" && "border-b-0 border-r-2",
              orientation === "vertical" &&
                tab.id === activeTab &&
                "border-r-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </RovingTabIndex>

      {/* Tab Panel */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
        className="p-4 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {activeTabContent}
      </div>
    </div>
  );
};

// =============================================================================
// SAMPLE DATA AND USAGE
// =============================================================================

export const sampleSkipLinks: SkipLink[] = [
  { id: "skip-nav", label: "Skip to main navigation", target: "main-nav" },
  { id: "skip-content", label: "Skip to main content", target: "main-content" },
  { id: "skip-footer", label: "Skip to footer", target: "footer" },
];

export const sampleShortcuts: KeyboardShortcut[] = [
  {
    keys: "ctrl+k",
    description: "Open search",
    action: () => console.log("Search opened"),
  },
  {
    keys: "ctrl+shift+p",
    description: "Open command palette",
    action: () => console.log("Command palette opened"),
  },
  {
    keys: "g h",
    description: "Go to home",
    action: () => console.log("Navigate to home"),
  },
  {
    keys: "esc",
    description: "Close modal/dialog",
    action: () => console.log("Close modal"),
  },
];

// =============================================================================
// EXPORTS
// =============================================================================

export {
  SkipLinks,
  FocusTrap,
  RovingTabIndex,
  KeyboardShortcutsProvider,
  LiveRegion,
  AccessibleModal,
  AccessibleTabs,
};

export type {
  SkipLink,
  SkipLinksProps,
  FocusTrapProps,
  RovingTabIndexProps,
  KeyboardShortcut,
  KeyboardShortcutsProps,
  LiveRegionProps,
  AccessibleModalProps,
  TabItem,
  AccessibleTabsProps,
};
