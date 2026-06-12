/**
 * Shared utility to open file data (e.g., base64 data URLs) in a new browser tab as a preview.
 * This helper automatically handles converting base64 data to blob URLs to bypass modern
 * browser restrictions which block direct top-level navigation to "data:" URLs.
 */
export const openFilePreview = (fileData: string | undefined, fileName: string) => {
  if (!fileData) {
    alert("Data berkas tidak ditemukan.");
    return;
  }

  try {
    // Check if it is a Base64 Data URL
    if (fileData.startsWith('data:')) {
      const parts = fileData.split(',');
      if (parts.length < 2) {
        throw new Error("Format data URL tidak valid");
      }
      
      const mimeMatch = parts[0].match(/data:(.*?);/);
      const contentType = mimeMatch ? mimeMatch[1] : 'application/pdf';
      const base64Data = parts[1];
      
      // Decode base64 to byte array
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: contentType });
      
      // Create Object URL
      const blobUrl = URL.createObjectURL(blob);
      
      // Open a new browser tab with the temporary blob URL
      const newWin = window.open(blobUrl, '_blank');
      if (!newWin) {
        alert("Pop-up preview terblokir! Silakan izinkan pop-up pada peramban Anda untuk melihat berkas secara langsung.");
      }
    } else {
      // Regular absolute/relative path or URL
      const newWin = window.open(fileData, '_blank');
      if (!newWin) {
        alert("Pop-up preview terblokir! Silakan izinkan pop-up pada peramban Anda.");
      }
    }
  } catch (err) {
    console.error("Error while generating document preview:", err);
    // Fallback: try direct window.open
    try {
      const newWin = window.open(fileData, '_blank');
      if (!newWin) {
        alert("Gagal membuka berkas. Silakan coba mengunduh berkas secara langsung.");
      }
    } catch (fallbackErr) {
      alert("Gagal memuat preview berkas ini.");
    }
  }
};
