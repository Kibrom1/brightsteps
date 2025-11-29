import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiClient } from '../lib/api-client';

interface PropertyImageUploadProps {
  propertyId: number;
  onUploadComplete?: () => void;
}

export function PropertyImageUpload({ propertyId, onUploadComplete }: PropertyImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (fileToUpload: File) => {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      const client = getApiClient();
      // Using direct axios/fetch call pattern or extending client for form data
      // Since our client wrapper might assume JSON, we'll use fetch directly or need a client update
      // For now, assuming standard fetch or axios pattern
      
      // Note: The typed client might need adjustment for FormData, using raw fetch here for simplicity
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/properties/${propertyId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      return response.json();
    },
    onSuccess: () => {
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      if (onUploadComplete) onUploadComplete();
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700">Upload Property Image</label>
      <div className="mt-1 flex items-center space-x-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
        {file && (
          <button
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:opacity-50"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>
      {uploadMutation.isError && (
        <p className="mt-2 text-sm text-red-600">Error uploading image. Please try again.</p>
      )}
    </div>
  );
}

