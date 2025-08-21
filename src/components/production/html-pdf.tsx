import { Document, Page } from '@react-pdf/renderer';
import { Html } from 'react-pdf-html';

export const PdfFile = ({ htmlContent }) => {
  return (
    <Document>
      <Page size="A4">
        <Html>{htmlContent}</Html>
      </Page>
    </Document>
  );
};