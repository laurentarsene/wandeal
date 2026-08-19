"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * True once the client has hydrated. Used by components that render into a
 * portal, which must not run during the server pass. Reading it through
 * useSyncExternalStore avoids the setState-in-an-effect pattern React 19 warns
 * about, and still produces exactly one re-render after hydration.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
