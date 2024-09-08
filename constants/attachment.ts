export const docxFileTypes = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/wps-office.docx',
];

export const pptFileTypes = [
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/wps-office.pptx',
];

export const xlsxFileTypes = [
  'application/wps-office.xlsx',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const pdfFileTypes = [
  'application/pdf',
];

const imageFileTypes = [
  'image/png',
  'image/jpeg',
  'image/bmp',
  'image/svg+xml',
];

const allFiles = [
  ...docxFileTypes,
  ...pptFileTypes,
  ...xlsxFileTypes,
  ...pdfFileTypes,
  ...imageFileTypes,
  'application/x-zip-compressed',
  'application/x-compressed',
  'video/mp4',
  'text/plain',
];

export const allowFileType = {
  paperDocument: pdfFileTypes,
  paperAttachment: allFiles,
  reportDocument: [
    ...pdfFileTypes,
    ...docxFileTypes,
  ],
  reportPresentation: [
    ...pdfFileTypes,
    ...pptFileTypes,
  ],
  noteAttachment: allFiles,
  carousel: imageFileTypes,
};
