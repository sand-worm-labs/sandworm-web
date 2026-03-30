import { useCallback } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";

import { useSession } from "@/components/Editor/hooks/useAuth";

type UseFullScreenDocument = [
  boolean,
  {
    toggle: () => void;
  },
];
function useFullScreenDocument(documentId: string): UseFullScreenDocument {
  const session = useSession({ redirectToLogin: true });
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
