import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";
import clsx from "clsx";
import type { ReactNode } from "react";
import { forwardRef } from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

// =====================================
// ⬢ Scroll bar
// =====================================
const ScrollBar = forwardRef<HTMLDivElement, Props>(
  function ScrollBar(props, ref) {
    return (
      <OverlayScrollbarsComponent
        {...props}
        element="div"
        className={clsx(props.className)}
        options={{ scrollbars: { autoHide: "scroll" } }}
        events={{
          initialized: instance => {
            if (ref && typeof ref !== "function") {
              const mutableRef = ref as React.MutableRefObject<HTMLDivElement>;
              mutableRef.current = instance.elements()
                .scrollEventElement as HTMLDivElement;
            }
          },
        }}
      >
        {props.children}
      </OverlayScrollbarsComponent>
    );
  }
);

export default ScrollBar;
