export const classStateTable = [
  { value: 'initialized', label: '初始化', type: 'primary' },
  { value: 'selectGroup', label: '选择小组', type: 'success' },
  { value: 'thesisProposal', label: '开题报告', type: 'warning' },
  { value: 'concludingReport', label: '结题报告', type: 'warning' },
  { value: 'submitPaper', label: '提交论文', type: 'danger' },
];

export const classStateNames = [
  '等待分组',
  '选择小组',
  '开题报告',
  '结题报告',
  '提交论文',
];

export const classStateIcons = [
  'i-tabler-clock',
  'i-tabler:users',
  'i-tabler:presentation',
  'i-tabler:presentation-analytics',
  'i-tabler:file-upload',
];

export const classStateSteps = [
  'initialized', // 初始化
  'selectGroup', // 选择小组
  'thesisProposal', // 开题报告
  'concludingReport', // 结题报告
  'submitPaper', // 提交论文
];
