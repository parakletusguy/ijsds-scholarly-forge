  import { Document, Page, StyleSheet, Font } from '@react-pdf/renderer';
  import { Html } from 'react-pdf-html';

//   Font.register({
//   family: 'Roboto',
//   fonts: [
//     { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/1.0.0/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
//     { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/1.0.0/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
//     { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/1.0.0/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
//     { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/1.0.0/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
//   ],
// });

const styles = StyleSheet.create({
  page: {
    // A4 dimensions are ~595pt x 842pt. Padding creates the margins.
    paddingTop: 72,   // 1 inch from top (72 points/inch)
    paddingBottom: 72, // 1 inch from bottom
    paddingLeft: 72,   // 1 inch from left
    paddingRight: 72,  // 1 inch from right
    // fontFamily: 'Roboto', // Set a default font for the entire page
    fontSize: 12,        // Default font size
    // lineHeight: 1,     // Standard line height for readability
    color: '#333333',    // Default text color, common for documents
  },
  // You can define additional styles here for more specific elements
  // react-pdf-html will try to map your HTML styles to these if they exist,
  // // or use the HTML's inline styles/embedded <style> tags.
  // h1: { fontSize: 24, marginBottom: 16, fontWeight: 'bold' },
  // h2: { fontSize: 20, marginBottom: 14, fontWeight: 'bold' },
  // h3: { fontSize: 16, marginBottom: 12, fontWeight: 'bold' },
  // p: { marginBottom: 10 }, // Paragraph spacing
  // ul: { marginBottom: 10 },
  // ol: { marginBottom: 10 },
  // li: { marginBottom: 5 },
  // table: { marginBottom: 15, borderCollapse: 'collapse' },
  // th: { backgroundColor: '#f2f2f2', padding: 8, border: '1pt solid #cccccc', fontWeight: 'bold' },
  // td: { padding: 8, border: '1pt solid #cccccc' },
});


  export const PdfFile = ({ htmlContent }) => {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Html>{htmlContent}</Html>
        </Page>
      </Document>
    );
  };