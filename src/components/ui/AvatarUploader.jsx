import React, { useState, useRef } from 'react';
import { cloudinaryService } from '../../services/cloudinaryService';
import { Camera, Loader2, Check, AlertCircle, X } from 'lucide-react';

export default function AvatarUploader({
  currentAvatarUrl,
  onUploadSuccess,
  size = 'md', // 'sm' | 'md' | 'lg'
  label = 'Add Profile Photo',
  optional = true,
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentAvatarUrl || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    // Local instant preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const result = await cloudinaryService.uploadAvatar(file);
      setPreview(result.url);
      if (onUploadSuccess) {
        onUploadSuccess(result.url, result.publicId);
      }
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      setError(err.message || 'Upload failed');
      // Revert preview on error
      setPreview(currentAvatarUrl || '');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onUploadSuccess) onUploadSuccess('', '');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        {/* Avatar Circle Preview with Camera Overlay */}
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative ${sizeClasses[size] || sizeClasses.md} rounded-full overflow-hidden border-2 border-brand-500/40 dark:border-brand-500/50 cursor-pointer group shadow-md flex-shrink-0 bg-slate-100 dark:bg-navy-800 transition-all hover:ring-4 hover:ring-brand-500/20`}
          title="Click to choose a photo"
        >
          {preview ? (
            <img
              src={preview}
              alt="Avatar Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-navy-900">
              <Camera className="w-6 h-6" />
            </div>
          )}

          {/* Hover overlay or Loading overlay */}
          <div className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center transition-opacity ${
            uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            {uploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-white" />
            )}
          </div>
        </div>

        {/* Text Actions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-500/20 text-xs font-semibold border border-brand-200 dark:border-brand-500/30 transition-all flex items-center gap-1.5"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading to Cloudinary...</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span>{preview ? 'Change Photo' : label}</span>
                </>
              )}
            </button>

            {preview && !uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {optional ? '(Optional) ' : ''}Auto-optimized & face-centered via Cloudinary.
          </p>

          {error && (
            <div className="flex items-center gap-1.5 text-rose-500 text-xs mt-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
