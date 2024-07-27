const allFiles = [
  'application/pdf',
  'application/msword',
  'application/wps-office.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'video/mp4',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/x-zip-compressed',
  'image/bmp',
  'application/x-compressed',
  'application/vnd.ms-excel',
  'application/wps-office.xlsx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const allowFileType = {
  paperDocument: [
    'application/pdf',
  ],
  paperAttachment: allFiles,
  reportDocument: [
    'application/pdf',
  ],
  reportPresentation: [
    'application/pdf',
  ],
  noteAttachment: allFiles,
};
