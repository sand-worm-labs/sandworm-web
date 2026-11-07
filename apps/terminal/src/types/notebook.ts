// The notebook an item was made from. `ranOn` is when the cell last ran for
// the item; what the item shows is a snapshot of that run.
export type NotebookSource = {
  // Null once the notebook is deleted: the snapshot stays, the link does not.
  notebookUrl: string | null;
  ranOn: string;
};
