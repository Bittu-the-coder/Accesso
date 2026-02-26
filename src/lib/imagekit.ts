import ImageKit from '@imagekit/nodejs';

// Lazy-initialize ImageKit to avoid build-time crashes with missing/invalid env vars
let _imagekit: ImageKit | null = null;

function getImageKit(): ImageKit {
  if (!_imagekit) {
    _imagekit = new ImageKit({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    });
  }
  return _imagekit;
}

export async function uploadFileToImageKit(
  file: Buffer,
  fileName: string,
  folder: string = 'accesso-files'
): Promise<{ url: string; fileId: string }> {
  const uploadResponse = await getImageKit().files.upload({
    file: file.toString('base64'),
    fileName,
    folder,
    useUniqueFileName: true,
  });

  return {
    url: uploadResponse.url!,
    fileId: uploadResponse.fileId!,
  };
}

export async function deleteFileFromImageKit(fileId: string): Promise<void> {
  await getImageKit().files.delete(fileId);
}

export function getImageKitAuthParams() {
  return getImageKit().helper.getAuthenticationParameters();
}
