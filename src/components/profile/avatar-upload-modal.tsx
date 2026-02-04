'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import getCroppedImg from '@/lib/canvas-utils';
import { Camera, RotateCcw, RotateCw, X } from 'lucide-react';
import { useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { useTranslation } from 'react-i18next';

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blob: Blob) => Promise<void>;
  currentAvatarUrl?: string;
}

export function AvatarUploadModal({
  isOpen,
  onClose,
  onSave,
  currentAvatarUrl,
}: AvatarUploadModalProps) {
  const { t } = useTranslation('profile');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
      // Reset state
      setZoom(1);
      setRotation(0);
      setCrop({ x: 0, y: 0 });
    }
  };

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setLoading(true);
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      if (croppedImage) {
        await onSave(croppedImage);
        handleClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    setZoom(1);
    setRotation(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>{t('upload_avatar')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!imageSrc ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-gray-100">
                <Avatar className="w-full h-full">
                  <AvatarImage
                    src={currentAvatarUrl}
                    className="object-cover"
                  />
                  <AvatarFallback className="w-full h-full">
                    <img
                      src="/avatars/placeholder.png"
                      alt="Placeholder"
                      className="w-full h-full object-cover"
                    />
                  </AvatarFallback>
                </Avatar>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#4aa9f8] hover:bg-[#3d91d6] text-white"
              >
                {currentAvatarUrl ? t('replace_image') : t('choose_image')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative h-64 w-full bg-black rounded-lg overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  cropShape="round"
                  showGrid={false}
                />
              </div>

              <div className="space-y-4 px-2">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-12">{t('zoom')}</span>
                  <Slider
                    value={[zoom]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={(value: number[]) => setZoom(value[0])}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setRotation((r) => r - 90)}
                      title={t('rotate_left')}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setRotation((r) => r + 90)}
                      title={t('rotate_right')}
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setZoom(1);
                        setRotation(0);
                        setCrop({ x: 0, y: 0 });
                      }}
                    >
                      {t('reset')}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t('change_image')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!imageSrc || loading}
            className="bg-[#4aa9f8] hover:bg-[#3d91d6] text-white"
          >
            {loading ? t('saving') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
