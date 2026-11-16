import type * as Y from "yjs";
import {
  getBlocks,
  getLayout,
  getRelativeBlockId,
  switchActiveTab,
} from "@sandworm/editor";
import {
  useState,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useHotkeysContext } from "react-hotkeys-hook";

// =====================================
// ⬢ Types
// =====================================
export type InteractionState = {
  mode: "normal" | "insert";
  cursorBlockId: string | null;
  scrollIntoView: boolean;
};
type Move = (
  dir: "above" | "below" | "left" | "right",
  mode: "normal" | "insert"
) => void;

export type InteractionAPI = {
  insert: (blockId: string, opts: { scrollIntoView: boolean }) => void;
  focus: (blockId: string, opts: { scrollIntoView: boolean }) => void;
  blur: () => void;
  move: Move;
};

type UseEditorAwareness = [InteractionState, InteractionAPI];

interface Props {
  scrollViewRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
  yDoc: Y.Doc;
}

// =====================================
// ⬢ Context
// =====================================
const Context = createContext<[InteractionState, InteractionAPI]>([
  {
    mode: "normal",
    cursorBlockId: null,
    scrollIntoView: false,
  },
  {
    insert: () => {},
    focus: () => {},
    blur: () => {},
    move: () => {},
  },
]);

// =====================================
// ⬢ Editor Awareness Provider
// =====================================
export function EditorAwarenessProvider(props: Props) {
  const { disableScope, enableScope } = useHotkeysContext();
  const [state, setState] = useState<InteractionState>({
    mode: "normal",
    cursorBlockId: null,
    scrollIntoView: false,
  });

  useEffect(() => {
    if (state.mode === "normal") {
      enableScope("editor");
    } else {
      disableScope("editor");
    }
  }, [state.mode, enableScope, disableScope]);

  const insert = useCallback(
    (blockId: string, opts: { scrollIntoView: boolean }) => {
      setState({
        mode: "insert",
        cursorBlockId: blockId,
        scrollIntoView: opts?.scrollIntoView,
      });
    },
    []
  );

  const focus = useCallback(
    (blockId: string, opts: { scrollIntoView: boolean }) => {
      setState({
        mode: "normal",
        cursorBlockId: blockId,
        scrollIntoView: opts.scrollIntoView,
      });
    },
    []
  );

  const blur = useCallback(() => {
    setState(prev => ({ ...prev, mode: "normal" }));
  }, []);

  const move: Move = useCallback(
    (pos, mode) => {
      const result = getRelativeBlockId(
        getLayout(props.yDoc),
        getBlocks(props.yDoc),
        state.cursorBlockId,
        pos
      );
      if (!result) {
        return;
      }

      const {
        blockGroupId: nextCursorBlockGroupId,
        blockId: nextCursorBlockId,
      } = result;

      if (nextCursorBlockId === null) {
        return;
      }

      if (pos === "left" || pos === "right") {
        switchActiveTab(
          getLayout(props.yDoc),
          nextCursorBlockGroupId,
          nextCursorBlockId
        );
      }

      switch (mode) {
        case "normal":
          focus(nextCursorBlockId, { scrollIntoView: true });
          break;
        case "insert":
          insert(nextCursorBlockId, { scrollIntoView: true });
          break;
        default:
          break;
      }
    },
    [props.yDoc, state.cursorBlockId, focus, insert]
  );

  const api: InteractionAPI = useMemo(
    () => ({
      insert,
      focus,
      blur,
      move,
    }),
    [insert, focus, blur, move]
  );

  const contextValue = useMemo(
    (): UseEditorAwareness => [state, api],
    [state, api]
  );

  useEffect(() => {
    if (state.cursorBlockId && state.scrollIntoView) {
      const el = document.querySelector(
        `[data-block-id="${state.cursorBlockId}"]`
      );
      if (!el || !props.scrollViewRef.current) {
        return;
      }

      const scrollRect = props.scrollViewRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      if (elRect.height > scrollRect.height) {
        props.scrollViewRef.current.scrollBy({
          top: elRect.top - scrollRect.top - 48,
          behavior: "smooth",
        });
      } else {
        const top =
          elRect.top -
          scrollRect.top -
          scrollRect.height / 2 +
          elRect.height / 2;

        props.scrollViewRef.current.scrollBy({
          top,
          behavior: "smooth",
        });
      }

      setState(prev => ({ ...prev, scrollIntoView: false }));
    }
  }, [state.cursorBlockId, state.scrollIntoView, props.scrollViewRef]);

  // `?block=<id>` opens the notebook at that cell, e.g. from a terminal
  // briefing item. Cells render after the document loads, so wait for it.
  useEffect(() => {
    const blockId = new URLSearchParams(window.location.search).get("block");
    if (!blockId) {
      return undefined;
    }

    const selector = `[data-block-id="${CSS.escape(blockId)}"]`;
    const open = () => {
      if (!document.querySelector(selector)) {
        return false;
      }
      focus(blockId, { scrollIntoView: true });
      return true;
    };
    if (open()) {
      return undefined;
    }

    const observer = new MutationObserver(() => {
      if (open()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const giveUp = window.setTimeout(() => observer.disconnect(), 15000);

    return () => {
      observer.disconnect();
      window.clearTimeout(giveUp);
    };
  }, [focus]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!props.scrollViewRef.current) {
        return;
      }

      if (!props.scrollViewRef.current.contains(e.target as Node)) {
        blur();
      }
    };

    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  }, [props.scrollViewRef, blur]);

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
}

export default function useEditorAwareness(): UseEditorAwareness {
  return useContext(Context);
}
