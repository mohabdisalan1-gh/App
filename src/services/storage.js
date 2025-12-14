import axios from 'axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export function uploadFile(file, path, onProgress) {
    return new Promise(async (resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        // Optional: you can add 'public_id' or 'folder' if you want to organize it in Cloudinary
        // formData.append('folder', path); // Cloudinary folders

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (progressEvent) => {
                        if (onProgress) {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            onProgress(percentCompleted);
                        }
                    }
                }
            );

            resolve({
                url: response.data.secure_url,
                path: response.data.public_id, // Store public_id as path for potential deletion later
                name: response.data.original_filename,
                size: response.data.bytes,
                type: response.data.format // Cloudinary returns format e.g. "pdf"
            });
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
        }
    });
}

export async function deleteFileFromStorage(publicId) {
    // Client-side delete often requires a signature. 
    // Without a backend signature, we cannot securely delete from client-side using unsigned presets.
    // For now, we will log a warning.
    console.warn("Client-side deletion is restricted. File not deleted from Cloud:", publicId);
    return Promise.resolve();
}
