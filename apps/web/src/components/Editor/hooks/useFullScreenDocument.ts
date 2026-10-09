import { useCallback } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";

import { useSession } from "@/components/Editor/hooks/useAuth";

type UseFullScreenDocument = [
  boolean,
  {
    toggle: () => void;
  },
];
// =====================================
// ⬢  use FullScreen Document
// =====================================
function useFullScreenDocument(documentId: string): UseFullScreenDocument {
  // Only reads the user id for a localStorage key. Visualization blocks call
  // this on public notebooks too, so it must not bounce signed-out viewers.
  const session = useSession({ redirectToLogin: false });
  const user = session?.user;
  const [isFullScreen, setIsFullScreen] = useLocalStorage(
    `sandworm-user-${user?.id}-doc-${documentId}-fullscreen`,
    true
  );

  const toggle = useCallback(() => {
    setIsFullScreen(prev => !prev);
  }, [setIsFullScreen]);

  return [isFullScreen, { toggle }];
}

export default useFullScreenDocument;
