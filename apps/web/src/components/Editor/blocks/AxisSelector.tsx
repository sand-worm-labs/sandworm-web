import { useCallback, useEffect, useMemo } from "react";
import type { DataFrameColumn } from "@sandworm/types";

import Combobox from "../../Visualization/Combobox";

import { getColumnTypeIcon } from "./customBlocks/sql/Table";

function ColumnIcon({
  type,
  className,
}: {
  type: DataFrameColumn["type"];
  className?: string;
}) {
  const Icon = getColumnTypeIcon(type);
  if (!Icon) {
    return null;
  }

  return <Icon className={className} />;
}

function search(options: (DataFrameColumn | null)[], query: string) {
  return options.filter(c => {
    return c?.name.toString().toLowerCase().includes(query.toLowerCase());
  });
}

type AxisSelectorProps = {
  label?: string | JSX.Element;
  value: DataFrameColumn | null;
  defaultValue: DataFrameColumn | null;
  columns: (DataFrameColumn | null)[];
  onChange: (column: DataFrameColumn | null) => void;
  disabled?: boolean;
};

export default function AxisSelector({
  label,
  value,
  defaultValue,
  columns,
  onChange,
  disabled,
}: AxisSelectorProps) {
  // Use the value from the columns array so that the value equality check works
  const selectedValue = useMemo(
    () => columns.find(c => c?.name === value?.name) ?? null,
    [columns, value]
  );

  useEffect(() => {
    if (selectedValue === null && defaultValue !== null && !disabled) {
      onChange(defaultValue);
    }
  }, [defaultValue, selectedValue, onChange, disabled]);

  const renderIcon = useCallback((column: DataFrameColumn | null) => {
    return column ? (
      <ColumnIcon type={column.type} className="h-3 w-3 text-ink-400 " />
    ) : null;
  }, []);

  return (
    <Combobox<DataFrameColumn | null>
      label={label}
      value={selectedValue}
      options={columns}
      onChange={onChange}
      search={search}
      getLabel={valuex => valuex?.name.toString() ?? "None"}
      icon={renderIcon}
      placeholder="Column"
      disabled={disabled}
    />
  );
}
