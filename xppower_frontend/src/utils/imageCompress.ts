/**
 * Thu nhỏ và nén ảnh ngay trên trình duyệt trước khi upload.
 * Ảnh chụp từ điện thoại thường 3-12MB; sau khi nén còn khoảng 200-500KB nên upload nhanh
 * (kể cả 4G) và không bao giờ vượt giới hạn 5MB của backend.
 */

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Không đọc được ảnh'));
    img.src = url;
  });

export async function compressImage(file: File, maxSide = 1600, quality = 0.82): Promise<File> {
  if (file.type === 'image/gif') return file; // giữ nguyên ảnh động

  const url = URL.createObjectURL(file);
  try {
    // Trình duyệt tự xoay ảnh đúng chiều theo EXIF (ảnh chụp dọc từ điện thoại)
    const img = await loadImage(url);
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.fillStyle = '#fff'; // ảnh PNG trong suốt -> nền trắng thay vì đen khi chuyển sang JPEG
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return file;

    // Ảnh JPEG đã nhỏ sẵn và không cần thu nhỏ thì giữ bản gốc, tránh nén lại làm giảm chất lượng
    if (scale === 1 && file.type === 'image/jpeg' && blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(url);
  }
}