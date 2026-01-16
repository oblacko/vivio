import { useMutation } from "@tanstack/react-query";

export interface UploadResponse {
  success: boolean;
  url: string;
  pathname: string;
}

export function useUploadImage() {
  return useMutation<UploadResponse, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }

      return response.json();
    },
  });
}
