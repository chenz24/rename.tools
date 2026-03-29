// Type definitions for File System Access API
// https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API

interface DataTransferItem {
	/**
	 * Returns a Promise that resolves to a FileSystemHandle (either FileSystemFileHandle or FileSystemDirectoryHandle)
	 * if the dragged item is a file or directory.
	 * This is part of the File System Access API.
	 */
	getAsFileSystemHandle?(): Promise<FileSystemHandle>;
}
