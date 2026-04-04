// =====================================
// ⬢ Read File
// =====================================
export function readFile(
  file: File,
  encoding: BufferEncoding = "utf8"
): Promise<string> {
  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(file);

  return new Promise(resolve => {
    fileReader.onload = e => {
      if (!e.target?.result) {
        return;
      }

      if (typeof e.target.result === "string") {
        resolve(e.target.result);
        return;
      }

      resolve(Buffer.from(e.target.result).toString(encoding));
    };
  });
}

// =====================================
// ⬢ Download File
// =====================================
export function downloadFile(url: string, name: string) {
  const downloadLink = document.createElement("a");

  downloadLink.download = name;
  downloadLink.href = url;

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
