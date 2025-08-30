import React, { useEffect, useRef } from "react";
import { usePreload } from "../hooks/usePreload";

interface SmartPreloaderProps {
  children: React.ReactNode;
  preloadComponents: Array<{
    name: string;
    component: any;
    priority: "high" | "medium" | "low";
  }>;
}

export const SmartPreloader: React.FC<SmartPreloaderProps> = ({
  children,
  preloadComponents,
}) => {
  const { preloadComponent } = usePreload();
  const preloadedRef = useRef<Set<string>>(new Set());
  const userActivityRef = useRef<number>(0);

  // Track user activity
  useEffect(() => {
    const trackActivity = () => {
      userActivityRef.current = Date.now();
    };

    const events = ["mousemove", "click", "scroll", "keydown"];
    events.forEach((event) => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, trackActivity);
      });
    };
  }, []);

  // Smart preloading based on user activity and component priority
  useEffect(() => {
    const preloadHighPriority = () => {
      preloadComponents
        .filter(
          (comp) =>
            comp.priority === "high" && !preloadedRef.current.has(comp.name)
        )
        .forEach((comp) => {
          preloadComponent(comp.component);
          preloadedRef.current.add(comp.name);
        });
    };

    const preloadMediumPriority = () => {
      preloadComponents
        .filter(
          (comp) =>
            comp.priority === "medium" && !preloadedRef.current.has(comp.name)
        )
        .forEach((comp) => {
          preloadComponent(comp.component);
          preloadedRef.current.add(comp.name);
        });
    };

    // Preload high priority components immediately
    preloadHighPriority();

    // Preload medium priority components after a delay
    const mediumPriorityTimer = setTimeout(preloadMediumPriority, 2000);

    // Preload low priority components when user is active
    const checkUserActivity = () => {
      const timeSinceActivity = Date.now() - userActivityRef.current;
      if (timeSinceActivity < 5000) {
        // User active in last 5 seconds
        preloadComponents
          .filter(
            (comp) =>
              comp.priority === "low" && !preloadedRef.current.has(comp.name)
          )
          .forEach((comp) => {
            preloadComponent(comp.component);
            preloadedRef.current.add(comp.name);
          });
      }
    };

    const activityCheckInterval = setInterval(checkUserActivity, 10000);

    return () => {
      clearTimeout(mediumPriorityTimer);
      clearInterval(activityCheckInterval);
    };
  }, [preloadComponents, preloadComponent]);

  return <>{children}</>;
};
