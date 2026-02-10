import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase';
import toast from 'react-hot-toast';
import './ProfilePhotoCropModal.css';

/**
 * getCroppedImg — takes an image source + crop pixels and returns a Blob
 */
async function getCroppedImg(imageSrc, pixelCrop, outputSize = 400) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');

  // Draw circular clip
  ctx.beginPath();
  ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (e) => reject(e));
    image.crossOrigin = 'anonymous';
    image.src = url;
  });
}

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" />
    <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
  </svg>
);

const ZoomInIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z" />
  </svg>
);

const ZoomOutIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

const ProfilePhotoCropModal = ({ isOpen, onClose, onSave, userId, currentPhotoUrl }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState('select'); // 'select' | 'crop'

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type & size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result);
      setStep('crop');
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const deleteOldPhoto = async (photoUrl) => {
    if (!photoUrl) return;
    try {
      // Extract the storage path from the Firebase download URL
      const url = new URL(photoUrl);
      // Firebase Storage URLs encode the path after /o/ and before ?
      const pathMatch = url.pathname.match(/\/o\/(.+)/);
      if (pathMatch) {
        const storagePath = decodeURIComponent(pathMatch[1]);
        const oldRef = ref(storage, storagePath);
        await deleteObject(oldRef);
      }
    } catch (err) {
      // Don't block the upload if deletion fails (file may already be gone)
      console.warn('Could not delete old photo:', err.message);
    }
  };

  const handleSave = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    setUploading(true);
    try {
      // 1. Crop the image
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, 400);

      // 2. Upload to Firebase Storage
      const fileName = `profile-photos/${userId}-${Date.now()}.jpg`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, croppedBlob, {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=31536000',
      });

      // 3. Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // 4. Delete old photo from storage
      await deleteOldPhoto(currentPhotoUrl);

      // 5. Notify parent
      await onSave(downloadURL);
      toast.success('Profile photo updated!');
      handleClose();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentPhotoUrl) return;
    setUploading(true);
    try {
      // Delete from Firebase Storage
      await deleteOldPhoto(currentPhotoUrl);
      // Clear the URL in the backend
      await onSave('');
      toast.success('Profile photo removed');
      handleClose();
    } catch {
      toast.error('Failed to remove photo');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    setStep('select');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    onClose();
  };

  const handleBack = () => {
    setImageSrc(null);
    setStep('select');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  if (!isOpen) return null;

  return (
    <div className="ppc-overlay" onClick={handleClose}>
      <div className="ppc-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="ppc-modal__header">
          {step === 'crop' && (
            <button className="ppc-modal__back" onClick={handleBack} type="button">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
          )}
          <h2>{step === 'select' ? 'Profile Photo' : 'Crop Photo'}</h2>
          <button className="ppc-modal__close" onClick={handleClose} type="button">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
          </button>
        </div>

        {/* Step 1: Select */}
        {step === 'select' && (
          <div className="ppc-select">
            {/* Current preview */}
            <div className="ppc-select__preview">
              <div className="ppc-select__avatar-ring">
                {currentPhotoUrl ? (
                  <img src={currentPhotoUrl} alt="Current profile" className="ppc-select__avatar-img" />
                ) : (
                  <div className="ppc-select__avatar-fallback">
                    <CameraIcon />
                  </div>
                )}
              </div>
            </div>

            <div className="ppc-select__actions">
              <label className="ppc-btn ppc-btn--primary">
                <CameraIcon />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  hidden
                />
              </label>

              {currentPhotoUrl && (
                <button
                  className="ppc-btn ppc-btn--danger"
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                  type="button"
                >
                  <TrashIcon />
                  <span>{uploading ? 'Removing...' : 'Remove Photo'}</span>
                </button>
              )}
            </div>

            <p className="ppc-select__hint">
              JPG, PNG or WebP · Max 10MB
            </p>
          </div>
        )}

        {/* Step 2: Crop */}
        {step === 'crop' && imageSrc && (
          <div className="ppc-crop">
            <div className="ppc-crop__area">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom Slider */}
            <div className="ppc-crop__controls">
              <ZoomOutIcon />
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="ppc-crop__slider"
              />
              <ZoomInIcon />
            </div>

            {/* Actions */}
            <div className="ppc-crop__actions">
              <button
                className="ppc-btn ppc-btn--ghost"
                onClick={handleBack}
                disabled={uploading}
                type="button"
              >
                Cancel
              </button>
              <button
                className="ppc-btn ppc-btn--primary"
                onClick={handleSave}
                disabled={uploading || !croppedAreaPixels}
                type="button"
              >
                {uploading ? (
                  <>
                    <span className="ppc-spinner" />
                    Uploading...
                  </>
                ) : (
                  'Apply'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePhotoCropModal;
