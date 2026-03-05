import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase';
import toast from 'react-hot-toast';

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

  const headerBtnCls = "flex items-center justify-center w-9 h-9 border-none bg-transparent rounded-full cursor-pointer text-[var(--color-text-secondary,#64748b)] transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-[#2D2A35] dark:hover:text-[#E2D9F3]";
  const btnPrimaryCls = "inline-flex items-center justify-center gap-2 py-[11px] px-5 border-none rounded-[10px] text-[0.88rem] font-semibold cursor-pointer transition-all duration-200 bg-gradient-to-br from-violet-700 to-violet-500 text-white shadow-[0_2px_8px_rgba(109,40,217,0.3)] hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_4px_14px_rgba(109,40,217,0.4)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none [&_svg]:w-[18px] [&_svg]:h-[18px]";
  const btnGhostCls = "inline-flex items-center justify-center gap-2 py-[11px] px-5 rounded-[10px] text-[0.88rem] font-semibold cursor-pointer transition-all duration-200 bg-slate-100 dark:bg-[#2D2A35] text-slate-600 dark:text-[#9E95A8] border border-[var(--color-border,#e2e8f0)] dark:border-[#3b3670] hover:not-disabled:bg-[var(--color-border,#e2e8f0)] dark:hover:not-disabled:bg-[#3b3670] [&_svg]:w-[18px] [&_svg]:h-[18px]";
  const btnDangerCls = "inline-flex items-center justify-center gap-2 py-[11px] px-5 rounded-[10px] text-[0.88rem] font-semibold cursor-pointer transition-all duration-200 bg-transparent text-red-500 dark:text-red-400 border border-red-500/30 dark:border-red-400/25 hover:not-disabled:bg-red-500/[0.08] hover:not-disabled:border-red-500/50 [&_svg]:w-[18px] [&_svg]:h-[18px]";

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-[6px] flex items-center justify-center z-[1100] p-6 animate-[g-fadeIn_0.15s_ease] max-[480px]:p-0 max-[480px]:items-end" onClick={handleClose}>
      <div className="bg-[var(--color-bg,#ffffff)] dark:bg-[#1E1B24] dark:border dark:border-[#2D2A35] rounded-2xl max-w-[460px] w-full overflow-hidden animate-[g-fadeInScale_0.2s_ease] shadow-[0_25px_60px_rgba(0,0,0,0.3)] max-[480px]:max-w-full max-[480px]:rounded-b-none max-[480px]:max-h-[95dvh] max-[480px]:pb-[env(safe-area-inset-bottom,0px)]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center gap-3 py-4 px-5 border-b border-[var(--color-border,#e2e8f0)] dark:border-[#2D2A35]">
          {step === 'crop' && (
            <button className={headerBtnCls} onClick={handleBack} type="button">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
          )}
          <h2 className="flex-1 text-[1.1rem] font-bold text-[var(--color-text,#0f172a)] dark:text-[#E2D9F3] m-0">{step === 'select' ? 'Profile Photo' : 'Crop Photo'}</h2>
          <button className={`${headerBtnCls} ml-auto`} onClick={handleClose} type="button">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
          </button>
        </div>

        {/* Step 1: Select */}
        {step === 'select' && (
          <div className="flex flex-col items-center py-8 px-6 gap-6">
            {/* Current preview */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-br from-violet-700 via-purple-400 to-pink-500 flex items-center justify-center max-[480px]:w-[130px] max-[480px]:h-[130px]">
                {currentPhotoUrl ? (
                  <img src={currentPhotoUrl} alt="Current profile" className="w-full h-full rounded-full object-cover border-[3px] border-[var(--color-bg,#fff)] dark:border-[#1E1B24]" />
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-100 dark:bg-[#2D2A35] border-[3px] border-[var(--color-bg,#fff)] dark:border-[#1E1B24] flex items-center justify-center text-slate-400 dark:text-[#6b6580] [&_svg]:w-12 [&_svg]:h-12">
                    <CameraIcon />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full max-w-[260px]">
              <label className={btnPrimaryCls}>
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
                  className={btnDangerCls}
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                  type="button"
                >
                  <TrashIcon />
                  <span>{uploading ? 'Removing...' : 'Remove Photo'}</span>
                </button>
              )}
            </div>

            <p className="text-[0.78rem] text-slate-400 m-0">
              JPG, PNG or WebP · Max 10MB
            </p>
          </div>
        )}

        {/* Step 2: Crop */}
        {step === 'crop' && imageSrc && (
          <div className="flex flex-col">
            <div className="relative w-full h-[350px] bg-[#0a0a0a] max-[480px]:h-[300px]">
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
            <div className="flex items-center gap-3 py-4 px-6 border-t border-[var(--color-border,#e2e8f0)] dark:border-[#2D2A35] [&_svg]:text-slate-400 dark:![&_svg]:text-[#6b6580] [&_svg]:shrink-0">
              <ZoomOutIcon />
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="flex-1 appearance-none h-1 bg-[var(--color-border,#e2e8f0)] dark:bg-[#2D2A35] rounded outline-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-violet-700 [&::-webkit-slider-thumb]:to-violet-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.2)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:hover:scale-[1.15]"
              />
              <ZoomInIcon />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 py-3.5 px-5 border-t border-[var(--color-border,#e2e8f0)] dark:border-[#2D2A35]">
              <button
                className={btnGhostCls}
                onClick={handleBack}
                disabled={uploading}
                type="button"
              >
                Cancel
              </button>
              <button
                className={btnPrimaryCls}
                onClick={handleSave}
                disabled={uploading || !croppedAreaPixels}
                type="button"
              >
                {uploading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
