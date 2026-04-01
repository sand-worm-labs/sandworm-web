import { updateYText } from "@sandworm/editor";
import { useCallback, useEffect, useState } from "react";
import type * as Y from "yjs";

type UseYTextInput = {
  value: string;
  onChange: (value: string) => void;
};

// =====================================
// ⬢ useYTextInput
// =====================================
function useYTextInput(text: Y.Text): UseYTextInput {
  const [value, setValue] = useState(text.toString());
  useEffect(() => {
    const onTextChange = () => {
      setValue(text.toString());
    };
    text.observe(onTextChange);
    return () => {
      text.unobserve(onTextChange);
    };
  }, [text]);

  const onChange = useCallback(
    (newValue: string) => {
      updateYText(text, newValue);
    },
    [text]
  );

  return { value, onChange };
}

export default useYTextInput;
