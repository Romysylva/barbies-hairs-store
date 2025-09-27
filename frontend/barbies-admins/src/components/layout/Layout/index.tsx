import React from "react";
import { cn } from "@/lib/utils";

// =============================================================================
// CONTAINER COMPONENT
// =============================================================================

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  center?: boolean;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      className,
      maxWidth = "xl",
      padding = "md",
      center = true,
      children,
      ...props
    },
    ref
  ) => {
    const maxWidthClasses = {
      sm: "max-w-screen-sm",
      md: "max-w-screen-md",
      lg: "max-w-screen-lg",
      xl: "max-w-screen-xl",
      "2xl": "max-w-screen-2xl",
      full: "max-w-full",
    };

    const paddingClasses = {
      none: "",
      sm: "px-4",
      md: "px-4 sm:px-6 lg:px-8",
      lg: "px-6 sm:px-8 lg:px-12",
      xl: "px-8 sm:px-12 lg:px-16",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full",
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          center && "mx-auto",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

// =============================================================================
// RESPONSIVE GRID COMPONENT
// =============================================================================

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    default?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  };
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  autoRows?: "auto" | "min" | "max" | "fr";
  center?: boolean;
  equalHeight?: boolean;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      className,
      cols = { default: 1, sm: 2, md: 3 },
      gap = "md",
      autoRows = "auto",
      center = false,
      equalHeight = false,
      children,
      ...props
    },
    ref
  ) => {
    const gapClasses = {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      "2xl": "gap-12",
    };

    const autoRowsClasses = {
      auto: "grid-rows-auto",
      min: "grid-rows-min",
      max: "grid-rows-max",
      fr: "grid-rows-1fr",
    };

    const getColsClass = () => {
      const classes = [];
      if (cols.default) classes.push(`grid-cols-${cols.default}`);
      if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
      if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
      if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
      if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
      return classes.join(" ");
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid w-full",
          getColsClass(),
          gapClasses[gap],
          autoRowsClasses[autoRows],
          center && "place-items-center",
          equalHeight && "items-stretch",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";

// =============================================================================
// FLEX COMPONENT
// =============================================================================

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  responsive?: {
    sm?: Partial<FlexProps>;
    md?: Partial<FlexProps>;
    lg?: Partial<FlexProps>;
    xl?: Partial<FlexProps>;
  };
}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      className,
      direction = "row",
      wrap = "nowrap",
      justify = "start",
      align = "start",
      gap = "none",
      responsive,
      children,
      ...props
    },
    ref
  ) => {
    const directionClasses = {
      row: "flex-row",
      column: "flex-col",
      "row-reverse": "flex-row-reverse",
      "column-reverse": "flex-col-reverse",
    };

    const wrapClasses = {
      nowrap: "flex-nowrap",
      wrap: "flex-wrap",
      "wrap-reverse": "flex-wrap-reverse",
    };

    const justifyClasses = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    };

    const alignClasses = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    };

    const gapClasses = {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      "2xl": "gap-12",
    };

    const getResponsiveClasses = () => {
      if (!responsive) return "";

      const classes: string[] = [];

      Object.entries(responsive).forEach(([breakpoint, props]) => {
        const prefix = breakpoint + ":";
        if (props.direction)
          classes.push(prefix + directionClasses[props.direction]);
        if (props.wrap) classes.push(prefix + wrapClasses[props.wrap]);
        if (props.justify) classes.push(prefix + justifyClasses[props.justify]);
        if (props.align) classes.push(prefix + alignClasses[props.align]);
        if (props.gap) classes.push(prefix + gapClasses[props.gap]);
      });

      return classes.join(" ");
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          directionClasses[direction],
          wrapClasses[wrap],
          justifyClasses[justify],
          alignClasses[align],
          gapClasses[gap],
          getResponsiveClasses(),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = "Flex";

// =============================================================================
// STACK COMPONENT
// =============================================================================

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  divider?: React.ReactNode;
  align?: "start" | "center" | "end" | "stretch";
  direction?: "vertical" | "horizontal";
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      spacing = "md",
      divider,
      align = "stretch",
      direction = "vertical",
      children,
      ...props
    },
    ref
  ) => {
    const spacingClasses = {
      none: "space-y-0",
      xs: "space-y-1",
      sm: "space-y-2",
      md: "space-y-4",
      lg: "space-y-6",
      xl: "space-y-8",
      "2xl": "space-y-12",
    };

    const horizontalSpacingClasses = {
      none: "space-x-0",
      xs: "space-x-1",
      sm: "space-x-2",
      md: "space-x-4",
      lg: "space-x-6",
      xl: "space-x-8",
      "2xl": "space-x-12",
    };

    const alignClasses = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    };

    const isHorizontal = direction === "horizontal";

    const childArray = React.Children.toArray(children);
    const childrenWithDividers = divider
      ? childArray.reduce((acc: React.ReactNode[], child, index) => {
          acc.push(child);
          if (index < childArray.length - 1) {
            acc.push(
              <div key={`divider-${index}`} className="flex-shrink-0">
                {divider}
              </div>
            );
          }
          return acc;
        }, [] as React.ReactNode[])
      : children;

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          isHorizontal ? "flex-row" : "flex-col",
          isHorizontal
            ? horizontalSpacingClasses[spacing]
            : spacingClasses[spacing],
          alignClasses[align],
          className
        )}
        {...props}
      >
        {childrenWithDividers}
      </div>
    );
  }
);

Stack.displayName = "Stack";

// =============================================================================
// SIDEBAR LAYOUT
// =============================================================================

interface SidebarLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode;
  sidebarWidth?: "sm" | "md" | "lg" | "xl";
  sidebarPosition?: "left" | "right";
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  stickyHeader?: React.ReactNode;
  footer?: React.ReactNode;
  overlay?: boolean;
}

const SidebarLayout = React.forwardRef<HTMLDivElement, SidebarLayoutProps>(
  (
    {
      className,
      sidebar,
      sidebarWidth = "md",
      sidebarPosition = "left",
      collapsible = false,
      defaultCollapsed = false,
      stickyHeader,
      footer,
      overlay = false,
      children,
      ...props
    },
    ref
  ) => {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    const sidebarWidthClasses = {
      sm: "w-48",
      md: "w-64",
      lg: "w-72",
      xl: "w-80",
    };

    const collapsedWidthClasses = {
      sm: "w-12",
      md: "w-16",
      lg: "w-20",
      xl: "w-24",
    };

    const toggleSidebar = () => {
      if (window.innerWidth >= 1024) {
        setIsCollapsed(!isCollapsed);
      } else {
        setIsMobileOpen(!isMobileOpen);
      }
    };

    const sidebarClasses = cn(
      "flex flex-col bg-card border-border transition-all duration-300",
      sidebarPosition === "left" ? "border-r" : "border-l",
      // Desktop
      "hidden lg:flex",
      collapsible && isCollapsed
        ? collapsedWidthClasses[sidebarWidth]
        : sidebarWidthClasses[sidebarWidth],
      // Mobile overlay
      overlay && "lg:relative lg:translate-x-0",
      overlay && sidebarPosition === "left" && "fixed inset-y-0 left-0 z-50",
      overlay && sidebarPosition === "right" && "fixed inset-y-0 right-0 z-50"
    );

    return (
      <div ref={ref} className={cn("flex min-h-screen", className)} {...props}>
        {sidebarPosition === "left" && (
          <aside
            className={sidebarClasses}
            role="complementary"
            aria-label="Sidebar"
          >
            {sidebar}
          </aside>
        )}

        <div className="flex flex-col flex-1 min-w-0">
          {stickyHeader && (
            <header className="sticky top-0 z-30 bg-background border-b border-border">
              {stickyHeader}
            </header>
          )}

          <main
            id="main-content"
            className="flex-1 p-4 sm:p-6 lg:p-8"
            role="main"
            tabIndex={-1}
          >
            {children}
          </main>

          {footer && (
            <footer
              className="border-t border-border bg-muted/30"
              role="contentinfo"
            >
              {footer}
            </footer>
          )}
        </div>

        {sidebarPosition === "right" && (
          <aside
            className={sidebarClasses}
            role="complementary"
            aria-label="Sidebar"
          >
            {sidebar}
          </aside>
        )}

        {/* Mobile sidebar overlay */}
        {overlay && isMobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
              aria-hidden="true"
            />
            <aside
              className={cn(
                "fixed inset-y-0 z-50 w-64 bg-card border-border shadow-xl lg:hidden",
                "transform transition-transform duration-300",
                sidebarPosition === "left"
                  ? "left-0 border-r"
                  : "right-0 border-l",
                isMobileOpen
                  ? "translate-x-0"
                  : sidebarPosition === "left"
                    ? "-translate-x-full"
                    : "translate-x-full"
              )}
              role="complementary"
              aria-label="Mobile sidebar"
            >
              {sidebar}
            </aside>
          </>
        )}
      </div>
    );
  }
);

SidebarLayout.displayName = "SidebarLayout";

// =============================================================================
// SECTION COMPONENT
// =============================================================================

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  background?: "default" | "muted" | "accent";
  fullWidth?: boolean;
  centered?: boolean;
  as?: React.ElementType;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      spacing = "lg",
      background = "default",
      fullWidth = false,
      centered = true,
      as: Component = "section",
      header,
      footer,
      children,
      ...props
    },
    ref
  ) => {
    const spacingClasses = {
      none: "py-0",
      sm: "py-8",
      md: "py-12",
      lg: "py-16",
      xl: "py-20",
      "2xl": "py-24",
    } as const;

    const backgroundClasses = {
      default: "bg-background",
      muted: "bg-muted/30",
      accent: "bg-accent/30",
    } as const;

    const spacingClass = spacingClasses[spacing];
    const backgroundClass = backgroundClasses[background];
    return (
      <Component
        ref={ref}
        className={cn("w-full", spacingClass, backgroundClass, className)}
        {...props}
      >
        <Container maxWidth={fullWidth ? "full" : "xl"} center={centered}>
          {header && <div className="mb-8">{header}</div>}
          {children}
          {footer && <div className="mt-8">{footer}</div>}
        </Container>
      </Component>
    );
  }
);

Section.displayName = "Section";

// =============================================================================
// RESPONSIVE SPACING
// =============================================================================

interface SpacingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  responsive?: {
    sm?: SpacingProps["size"];
    md?: SpacingProps["size"];
    lg?: SpacingProps["size"];
    xl?: SpacingProps["size"];
  };
  axis?: "x" | "y" | "both";
}

const Spacing = React.forwardRef<HTMLDivElement, SpacingProps>(
  ({ className, size = "md", responsive, axis = "y", ...props }, ref) => {
    const spacingMap = {
      xs: 1,
      sm: 2,
      md: 4,
      lg: 8,
      xl: 12,
      "2xl": 16,
      "3xl": 20,
      "4xl": 24,
    };

    const getAxisClasses = (sz: SpacingProps["size"], prefix = "") => {
      const value = spacingMap[sz || "md"];
      const pre = prefix ? prefix + ":" : "";

      switch (axis) {
        case "x":
          return `${pre}px-${value}`;
        case "y":
          return `${pre}py-${value}`;
        case "both":
          return `${pre}p-${value}`;
        default:
          return `${pre}py-${value}`;
      }
    };

    const classes = [getAxisClasses(size)];

    if (responsive) {
      Object.entries(responsive).forEach(([breakpoint, sz]) => {
        if (sz) {
          classes.push(getAxisClasses(sz, breakpoint));
        }
      });
    }

    return <div ref={ref} className={cn(...classes, className)} {...props} />;
  }
);

Spacing.displayName = "Spacing";

export { Container, Grid, Flex, Stack, SidebarLayout, Section, Spacing };
export type {
  ContainerProps,
  GridProps,
  FlexProps,
  StackProps,
  SidebarLayoutProps,
  SectionProps,
  SpacingProps,
};
