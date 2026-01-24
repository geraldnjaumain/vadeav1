"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
    CloudArrowUpIcon,
    XMarkIcon,
    DocumentIcon,
    PhotoIcon,
    VideoCameraIcon
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";

interface FileWithPreview {
    file: File;
    preview?: string;
    storageId?: string;
    url?: string;
}

interface FileUploaderProps {
    onFilesUploaded: (files: Array<{
        name: string;
        url: string;
        type: string;
        storageId: string;
    }>) => void;
    maxFiles?: number;
    maxSizeMB?: number;
    accept?: Record<string, string[]>;
}

export function FileUploader({
    onFilesUploaded,
    maxFiles = 5,
    maxSizeMB = 10,
    accept = {
        'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
        'application/pdf': ['.pdf'],
        'video/*': ['.mp4', '.mov'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
}: FileUploaderProps) {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const generateUploadUrl = useMutation(api.file_upload.generateUploadUrl);
    const saveFileMetadata = useMutation(api.file_upload.saveFileMetadata);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Validate file count
        if (files.length + acceptedFiles.length > maxFiles) {
            toast.error(`Maximum ${maxFiles} files allowed`);
            return;
        }

        // Validate file sizes
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        const oversizedFiles = acceptedFiles.filter(f => f.size > maxSizeBytes);
        if (oversizedFiles.length > 0) {
            toast.error(`Files must be smaller than ${maxSizeMB}MB`);
            return;
        }

        // Create previews for images
        const newFiles = acceptedFiles.map(file => {
            const fileWithPreview: FileWithPreview = { file };
            if (file.type.startsWith('image/')) {
                fileWithPreview.preview = URL.createObjectURL(file);
            }
            return fileWithPreview;
        });

        setFiles(prev => [...prev, ...newFiles]);
    }, [files, maxFiles, maxSizeMB]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles,
        maxSize: maxSizeMB * 1024 * 1024
    });

    const removeFile = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            const removed = newFiles.splice(index, 1)[0];
            if (removed.preview) {
                URL.revokeObjectURL(removed.preview);
            }
            return newFiles;
        });
    };

    const uploadFiles = async () => {
        if (files.length === 0) {
            toast.error("No files to upload");
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const uploadedFiles = [];

            for (let i = 0; i < files.length; i++) {
                const fileData = files[i];
                const file = fileData.file;

                // Step 1: Get upload URL
                const uploadUrl = await generateUploadUrl();

                // Step 2: Upload file to Convex storage
                const result = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file
                });

                const { storageId } = await result.json();

                // Step 3: Save metadata
                const metadata = await saveFileMetadata({
                    storageId,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size
                });

                uploadedFiles.push({
                    name: file.name,
                    url: metadata.url,
                    type: file.type,
                    storageId: storageId
                });

                // Update progress
                setUploadProgress(((i + 1) / files.length) * 100);
            }

            // Notify parent component
            onFilesUploaded(uploadedFiles);

            // Clear files
            files.forEach(f => {
                if (f.preview) URL.revokeObjectURL(f.preview);
            });
            setFiles([]);

            toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Upload failed. Please try again.");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return PhotoIcon;
        if (type.startsWith('video/')) return VideoCameraIcon;
        return DocumentIcon;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    isDragActive ? "border-blue-500 bg-blue-50" : "border-zinc-300 hover:border-blue-400",
                    uploading && "pointer-events-none opacity-50"
                )}
            >
                <input {...getInputProps()} />
                <CloudArrowUpIcon className="h-12 w-12 mx-auto mb-3 text-zinc-400" />
                {isDragActive ? (
                    <p className="text-blue-600 font-medium">Drop files here...</p>
                ) : (
                    <div>
                        <p className="text-zinc-700 font-medium mb-1">
                            Drag & drop files here, or click to select
                        </p>
                        <p className="text-xs text-zinc-500">
                            Max {maxFiles} files • {maxSizeMB}MB per file • Images, PDFs, Videos, Documents
                        </p>
                    </div>
                )}
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-zinc-700">
                        Selected Files ({files.length}/{maxFiles})
                    </p>
                    {files.map((fileData, index) => {
                        const Icon = getFileIcon(fileData.file.type);
                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 border border-zinc-200 rounded-lg"
                            >
                                {fileData.preview ? (
                                    <img
                                        src={fileData.preview}
                                        alt={fileData.file.name}
                                        className="h-12 w-12 object-cover rounded"
                                    />
                                ) : (
                                    <div className="h-12 w-12 bg-zinc-100 rounded flex items-center justify-center">
                                        <Icon className="h-6 w-6 text-zinc-500" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-900 truncate">
                                        {fileData.file.name}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {formatFileSize(fileData.file.size)}
                                    </p>
                                </div>
                                {!uploading && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeFile(index)}
                                        className="shrink-0"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload Progress */}
            {uploading && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-700">Uploading...</span>
                        <span className="text-zinc-500">{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                </div>
            )}

            {/* Upload Button */}
            {files.length > 0 && !uploading && (
                <Button onClick={uploadFiles} className="w-full">
                    <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                    Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
                </Button>
            )}
        </div>
    );
}
