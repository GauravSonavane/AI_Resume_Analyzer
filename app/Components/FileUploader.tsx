import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "app/lib/utils";

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const file = acceptedFiles[0] || null;
            onFileSelect?.(file);
        },
        [onFileSelect]
    );

    const maxFileSize = 20 * 1024 * 1024; // 20MB
    const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
        useDropzone({
            onDrop,
            multiple: false,
            accept: { "application/pdf": [".pdf"] },
            maxSize: maxFileSize,
        });

    const file = acceptedFiles[0] || null;

    return (
        <div className="w-full gradient-border">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition ${
                    isDragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
                }`}
            >
                <input {...getInputProps()} />

                <div className="space-y-4">
                    {file ? (
                        <div
                            className="uploader-selected-file flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center space-x-3">
                                <img src="/images-01/images/pdf.png" alt="pdf" className="size-10" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                className="p-2 hover:bg-red-100 rounded-full transition"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFileSelect?.(null);
                                }}
                            >
                                <img
                                    src="/icons-01/icons/cross.svg"
                                    alt="remove"
                                    className="w-4 h-4"
                                />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                                <img src="/icons-01/icons/info.svg" alt="upload" className="size-12" />
                            </div>
                            <p className="text-lg text-gray-600">
                                <span className="font-semibold">Click to upload</span> or drag
                                and drop
                            </p>
                            <p className="text-sm text-gray-500">
                                PDF (max {formatSize(maxFileSize)})
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileUploader;
