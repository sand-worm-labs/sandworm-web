import {
  NodeViewWrapper,
  type NodeViewProps,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import TipTapImage from "@tiptap/extension-image";
import { Plugin } from "@tiptap/pm/state";

// =====================================
// ⬢  Utils
// =====================================
const useEvent = <T extends (...args: any[]) => any>(handler: T): T => {
  const handlerRef = useRef<T | null>(null);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  return useCallback((...args: Parameters<T>): ReturnType<T> => {
    if (handlerRef.current === null) {
      throw new Error("Handler is not assigned");
    }
    return handlerRef.current(...args);
  }, []) as T;
};

// =====================================
// ⬢ Constants
// =====================================
const MIN_WIDTH = 60;
const BORDER_COLOR = "rgb(93, 138, 66)";

const NS_POSITION_MAP: Record<string, Pick<CSSProperties, "top" | "bottom">> = {
  n: { top: 0 },
  s: { bottom: 0 },
};
const EW_POSITION_MAP: Record<string, Pick<CSSProperties, "left" | "right">> = {
  w: { left: 0 },
  e: { right: 0 },
};

// =====================================
// ⬢  Resizable Image Template
// =====================================
const ResizableImageTemplate = ({ node, updateAttributes }: NodeViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [editing, setEditing] = useState(false);
  const [resizingStyle, setResizingStyle] = useState<
    Pick<CSSProperties, "width"> | undefined
  >();

  useEffect(() => {
    const handleClickOutside = (clickEvent: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(clickEvent.target as Node)
      ) {
        setEditing(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [editing]);

  const handleMouseDown = useEvent(
    (mouseDownEvent: React.MouseEvent<HTMLDivElement>) => {
      if (!imgRef.current) return;
      mouseDownEvent.preventDefault();

      const direction = mouseDownEvent.currentTarget.dataset.direction ?? "--";
      const initialXPosition = mouseDownEvent.clientX;
      const currentWidth = imgRef.current.width;
      let newWidth = currentWidth;
      const transform = direction[1] === "w" ? -1 : 1;

      const mouseMoveHandler = (moveEvent: MouseEvent) => {
        newWidth = Math.max(
          currentWidth + transform * (moveEvent.clientX - initialXPosition),
          MIN_WIDTH
        );
        setResizingStyle({ width: newWidth });
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (!moveEvent.buttons) removeListeners();
      };

      const removeListeners = () => {
        window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", removeListeners);
        updateAttributes({ width: newWidth });
        setResizingStyle(undefined);
      };

      window.addEventListener("mousemove", mouseMoveHandler);
      window.addEventListener("mouseup", removeListeners);
    }
  );

  const dragCornerButton = (direction: string) => (
    <div
      role="button"
      tabIndex={0}
      onMouseDown={handleMouseDown}
      data-direction={direction}
      style={{
        position: "absolute",
        height: "10px",
        width: "10px",
        backgroundColor: BORDER_COLOR,
        ...NS_POSITION_MAP[direction.charAt(0)],
        ...EW_POSITION_MAP[direction.charAt(1)],
        cursor: `${direction}-resize`,
      }}
    />
  );

  return (
    <NodeViewWrapper
      ref={containerRef}
      as="div"
      draggable
      data-drag-handle
      onClick={() => setEditing(true)}
      onBlur={() => setEditing(false)}
    >
      <div
        style={{
          overflow: "hidden",
          position: "relative",
          display: "inline-block",
          lineHeight: "0px",
        }}
      >
        <img
          {...node.attrs}
          alt={(node.attrs.alt as string | undefined) ?? ""}
          ref={imgRef}
          style={{
            ...resizingStyle,
            cursor: "default",
            margin: 0,
          }}
        />
        {editing && (
          <>
            {(
              [
                {
                  key: "border-left",
                  style: { left: 0, top: 0, height: "100%", width: "1px" },
                },
                {
                  key: "border-right",
                  style: { right: 0, top: 0, height: "100%", width: "1px" },
                },
                {
                  key: "border-top",
                  style: { top: 0, left: 0, width: "100%", height: "1px" },
                },
                {
                  key: "border-bottom",
                  style: { bottom: 0, left: 0, width: "100%", height: "1px" },
                },
              ] as const
            ).map(({ key, style }) => (
              <div
                key={key}
                style={{
                  position: "absolute",
                  backgroundColor: BORDER_COLOR,
                  ...style,
                }}
              />
            ))}
            {dragCornerButton("nw")}
            {dragCornerButton("ne")}
            {dragCornerButton("sw")}
            {dragCornerButton("se")}
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

// =====================================
// ⬢  Extention
// =====================================
export default TipTapImage.extend({
  priority: 1000,

  addAttributes() {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(this as any).parent?.(),
      width: {
        renderHTML: ({ width }: { width: number }) => ({ width }),
      },
      height: {
        renderHTML: ({ height }: { height: number }) => ({ height }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageTemplate);
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const pastedImages = Array.from(
              event.clipboardData?.items ?? []
            ).filter(item => item.type.startsWith("image/"));

            if (pastedImages.length === 0) return false;

            Promise.all(
              pastedImages.map(async item => {
                const file = item.getAsFile();
                if (!file) return undefined;

                const asBase64 = await new Promise<string>(
                  (resolve, reject) => {
                    const reader = new FileReader();

                    reader.addEventListener("loadend", () => {
                      if (reader.readyState === FileReader.DONE) {
                        resolve(reader.result as string);
                        return;
                      }

                      const timeout = Date.now() + 5000;
                      const interval = setInterval(() => {
                        if (reader.readyState === FileReader.DONE) {
                          clearInterval(interval);
                          resolve(reader.result as string);
                          return;
                        }
                        if (Date.now() > timeout) {
                          clearInterval(interval);
                          reject(new Error("Timeout reading image file"));
                        }
                      }, 200);
                    });

                    reader.addEventListener("error", () =>
                      reject(new Error("FileReader error"))
                    );
                    reader.readAsDataURL(file);
                  }
                );

                return { file, base64: asBase64 };
              })
            ).then(results => {
              results
                .filter((result): result is { file: File; base64: string } =>
                  Boolean(result)
                )
                .forEach(result => {
                  const { schema } = view.state;
                  const imageNode = schema.nodes.image;
                  if (!imageNode) return;

                  const currentPos = view.state.selection.$from.pos;
                  const node = imageNode.create({
                    src: result.base64,
                    alt: result.file.name,
                  });
                  const transaction = view.state.tr.insert(currentPos, node);
                  view.dispatch(transaction);
                });
            });

            return true;
          },
        },
      }),
    ];
  },
}).configure({ inline: true });
