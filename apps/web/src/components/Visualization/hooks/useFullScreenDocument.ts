import { useCallback } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useSession } from "next-auth/react";

type UseFullScreenDocument = [
  boolean,
  {
    toggle: () => void;
  },
];
function useFullScreenDocument(documentId: string): UseFullScreenDocument {
  const { data: user } = useSession({ redirectToLogin: true });
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
