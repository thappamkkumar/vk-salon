export   function resizeImage(file: File, maxWidth = 800, quality = 0.7): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scaleFactor = maxWidth / img.width;
      const width = maxWidth;
      const height = img.height * scaleFactor;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas not supported');

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject('Compression failed');
          }
        },
        'image/jpeg',
        quality
      );
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
