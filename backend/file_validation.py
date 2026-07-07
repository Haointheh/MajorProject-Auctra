from fastapi import UploadFile, HTTPException

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def validate_and_read(upload: UploadFile) -> bytes:
    if upload.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type for {upload.filename}. Only JPG and PNG are allowed."
        )

    contents = upload.file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"{upload.filename} is too large. Max size is 5MB."
        )

    return contents