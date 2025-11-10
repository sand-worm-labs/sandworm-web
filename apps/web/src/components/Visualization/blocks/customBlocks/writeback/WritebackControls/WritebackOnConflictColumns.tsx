import { uniq, identity, always } from "ramda";
import type { DataFrame } from "@sandworm/types";
import { useCallback, useMemo } from "react";

import MultiCombobox from "../../../../MultiCombobox";

const nullFn = always(null);

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  dataframe: DataFrame | null;
  disabled: boolean;
}
function WritebackOnConflictColumns(props: Props) {
  const options = useMemo(
    () =>
      uniq(props.dataframe?.columns.map(c => c.name.toString()) ?? []).concat(
        props.value
      ),
    [props.dataframe, props.value]
  );

  const search = useCallback(
    (options: string[], query: string) =>
      options.filter(option =>
        option.toLowerCase().includes(query.toLowerCase())
      ),
    []
  );

  return (
    <div className="flex items-center">
      <MultiCombobox
        label="On conflict columns"
        value={props.value}
        options={options}
        onChange={props.onChange}
        search={search}
        getLabel={identity}
        icon={nullFn}
        placeholder="Select columns"
        disabled={props.disabled}
      />
    </div>
  );
}

export default WritebackOnConflictColumns;
