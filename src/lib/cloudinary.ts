export const uploadPdf = async (blob: Blob) => {
  try {
    console.log("Upload attempt:", {
      cloudName: import.meta.env.VITE_CLOUD_NAME,
      blobSize: blob.size,
      blobType: blob.type
    });

    const formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", "ml_default"); // Replace with your actual preset
    formData.append("resource_type", "raw");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/raw/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    return data.secure_url;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};