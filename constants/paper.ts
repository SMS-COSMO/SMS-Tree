export const category: { label: string; value: number }[] = [
  { label: '应用数学', value: 1 },
  { label: '建筑与城市研究', value: 2 },
  { label: '艺术', value: 3 },
  { label: '传播和媒体', value: 4 },
  { label: '计算机科学', value: 5 },
  { label: '跨文化研究', value: 6 },
  { label: '天文地理', value: 7 },
  { label: '经济学', value: 8 },
  { label: '教育学', value: 9 },
  { label: '环境科学', value: 10 },
  { label: '生命科学', value: 11 },
  { label: '语言学', value: 12 },
  { label: '文学', value: 13 },
  { label: '医学', value: 14 },
  { label: '物理学与化学', value: 15 },
  { label: '心理学', value: 16 },
  { label: '公共健康', value: 17 },
  { label: '社会学与人类学', value: 18 },
  { label: '体育和运动', value: 19 },
  { label: '科技与工程', value: 20 },
  { label: '其他', value: 0 },
];

export function getCategoryName(id: number | undefined) {
  return getCategory(id)?.label || '其他';
}

export function getCategory(id: number | undefined) {
  return id ? (category.find(x => x.value === id) || null) : null;
}
