/** Learning-goal names shown in the arena. The source chapter number remains available for reference. */
export const kTrainingModuleNames: Record<string, string> = {
  'foundation-cpp-basics': 'C++ 起跑線：讀寫、型別與控制流程',
  'foundation-algorithm-beauty': '演算法思維：複雜度、函式與遞迴',
  'foundation-linear-list': '線性結構：陣列、鏈結串列、堆疊與佇列',
  'foundation-tree': '樹的第一課：表示、走訪與二元搜尋樹',
  'foundation-graph': '圖論起步：建圖、BFS 與 DFS',
  'foundation-algorithm-intro': '解題基本功：貪心、分治與區間技巧',
  'foundation-basic-math': '競程數學：位元、質數、GCD 與快速冪',
  'foundation-big-integer': '突破整數上限：高精度四則運算',
  'foundation-search': '搜尋入門：二分、列舉與剪枝',
  'foundation-dp': '動態規劃起步：狀態、轉移與背包',
  'strengthening-stl': 'STL 工具箱：容器、迭代器與演算法',
  'strengthening-practical-data-structures': '區間資料結構：並查集、樹狀陣列與線段樹',
  'strengthening-searching': '快速查找：雜湊、Trie 與字串比對',
  'strengthening-balanced-trees': '平衡搜尋樹：Treap、Splay 與替罪羊樹',
  'strengthening-graph-advanced': '圖論強化：最短路、生成樹與拓樸排序',
  'strengthening-graph-algorithms': '圖的結構分析：連通分量、LCA 與差分約束',
  'strengthening-search-advanced': '搜尋強化：啟發式、雙向與疊代加深',
  'strengthening-dp': '動態規劃強化：區間、樹形與狀態壓縮',
  'strengthening-advanced-math': '數論與賽局：同餘、組合與必勝策略',
  'advanced-data-structures': '離線資料結構：分塊、莫隊與 CDQ 分治',
  'advanced-string-algorithms': '字串進階：AC 自動機、後綴結構與回文樹',
  'advanced-tree-operations': '樹上分治：樹鏈剖分、點分治與邊分治',
  'advanced-complex-trees': '動態樹結構：KD 樹、左偏樹與 LCT',
  'advanced-persistent-data-structures': '保存歷史版本：可持久化線段樹與 Trie',
  'advanced-graph-algorithms': '流與匹配：最大流、最小割與帶權匹配',
  'advanced-dp': '進階動態規劃：背包整合與換根技巧',
  'advanced-complex-dp': 'DP 極限優化：數位、插頭、斜率與四邊形',
  'advanced-math': '高階數論：FFT、NTT、莫比烏斯反演與篩法'
};

const kTerminology: Array<[RegExp, string]> = [
  [/數據/g, '資料'],
  [/字符串/g, '字串'],
  [/字符/g, '字元'],
  [/數組/g, '陣列'],
  [/算法/g, '演算法'],
  [/搜索/g, '搜尋'],
  [/查找/g, '查詢'],
  [/遍歷/g, '走訪'],
  [/創建/g, '建立'],
  [/循環/g, '迴圈'],
  [/函數/g, '函式'],
  [/棧/g, '堆疊'],
  [/隊列/g, '佇列'],
  [/指針/g, '指標'],
  [/鏈表/g, '鏈結串列'],
  [/哈夫曼/g, '霍夫曼'],
  [/二叉/g, '二元'],
  [/平衡樹/g, '平衡搜尋樹'],
  [/原理詳解/g, '原理與實作'],
  [/秘籍/g, '解題框架'],
  [/提高/g, '強化'],
  [/高級/g, '高階']
];

/** Convert every legacy heading to the vocabulary used by the redesigned arena. */
export function trainingTopicName(title: string) {
  return kTerminology.reduce((name, [pattern, replacement]) => name.replace(pattern, replacement), title);
}

export function trainingModuleName(id: string, fallback: string) {
  return kTrainingModuleNames[id] ?? trainingTopicName(fallback);
}
