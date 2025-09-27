// =============================================================================
// ACCESSIBILITY UTILITIES
// =============================================================================

/**
 * Color contrast utilities for WCAG compliance
 */
class ColorContrast {
  /**
   * Convert hex color to RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Calculate relative luminance
   */
  static getRelativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const l1 = this.getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = this.getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if contrast ratio meets WCAG standards
   */
  static checkWCAGCompliance(
    foreground: string,
    background: string,
    level: "AA" | "AAA" = "AA",
    isLargeText: boolean = false
  ): {
    ratio: number;
    passes: boolean;
    level: "AA" | "AAA";
    minimumRatio: number;
  } {
    const ratio = this.getContrastRatio(foreground, background);

    let minimumRatio: number;
    if (level === "AAA") {
      minimumRatio = isLargeText ? 4.5 : 7;
    } else {
      minimumRatio = isLargeText ? 3 : 4.5;
    }

    return {
      ratio: Math.round(ratio * 100) / 100,
      passes: ratio >= minimumRatio,
      level,
      minimumRatio,
    };
  }

  /**
   * Suggest accessible color alternatives
   */
  static suggestAccessibleColors(
    foreground: string,
    background: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    level: "AA" | "AAA" = "AA",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isLargeText: boolean = false
  ): { lighterForeground: string; darkerForeground: string } {
    const bgRgb = this.hexToRgb(background);
    const fgRgb = this.hexToRgb(foreground);

    if (!bgRgb || !fgRgb) {
      return { lighterForeground: foreground, darkerForeground: foreground };
    }

    // Simplified suggestion - adjust lightness
    const lighterFg = this.adjustColor(foreground, 0.8);
    const darkerFg = this.adjustColor(foreground, 1.2);

    return {
      lighterForeground: lighterFg,
      darkerForeground: darkerFg,
    };
  }

  private static adjustColor(hex: string, factor: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const adjusted = {
      r: Math.min(255, Math.max(0, Math.round(rgb.r * factor))),
      g: Math.min(255, Math.max(0, Math.round(rgb.g * factor))),
      b: Math.min(255, Math.max(0, Math.round(rgb.b * factor))),
    };

    return `#${adjusted.r.toString(16).padStart(2, "0")}${adjusted.g.toString(16).padStart(2, "0")}${adjusted.b.toString(16).padStart(2, "0")}`;
  }
}

/**
 * Screen reader utilities
 */
class ScreenReaderUtils {
  /**
   * Announce message to screen readers
   */
  static announce(
    message: string,
    priority: "polite" | "assertive" = "polite",
    timeout: number = 5000
  ): void {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.setAttribute("class", "sr-only");
    announcement.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;

    document.body.appendChild(announcement);

    // Delay to ensure screen reader picks up the element
    setTimeout(() => {
      announcement.textContent = message;
    }, 100);

    // Remove after timeout
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, timeout);
  }

  /**
   * Create visually hidden but screen reader accessible text
   */
  static createScreenReaderOnly(text: string): HTMLElement {
    const element = document.createElement("span");
    element.textContent = text;
    element.className = "sr-only";
    element.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    return element;
  }

  /**
   * Check if user prefers reduced motion
   */
  static prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Check if user prefers high contrast
   */
  static prefersHighContrast(): boolean {
    return window.matchMedia("(prefers-contrast: high)").matches;
  }
}

/**
 * Focus management utilities
 */
class FocusManager {
  private static focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    "audio[controls]",
    "video[controls]",
    "iframe",
    "embed",
    "object",
    "summary",
  ].join(", ");

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: Element): HTMLElement[] {
    return Array.from(
      container.querySelectorAll<HTMLElement>(this.focusableSelectors)
    ).filter((el) => this.isElementVisible(el));
  }

  /**
   * Check if element is visible (not hidden by CSS)
   */
  static isElementVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    );
  }

  /**
   * Create focus trap for modal dialogs
   */
  static trapFocus(container: Element): () => void {
    const focusableElements = this.getFocusableElements(container);

    if (focusableElements.length === 0) return () => {};

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element initially
    firstElement.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);

    // Return cleanup function
    return () => {
      document.removeEventListener("keydown", handleTabKey);
    };
  }

  /**
   * Restore focus to previously focused element
   */
  static createFocusRestore(): {
    save: () => void;
    restore: () => void;
  } {
    let previouslyFocusedElement: HTMLElement | null = null;

    return {
      save: () => {
        previouslyFocusedElement = document.activeElement as HTMLElement;
      },
      restore: () => {
        if (
          previouslyFocusedElement &&
          this.isElementVisible(previouslyFocusedElement)
        ) {
          previouslyFocusedElement.focus();
        }
      },
    };
  }
}

/**
 * Keyboard navigation utilities
 */
class KeyboardNavigation {
  /**
   * Handle arrow key navigation for menus/lists
   */
  static createArrowNavigation(
    container: Element,
    orientation: "horizontal" | "vertical" | "both" = "vertical"
  ): () => void {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!container.contains(target)) return;

      const focusableElements = FocusManager.getFocusableElements(container);
      const currentIndex = focusableElements.indexOf(target);

      if (currentIndex === -1) return;

      let nextIndex: number | null = null;

      switch (e.key) {
        case "ArrowDown":
          if (orientation === "vertical" || orientation === "both") {
            e.preventDefault();
            nextIndex = (currentIndex + 1) % focusableElements.length;
          }
          break;
        case "ArrowUp":
          if (orientation === "vertical" || orientation === "both") {
            e.preventDefault();
            nextIndex =
              currentIndex === 0
                ? focusableElements.length - 1
                : currentIndex - 1;
          }
          break;
        case "ArrowRight":
          if (orientation === "horizontal" || orientation === "both") {
            e.preventDefault();
            nextIndex = (currentIndex + 1) % focusableElements.length;
          }
          break;
        case "ArrowLeft":
          if (orientation === "horizontal" || orientation === "both") {
            e.preventDefault();
            nextIndex =
              currentIndex === 0
                ? focusableElements.length - 1
                : currentIndex - 1;
          }
          break;
        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          nextIndex = focusableElements.length - 1;
          break;
      }

      if (nextIndex !== null && focusableElements[nextIndex]) {
        focusableElements[nextIndex].focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }

  /**
   * Create keyboard shortcuts handler
   */
  static createShortcuts(shortcuts: Record<string, () => void>): () => void {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = this.getShortcutKey(e);
      const handler = shortcuts[key];

      if (handler) {
        e.preventDefault();
        handler();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }

  private static getShortcutKey(e: KeyboardEvent): string {
    const parts = [];

    if (e.ctrlKey || e.metaKey) parts.push("ctrl");
    if (e.altKey) parts.push("alt");
    if (e.shiftKey) parts.push("shift");

    parts.push(e.key.toLowerCase());

    return parts.join("+");
  }
}

/**
 * ARIA utilities
 */
class ARIAUtils {
  /**
   * Generate unique ID for ARIA relationships
   */
  static generateId(prefix: string = "aria"): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set up ARIA live region
   */
  static createLiveRegion(
    priority: "polite" | "assertive" = "polite",
    atomic: boolean = true
  ): {
    element: HTMLElement;
    announce: (message: string) => void;
    destroy: () => void;
  } {
    const element = document.createElement("div");
    element.setAttribute("aria-live", priority);
    element.setAttribute("aria-atomic", atomic.toString());
    element.className = "sr-only";
    element.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;

    document.body.appendChild(element);

    return {
      element,
      announce: (message: string) => {
        element.textContent = message;
        // Clear after announcement
        setTimeout(() => {
          element.textContent = "";
        }, 1000);
      },
      destroy: () => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      },
    };
  }

  /**
   * Set up ARIA describedby relationships
   */
  static linkDescription(element: Element, descriptionElement: Element): void {
    const descId = descriptionElement.id || this.generateId("desc");
    if (!descriptionElement.id) {
      descriptionElement.id = descId;
    }

    const existingDescribedBy = element.getAttribute("aria-describedby");
    const describedBy = existingDescribedBy
      ? `${existingDescribedBy} ${descId}`
      : descId;

    element.setAttribute("aria-describedby", describedBy);
  }

  /**
   * Set up ARIA labelledby relationships
   */
  static linkLabel(element: Element, labelElement: Element): void {
    const labelId = labelElement.id || this.generateId("label");
    if (!labelElement.id) {
      labelElement.id = labelId;
    }

    element.setAttribute("aria-labelledby", labelId);
  }

  /**
   * Check if element has accessible name
   */
  static hasAccessibleName(element: Element): boolean {
    return !!(
      element.getAttribute("aria-label") ||
      element.getAttribute("aria-labelledby") ||
      (element as HTMLElement).title ||
      (element.tagName.toLowerCase() === "img" &&
        element.getAttribute("alt")) ||
      (element as HTMLInputElement).labels?.length ||
      element.textContent?.trim()
    );
  }
}

/**
 * Accessibility testing utilities
 */
class A11yTester {
  /**
   * Run basic accessibility checks on an element
   */
  static runBasicChecks(element: Element): {
    issues: Array<{
      type: "error" | "warning";
      message: string;
      element: Element;
    }>;
    score: number;
  } {
    const issues: Array<{
      type: "error" | "warning";
      message: string;
      element: Element;
    }> = [];

    // Check for missing alt text on images
    const images = element.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.hasAttribute("alt")) {
        issues.push({
          type: "error",
          message: "Image missing alt attribute",
          element: img,
        });
      }
    });

    // Check for missing labels on form inputs
    const inputs = element.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      if (!ARIAUtils.hasAccessibleName(input)) {
        issues.push({
          type: "error",
          message: "Form control missing accessible name",
          element: input,
        });
      }
    });

    // Check for missing headings hierarchy
    const headings = Array.from(
      element.querySelectorAll("h1, h2, h3, h4, h5, h6")
    );
    if (headings.length > 0) {
      let previousLevel = 0;
      headings.forEach((heading) => {
        const currentLevel = parseInt(heading.tagName.charAt(1));
        if (currentLevel > previousLevel + 1) {
          issues.push({
            type: "warning",
            message: `Heading level jumps from h${previousLevel} to h${currentLevel}`,
            element: heading,
          });
        }
        previousLevel = currentLevel;
      });
    }

    // Check for low contrast
    const textElements = element.querySelectorAll("*");
    textElements.forEach((el) => {
      if (el.textContent?.trim()) {
        const styles = window.getComputedStyle(el as HTMLElement);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;

        if (
          color !== "rgba(0, 0, 0, 0)" &&
          backgroundColor !== "rgba(0, 0, 0, 0)"
        ) {
          // This is a simplified check - in reality, you'd need to handle
          // computed colors, gradients, images, etc.
          // For now, we'll skip this complex check
        }
      }
    });

    // Calculate score based on issues
    const errorCount = issues.filter((issue) => issue.type === "error").length;
    const warningCount = issues.filter(
      (issue) => issue.type === "warning"
    ).length;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const totalElements = element.querySelectorAll("*").length;

    const score = Math.max(0, 100 - (errorCount * 10 + warningCount * 5));

    return { issues, score };
  }

  /**
   * Generate accessibility report
   */
  static generateReport(element: Element): string {
    const { issues, score } = this.runBasicChecks(element);

    let report = `Accessibility Report\n`;
    report += `Score: ${score}/100\n\n`;

    if (issues.length === 0) {
      report += "No issues found!\n";
    } else {
      report += `Found ${issues.length} issues:\n\n`;

      issues.forEach((issue, index) => {
        report += `${index + 1}. [${issue.type.toUpperCase()}] ${issue.message}\n`;
        report += `   Element: ${issue.element.tagName.toLowerCase()}`;
        if (issue.element.id) report += `#${issue.element.id}`;
        if (issue.element.className)
          report += `.${issue.element.className.split(" ").join(".")}`;
        report += "\n\n";
      });
    }

    return report;
  }
}

/**
 * Export all utilities
 */
export {
  ColorContrast,
  ScreenReaderUtils,
  FocusManager,
  KeyboardNavigation,
  ARIAUtils,
  A11yTester,
};

/**
 * Initialize accessibility features
 */
export function initializeA11y(): void {
  // Add reduced motion class if user prefers it
  if (ScreenReaderUtils.prefersReducedMotion()) {
    document.documentElement.classList.add("reduce-motion");
  }

  // Add high contrast class if user prefers it
  if (ScreenReaderUtils.prefersHighContrast()) {
    document.documentElement.classList.add("high-contrast");
  }

  // Listen for preference changes
  window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .addEventListener("change", (e) => {
      if (e.matches) {
        document.documentElement.classList.add("reduce-motion");
      } else {
        document.documentElement.classList.remove("reduce-motion");
      }
    });

  window
    .matchMedia("(prefers-contrast: high)")
    .addEventListener("change", (e) => {
      if (e.matches) {
        document.documentElement.classList.add("high-contrast");
      } else {
        document.documentElement.classList.remove("high-contrast");
      }
    });

  // Add skip link styles if not already present
  if (!document.querySelector("#skip-link-styles")) {
    const style = document.createElement("style");
    style.id = "skip-link-styles";
    style.textContent = `
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        z-index: 9999;
        border-radius: 4px;
      }
      .skip-link:focus {
        top: 6px;
      }
    `;
    document.head.appendChild(style);
  }
}

// Auto-initialize if in browser environment
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeA11y);
  } else {
    initializeA11y();
  }
}
