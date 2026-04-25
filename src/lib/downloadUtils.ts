const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const handleFileDownload = async (fileUrl: string, title?: string, articleId?: string) => {
  if (!fileUrl && !articleId) return;

  try {
    // Resolve latest version from backend when articleId is supplied
    let resolvedUrl = fileUrl;
    if (articleId) {
      try {
        const res = await fetch(`${API_URL}/api/files/${articleId}/latest`);
        const json = await res.json();
        if (json.success && json.data?.file_url) resolvedUrl = json.data.file_url;
      } catch { /* fall through to fileUrl */ }
    }
    if (!resolvedUrl) return;

    // Extract real extension from URL (pdf, docx, doc) — never assume .pdf
    const urlPath = resolvedUrl.split('?')[0];
    const urlExt = urlPath.split('.').pop()?.toLowerCase() || 'pdf';
    const safeExt = ['pdf', 'doc', 'docx'].includes(urlExt) ? urlExt : 'pdf';

    const filename = title
      ? `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${safeExt}`
      : urlPath.split('/').pop() || `download.${safeExt}`;

    let finalUrl = resolvedUrl;

    // Cloudinary specific fix for forced download
    if (resolvedUrl.includes('cloudinary.com') && !resolvedUrl.includes('fl_attachment')) {
      const parts = resolvedUrl.split('/upload/');
      if (parts.length === 2) {
        finalUrl = `${parts[0]}/upload/fl_attachment/${parts[1]}`;
      }
    }
    // Supabase specific fix
    else if (resolvedUrl.includes('supabase.co/storage')) {
      const downloadUrl = new URL(resolvedUrl);
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
    window.open(fileUrl, '_blank');
  }
};
