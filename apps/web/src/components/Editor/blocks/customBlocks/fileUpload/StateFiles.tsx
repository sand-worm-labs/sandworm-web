/* eslint-disable import/no-cycle */

import { useMemo } from "react";
import type { UploadedFile } from "@sandworm/editor";

import type { CellFile, FilesTableHeader } from "./FilesTable";
import { Row } from "./FilesTable";

import type { FileUploadState, UploadError } from ".";

interface Props {
  state: FileUploadState;
  headers: FilesTableHeader[];
  onAbort: (filename: string) => void;
}

interface ErrorRowProps {
  error: UploadError;
  headers: FilesTableHeader[];
}
function ErrorRow(props: ErrorRowProps) {
  const rowFile = useMemo(
    () => ({
      name: props.error.file.name,
      size: props.error.file.size,
      type: props.error.file.type,
      status: "idle" as UploadedFile["status"],
      error: null,
      uploaded: 0,
      total: props.error.file.size,
    }),
    [props.error.file]
  );

  return (
    <Row
      file={rowFile}
      headers={props.headers}
      downloadLink=""
      isDeleting={false}
      onDelete={() => {}}
      error={props.error.reason}
      uploading={false}
      onPythonUsage={() => {}}
      onQueryUsage={() => {}}
    />
  );
}

interface RestRowProps {
  file: File;
  headers: FilesTableHeader[];
  onAbort: (filename: string) => void;
}
function RestRow(props: RestRowProps) {
  const rowFile = useMemo(
    () => ({
      name: props.file.name,
      type: props.file.type,
      uploaded: 0,
      total: props.file.size,
    }),
    [props.file]
  );

  return (
    <Row
      file={rowFile}
      headers={props.headers}
      downloadLink=""
      isDeleting={false}
      onDelete={props.onAbort}
      uploading
      error={null}
      onPythonUsage={() => {}}
      onQueryUsage={() => {}}
    />
  );
}
function StateFiles(props: Props) {
  const current: CellFile | null = useMemo(
    () =>
      props.state._tag === "uploading"
        ? {
            name: props.state.current.file.name,
            type: props.state.current.file.type,
            uploaded: props.state.current.uploaded,
            total: props.state.current.total,
          }
        : null,
    [props.state]
  );

  const rest = useMemo(
    () => (props.state._tag === "uploading" ? props.state.rest : []),
    [props.state]
  );

  return (
    <>
      {props.state.errors.map(error => (
        <ErrorRow key={error.file.name} error={error} headers={props.headers} />
      ))}
      {current && (
        <Row
          file={current}
          headers={props.headers}
          downloadLink=""
          isDeleting={false}
          onDelete={props.onAbort}
          uploading
          error={null}
          onPythonUsage={() => {}}
          onQueryUsage={() => {}}
        />
      )}
      {rest.map(file => (
        <RestRow
          key={file.name}
          file={file}
          headers={props.headers}
          onAbort={props.onAbort}
        />
      ))}
    </>
  );
}

export default StateFiles;
