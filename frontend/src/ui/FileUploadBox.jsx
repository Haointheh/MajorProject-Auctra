import React from "react";
import Button from "./Button";

export default function FileUploadBox({
    label,
    value,
    onChange,
    accept = "image/*",
}) {
    const inputId = `file-${label.replace(/\s+/g, "-").toLowerCase()}`;

    const file = value;

    const handleFileChange = (file) => {
        onChange(file || null);
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        onChange(null);
    };

    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                handleFileChange(droppedFile);
            }}
            onClick={() => document.getElementById(inputId).click()}
            className="border-2 border-dashed border-primary/40 rounded-lg p-5 text-center cursor-pointer hover:bg-neutral2 transition"
        >
            {/* hidden input */}
            <input
                id={inputId}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) =>
                    handleFileChange(e.target.files[0])
                }
            />

            {/* EMPTY STATE */}
            {!file && (
                <p className="text-sm text-neutral6">
                    Drag & drop or click to upload {label}
                </p>
            )}

            {/* FILE PREVIEW */}
            {file && (
                <div className="flex flex-col items-center gap-3">
                    <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="h-20 w-20 object-cover rounded-md border"
                    />

                    <p className="text-xs text-primary">
                        {file.name}
                    </p>

                    <p className="text-xs text-green-600 font-medium">
                        Uploaded ✓
                    </p>

                    {/* ACTIONS */}
                    <div className="flex gap-2 mt-2">
                        <Button
                            type="button"
                            variant="primary"
                            size="xs"
                            onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById(inputId).click();
                            }}
                        >
                            Replace
                        </Button>

                        <Button
                            type="button"
                            variant="secondaryBorder"
                            size="xs"
                            onClick={handleRemove}
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}