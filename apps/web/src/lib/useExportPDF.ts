import { useState, useCallback, useEffect } from "react";

export function useExportPDF() {
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (!isPrinting) return;

    let raf1: number;
    let raf2: number;
    let timer: ReturnType<typeof setTimeout>;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        timer = setTimeout(() => {
          window.print();
          setIsPrinting(false);
        }, 150);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(timer);
    };
  }, [isPrinting]);

  const triggerPrint = useCallback(() => {
    setIsPrinting(true);
  }, []);

  return { isPrinting, triggerPrint };
}
