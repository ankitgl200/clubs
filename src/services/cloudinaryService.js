// ==============================================================================
// CLOUDINARY AVATAR UPLOAD SERVICE
// Handles direct unsigned client-side uploads and responsive image optimization
// ==============================================================================

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dozmmguxw';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'club_avatars';

export const cloudinaryService = {
  /**
   * Upload an avatar image file directly to Cloudinary
   * @param {File} file - Browser File object
   * @returns {Promise<{ url: string, publicId: string }>}
   */
  async uploadAvatar(file) {
    if (!file) throw new Error('No file provided for upload.');

    // Validate type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file (PNG, JPG, WEBP).');
    }

    // Validate size (max 8MB for avatars)
    if (file.size > 8 * 1024 * 1024) {
      throw new Error('Avatar image must be smaller than 8 MB.');
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'club_collection/avatars');

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData?.error?.message ||
        `Upload failed with status ${response.status}. Please check your Cloudinary preset.`
      );
    }

    const data = await response.json();

    // Generate optimized, face-centered square avatar URL
    // Applies auto format, auto quality, face-gravity fill
    const optimizedUrl = data.secure_url.replace(
      '/upload/',
      '/upload/c_fill,g_face,w_300,h_300,q_auto,f_auto/'
    );

    return {
      url: optimizedUrl,
      rawUrl: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      bytes: data.bytes,
    };
  },

  /**
   * Upload a club logo to Cloudinary with automatic deletion of previous logo
   * @param {File} file - Browser File object
   * @param {string} oldPublicId - Optional public ID of previous logo to delete
   */
  async uploadClubLogo(file, oldPublicId = null) {
    if (!file) throw new Error('No logo file provided.');
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file (PNG, JPG, WEBP, SVG).');
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new Error('Logo file size must be less than 8 MB.');
    }

    if (oldPublicId) {
      await this.deleteImage(oldPublicId).catch(() => {});
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'club_collection/logos');

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || 'Failed to upload club logo to Cloudinary.');
    }

    const data = await response.json();
    const optimizedUrl = data.secure_url.replace(
      '/upload/',
      '/upload/c_fill,w_400,h_400,q_auto,f_auto/'
    );

    return {
      url: optimizedUrl,
      rawUrl: data.secure_url,
      publicId: data.public_id,
    };
  },

  /**
   * Upload a club banner header to Cloudinary with automatic deletion of previous banner
   * @param {File} file - Browser File object
   * @param {string} oldPublicId - Optional public ID of previous banner to delete
   */
  async uploadClubBanner(file, oldPublicId = null) {
    if (!file) throw new Error('No banner file provided.');
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file (PNG, JPG, WEBP).');
    }
    if (file.size > 15 * 1024 * 1024) {
      throw new Error('Banner file size must be less than 15 MB.');
    }

    if (oldPublicId) {
      await this.deleteImage(oldPublicId).catch(() => {});
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'club_collection/banners');

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || 'Failed to upload club banner to Cloudinary.');
    }

    const data = await response.json();
    const optimizedUrl = data.secure_url.replace(
      '/upload/',
      '/upload/c_fill,w_1200,h_450,q_auto,f_auto/'
    );

    return {
      url: optimizedUrl,
      rawUrl: data.secure_url,
      publicId: data.public_id,
    };
  },

  /**
   * Safely request deletion/replacement of old Cloudinary assets
   * @param {string} publicId
   */
  async deleteImage(publicId) {
    if (!publicId) return;
    try {
      const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`;
      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('upload_preset', UPLOAD_PRESET);
      await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
    } catch (e) {
      console.warn('Cloudinary cleanup attempt:', e);
    }
  },
};
