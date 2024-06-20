import type { CascaderOption } from 'element-plus';

export const categoryCascader: CascaderOption[] = [
  {
    label: '艺术与人文',
    children: [
      { label: '文学', value: 2 },
      { label: '历史', value: 3 },
      { label: '艺术', value: 4 },
      { label: '音乐', value: 5 },
      { label: '哲学', value: 6 },
      { label: '电影、广播、电视', value: 7 },
      { label: '建筑学', value: 8 },
      { label: '经典', value: 9 },
      { label: '舞蹈', value: 10 },
      { label: '戏剧', value: 11 },
      { label: '亚洲研究', value: 12 },
      { label: '宗教', value: 13 },
      { label: '艺术与人文-其他', value: 1 },
    ],
  },
  {
    label: '生命科学与生物医学',
    children: [
      { label: '植物学', value: 21 },
      { label: '动物学', value: 22 },
      { label: '生理学', value: 23 },
      { label: '生物工程学和应用微生物学', value: 24 },
      { label: '生物化学与分子生物学', value: 25 },
      { label: '细胞生物学', value: 26 },
      { label: '环境科学与生态学', value: 27 },
      { label: '遗传学和遗传性', value: 28 },
      { label: '医学', value: 29 },
      { label: '农业', value: 30 },
      { label: '食品科学和技术', value: 31 },
      { label: '生命科学与生物医学-其他', value: 20 },
    ],
  },
  {
    label: '自然科学',
    children: [
      { label: '化学', value: 41 },
      { label: '物理', value: 42 },
      { label: '数学', value: 43 },
      { label: '地质学', value: 44 },
      { label: '天文学和天体物理学', value: 45 },
      { label: '气象学和大气科学', value: 46 },
      { label: '矿物学', value: 47 },
      { label: '海洋学', value: 48 },
      { label: '自然科学-其他', value: 40 },
    ],
  },
  {
    label: '社会科学',
    children: [
      { label: '地理', value: 61 },
      { label: '文化研究', value: 62 },
      { label: '商业与经济学', value: 63 },
      { label: '教育和教学研究', value: 64 },
      { label: '心理学', value: 65 },
      { label: '政府和法律', value: 66 },
      { label: '语言学', value: 67 },
      { label: '女性研究', value: 68 },
      { label: '民族研究', value: 69 },
      { label: '发展研究', value: 70 },
      { label: '人口学', value: 71 },
      { label: '社会学', value: 72 },
      { label: '考古学', value: 73 },
      { label: '通信', value: 74 },
      { label: '社会科学-其他', value: 60 },
    ],
  },
  {
    label: '应用科学',
    children: [
      { label: '计算机科学', value: 81 },
      { label: '工程学', value: 82 },
      { label: '材料科学', value: 83 },
      { label: '机械学', value: 84 },
      { label: '自动化和控制系统', value: 85 },
      { label: '设备和仪器', value: 86 },
      { label: '机器人学', value: 87 },
      { label: '能源和燃料', value: 88 },
      { label: '影像科学和照相技术', value: 89 },
      { label: '运筹学和管理科学', value: 90 },
      { label: '运输', value: 91 },
      { label: '应用科学-其他', value: 80 },
    ],
  },
  {
    label: '其他',
    value: 0,
  },
];

export const category: CascaderOption[] = [
  ...categoryCascader[0].children!, // 艺术与人文
  ...categoryCascader[1].children!, // 生命科学与生物医学
  ...categoryCascader[2].children!, // 自然科学
  ...categoryCascader[3].children!, // 社会科学
  ...categoryCascader[4].children!, // 应用科学
  categoryCascader[5], // 其他
];

export function getCategoryName(id: number | undefined) {
  return getCategory(id)?.label || '其他';
}

export function getCategory(id: number | undefined) {
  return id ? (category.find(x => x.value === id) || null) : null;
}
