import * as Y from 'yjs';
import { BaseBlock, BlockType } from './index.js';
export type UploadedFile = {
    name: string;
    size: number;
    type: string;
    status: 'idle' | 'delete-requested' | 'deleting';
    error: 'delete-unexpected-error' | null;
};
export type FileUploadBlock = BaseBlock<BlockType.FileUpload> & {
    uploadedFiles: UploadedFile[];
    areFilesHidden: boolean;
};
export declare const isFileUploadBlock: (block: Y.XmlElement<any>) => block is Y.XmlElement<FileUploadBlock>;
export declare function makeFileUploadBlock(id: string): Y.XmlElement<FileUploadBlock>;
export declare function getFileUploadAttributes(block: Y.XmlElement<FileUploadBlock>): FileUploadBlock;
export declare function duplicateFileUploadBlock(newId: string, block: Y.XmlElement<FileUploadBlock>): Y.XmlElement<FileUploadBlock>;
export declare function getUploadedFiles(block: Y.XmlElement<FileUploadBlock>): UploadedFile[];
export declare function appendUploadedFile(block: Y.XmlElement<FileUploadBlock>, name: string, size: number, type: string): void;
export declare function requestDelete(block: Y.XmlElement<FileUploadBlock>, fileName: string): void;
export declare function updateUploadedFile(block: Y.XmlElement<FileUploadBlock>, fileName: string, update: Partial<UploadedFile>): void;
export declare function removeUploadedFile(block: Y.XmlElement<FileUploadBlock>, fileName: string): void;
//# sourceMappingURL=fileUpload.d.ts.map