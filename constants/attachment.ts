const allFiles = [
  'application/pdf',
  'application/msword',
  'application/wps-office.docx',
  'application/wps-office.xlsx',
  'application/wps-office.pptx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.ms-excel',
  'application/x-zip-compressed',
  'application/x-compressed',
  'image/png',
  'image/jpeg',
  'image/bmp',
  'image/svg+xml',
  'video/mp4',
  'text/plain',
];

export const allowFileType = {
  paperDocument: [
    'application/pdf',
  ],
  paperAttachment: allFiles,
  reportDocument: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/wps-office.docx',
  ],
  reportPresentation: [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/wps-office.pptx',
  ],
  noteAttachment: allFiles,
  carousel: [
    'image/png',
    'image/jpeg',
    'image/bmp',
    'image/svg+xml',
  ],
};
