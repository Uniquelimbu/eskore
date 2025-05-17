/**
 * Export formation as PNG image
 */
export const exportAsPNG = async (element, get) => {
  if (!element) {
    console.error('No element provided for export');
    return;
  }

  try {
    // Dynamically import html2canvas to avoid bundling it unless needed
    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default;

    // Convert the DOM element to a canvas
    const canvas = await html2canvas(element, {
      backgroundColor: '#006341', // Match the pitch color
      scale: 2, // Higher quality
      logging: false,
      useCORS: true, // Allow images from other domains
    });
    
    // Convert canvas to data URL
    const dataURL = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    const formattedDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    link.download = `formation-${get().preset}-${formattedDate}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Formation exported successfully');
  } catch (error) {
    console.error('Failed to export formation as PNG:', error);
    // Show a user-friendly error message
    alert('Failed to export formation. Please try again later.');
  }
};
