export const handleFileDownload = async (fileUrl: string, title?: string) => {
  if (!fileUrl) return;

  try {
    // Extract real extension from URL (pdf, docx, doc) — never assume .pdf
    const urlPath = fileUrl.split('?')[0];
    const urlExt = urlPath.split('.').pop()?.toLowerCase() || 'pdf';
    const safeExt = ['pdf', 'doc', 'docx'].includes(urlExt) ? urlExt : 'pdf';

    const filename = title
      ? `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${safeExt}`
      : urlPath.split('/').pop() || `download.${safeExt}`;

    let finalUrl = fileUrl;

    // Cloudinary specific fix for forced download
    if (fileUrl.includes('cloudinary.com') && !fileUrl.includes('fl_attachment')) {
      const parts = fileUrl.split('/upload/');
      if (parts.length === 2) {
        finalUrl = `${parts[0]}/upload/fl_attachment/${parts[1]}`;
      }
    } 
    // Supabase specific fix
    else if (fileUrl.includes('supabase.co/storage')) {
      const downloadUrl = new URL(fileUrl);
      downloadUrl.searchParams.set('download', filename);
      finalUrl = downloadUrl.toString();
    }

    // Direct link click bypasses CORS fetch issues and popup blockers 
    // since it runs in the same tick as the user's click event.
    const link = document.createElement('a');
    link.href = finalUrl;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error('Download failed:', error);
    // Fallback to opening in new tab
    window.open(fileUrl, '_blank');
  }
};
