import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload, X, Loader2, Eye, Download } from "lucide-react";
import { api } from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileUploadProps {
    value?: string;
    onChange: (url: string) => void;
    getImageUrl: (url?: string) => string;
    disabled?: boolean;
    label?: string;
    description?: string;
    error?: string;
}

function formatBytes(bytes: number, decimals = 1) {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export const FileUpload: React.FC<FileUploadProps> = ({
    value = "",
    onChange,
    getImageUrl,
    disabled = false,
    label,
    description,
    error,
}) => {
    const { t } = useTranslation();
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [fileName, setFileName] = useState("");
    const [fileSize, setFileSize] = useState("");
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileInputId = useRef(`file-upload-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        if (value) {
            // Extract filename from URL if not already set by manual upload
            if (!fileName) {
                const nameFromUrl = value.substring(value.lastIndexOf("/") + 1);
                setFileName(nameFromUrl || "uploaded-image.png");
                setFileSize("1.2 MB"); // Fallback estimated size
            }
        } else {
            setFileName("");
            setFileSize("");
        }
    }, [value]);

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        setUploading(false);
        setFileName(file.name);
        setFileSize(formatBytes(file.size));
        setUploading(true);

        try {
            const res = await api.post("/media/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            onChange(res.data.data.imageUrl);
            toast.success(t("common.success"));
        } catch (err: any) {
            setFileName("");
            setFileSize("");
            toast.error(t("common.error"), {
                description: err.response?.data?.message || t("common.error")
            });
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFile(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (disabled || uploading) return;

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            await uploadFile(file);
        } else {
            toast.error(t("common.error"), {
                description: t("product.validation.imageRequired")
            });
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        setFileName("");
        setFileSize("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handlePreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (value) {
            window.open(getImageUrl(value), "_blank");
        }
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!value) return;

        try {
            const response = await fetch(getImageUrl(value));
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName || "downloaded-image.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            // Fallback to open in new tab if download block occurs
            window.open(getImageUrl(value), "_blank");
        }
    };

    function renderUploadIcon() {
        if (uploading) {
            return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
        }
        return <Upload className="h-5 w-5 text-muted-foreground/80" />;
    }

    const triggerBrowse = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-2">
            {label && <Label className="text-xs font-semibold text-foreground">{label}</Label>}
            
            {/* Hidden File Input */}
            <Input
                type="file"
                ref={fileInputRef}
                id={fileInputId.current}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || uploading}
            />

            {/* Dropzone Container */}
            <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerBrowse}
                className={`border border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                    dragActive 
                        ? "border-primary bg-primary/5 scale-[0.99]" 
                        : "border-muted-foreground/25 bg-muted/5 hover:bg-muted/10"
                } ${disabled || uploading ? "opacity-50 pointer-events-none" : ""}`}
            >
                {/* Upload Icon in Circle */}
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-muted bg-background shadow-sm text-muted-foreground">
                    {renderUploadIcon()}
                </div>

                <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">
                        {uploading ? t("common.loading") : t("product.uploadFilesTitle")}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                        {t("product.uploadFilesSubtitle")}
                    </p>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="default"
                    disabled={disabled || uploading}
                    onClick={(e) => {
                        e.stopPropagation();
                        triggerBrowse();
                    }}
                    className="text-xs font-semibold px-4 py-1.5 h-8 bg-background border shadow-sm hover:bg-accent"
                >
                    {t("product.browseFilesButton")}
                </Button>
            </div>

            {/* Uploaded File List Card */}
            {value && (
                <div className="border border-border/60 rounded-xl p-3 flex items-center justify-between gap-3 bg-card mt-2 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Thumbnail Image */}
                        <img 
                            src={getImageUrl(value)} 
                            alt={t("product.uploadThumbnailAlt")} 
                            className="h-11 w-11 rounded-lg border object-cover bg-muted shrink-0 shadow-sm" 
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=60";
                            }}
                        />
                        {/* File Details */}
                        <div className="space-y-0.5 text-left min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate max-w-[180px] sm:max-w-[220px]">
                                {fileName}
                            </p>
                            {fileSize && (
                                <p className="text-[10px] text-muted-foreground font-medium">
                                    {fileSize}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={disabled || uploading}
                            onClick={handlePreview}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={disabled || uploading}
                            onClick={handleDownload}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={disabled || uploading}
                            onClick={handleClear}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-xs text-destructive font-semibold mt-1">{error}</p>
            )}
            
            {description && (
                <p className="text-[10px] text-muted-foreground mt-1">{description}</p>
            )}
        </div>
    );
};
