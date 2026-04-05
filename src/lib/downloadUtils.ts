export const handleFileDownload = async (fileUrl: string, title?: string) => {
  if (!fileUrl) return;

  try {
    const filename = title 
      ? `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
      : fileUrl.split('/').pop()?.split('?')[0] || 'download.pdf';

    // If it's a Supabase storage URL, we can append ?download=filename to force download
    if (fileUrl.includes('supabase.co/storage')) {
      const downloadUrl = new URL(fileUrl);
      downloadUrl.searchParams.set('download', filename);
      
      const link = document.createElement('a');
      link.href = downloadUrl.toString();
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Fallback for non-supabase URLs
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    }
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback to opening in new tab
    window.open(fileUrl, '_blank');
  }
};
