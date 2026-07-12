import type { TrainingCampModule } from './trainingCamp';

// 提升營：STL、實用資料結構、查找與字串、平衡樹、圖論提高、搜尋提高、DP 提升與進階數論。

export const strengtheningModules: TrainingCampModule[] = [
  {
    id: 'strengthening-stl',
    sourceChapter: 1,
    title: 'STL',
    leetcodeProblemIds: [
      'heap-lc-23',
      'heap-lc-295',
      'int-lc-218',
      'heap-003',
      'lc-641',
      'lc0x3f-2558',
      'lc-703',
      'lc-2166',
      'lc-2215',
      'lc-692',
      'lc0x3f-373',
      'lc-146'
    ],
    topics: [
      {
        title: 'deque（雙端隊列）',
        summary: '兩端都能 O(1) 增刪的序列，且支援隨機存取。是單調隊列、滑動窗口最值的底層容器。',
        code: `// deque（雙端隊列）: 兩端操作都是 O(1)。
deque<int> dq;
dq.push_back(1);    // 尾端插入
dq.push_front(0);   // 頭端插入：底層是分段連續記憶體（非單一連續陣列），所以頭尾插入都不需要搬移其他元素
int f = dq.front(), b = dq.back();  // read both ends
dq.pop_front();
dq.pop_back();`,
        complexity: '兩端操作 O(1)'
      },
      {
        title: 'priority_queue（優先隊列）',
        summary:
          '二元堆，堆頂為極值。預設是大根堆；要小根堆用 greater 或存負值。自訂比較器語意與 sort 相反：回傳 true 表示「優先級較低」。',
        code: `// priority_queue（優先隊列）: greater<> 把預設大根堆改成小根堆。
priority_queue<int> max_heap;                         // max-heap：預設用 less<>，堆頂放「最大」的元素
priority_queue<int, vector<int>, greater<>> min_heap; // min-heap：換成 greater<> 後堆頂放「最小」的元素
min_heap.push(3);
min_heap.push(1);
int mn = min_heap.top();   // O(1) 讀出目前最小值
min_heap.pop();             // O(log n) 移除堆頂，並讓次小值浮上來`,
        complexity: 'push/pop O(log n)，top O(1)'
      },
      {
        title: 'bitset（位圖）',
        summary:
          '把布林陣列壓成位元，空間省 32/64 倍、位運算並行加速。大小是編譯期常數，不能用執行期變數當模板參數。',
        children: [
          {
            title: '定義與初始化',
            summary: '以固定長度宣告，可由整數或字串初始化。',
            code: `// 定義與初始化: 大小是模板參數，編譯期就固定，因此不能用變數 n 當 bitset<n>。
bitset<1000> b;          // all zeros，預設每個位元初始化為 0
bitset<8> c(0b1010);     // from integer：8 個位元中對應二進位 1010 的位置是 1
bitset<8> d("1100");     // from string：字串的最左字元對應最高位（下標較大的位元）`
          },
          {
            title: '基本操作',
            summary:
              'set/reset/flip 單位或全體，count() 數 1，test(i) 查位，並支援 & | ^ << >> 做集合運算，常數極小。',
            code: `// 基本操作: 每個位元運算都同時作用在整組（通常 64 位元）字組上，遠比逐一元素判斷快。
b.set(3);      // 把第 3 位設成 1
b.reset(0);    // 把第 0 位設成 0
b.flip();      // 全部位元翻轉（0 變 1、1 變 0）
int ones = b.count();          // 數 1 的個數，內部用硬體 popcount 指令，遠比逐位掃描快
bitset<1000> inter = x & y;   // set intersection：把「集合」編碼成位元後，交集直接用 & 一次算完整個集合`
          }
        ]
      },
      {
        title: 'set、multiset（集合、多重集合）',
        summary:
          '紅黑樹實作的有序集合，增刪查皆 O(log n)。set 去重、multiset 允許重複。務必用「成員函數」lower_bound/upper_bound（O(log n)），別用 std::lower_bound（對 set 退化 O(n)）。',
        code: `// set、multiset（集合、多重集合）: 底層是紅黑樹，元素始終保持有序，走訪時就是遞增序列。
set<int> s = {1, 4, 9};
s.insert(5);                  // 插入後仍保持整體有序：{1, 4, 5, 9}
auto it = s.lower_bound(5);   // first element that is >= 5：這裡用成員函式而非 std::lower_bound，才是 O(log n)
multiset<int> ms; ms.insert(2); ms.insert(2);   // multiset 允許重複值，這裡會存進兩個 2
if (auto it2 = ms.find(2); it2 != ms.end()) {   // C++17 if-init 語法，把查詢結果的作用域限制在 if 內
    ms.erase(it2);            // erase only one; erase(key) removes all duplicates
}`,
        complexity: 'O(log n) 每次操作'
      },
      {
        title: 'map、multimap（映射、多重映射）',
        summary:
          '有序鍵值對，按鍵排序，增刪查 O(log n)。map[k] 存取不存在的鍵會「自動插入」預設值，只想查詢請用 count/find。追求速度且不需有序時改 unordered_map（平均 O(1)）。',
        code: `// map、multimap（映射、多重映射）: operator[] 具有「不存在就自動插入預設值」的副作用，只想查詢時千萬別用它。
map<string, int> cnt;
cnt["apple"]++;               // inserts 0 then increments if the key was absent
if (cnt.contains("banana")) { /* C++20 membership test：純查詢用 contains/find，不會意外插入新鍵 */ }
for (auto& [k, v] : cnt) {   // map 內部按鍵排序，走訪順序就是鍵的遞增序
    cout << k << ' ' << v << '\\n';
}`,
        complexity: 'O(log n) 每次操作'
      },
      {
        title: 'STL 中的常用函數',
        summary: '一批高頻演算法函數，熟練後能省下大量手寫程式。',
        children: [
          {
            title: 'fill()',
            summary: '把一段區間填成同一值；memset 只適合 0/−1（按 byte 填）。',
            code: `// fill(): ranges::fill 對整個容器填同一個值。
ranges::fill(dist, kInf);   // 常見於最短路初始化：先把所有距離設成「無限大」，再逐步鬆弛變小
fill(a.begin(), a.end(), 0);  // use fill instead of byte-wise memset for typed values：memset 是按位元組填，對 int 只能安全填 0 或 -1`
          },
          {
            title: 'nth_element()',
            summary:
              '把第 k 小放到定位，且左邊皆不大於它、右邊皆不小於它，平均 O(n)——不必整段排序即取第 k 小。',
            code: `// nth_element(): 只保證第 k 小定位，不會完全排序。
ranges::nth_element(a, a.begin() + k);   // 執行後 a[k] 就是第 k 小，左邊都 <= 它、右邊都 >= 它，但左右內部順序不保證
int kth = a[k];`,
            complexity: '平均 O(n)'
          },
          {
            title: 'lower_bound()、upper_bound()',
            summary:
              '在有序區間二分：lower_bound 找第一個 ≥ x，upper_bound 找第一個 > x。兩者相減即某值出現次數。',
            code: `// lower_bound()、upper_bound(): 對已排序容器做二分。
auto first = ranges::lower_bound(a, x);   // 第一個 >= x 的位置
auto last = ranges::upper_bound(a, x);    // 第一個 > x 的位置
int cnt = static_cast<int>(last - first);   // [first, last) 恰好涵蓋所有等於 x 的元素，相減即出現次數`,
            complexity: 'O(log n)'
          },
          {
            title: 'next_permutation()、prev_permutation()',
            summary: '就地產生字典序的下一個/上一個排列，回傳是否還有下一個。配 do-while 可枚舉全排列。',
            code: `// next_permutation()、prev_permutation(): C++20 ranges 版本回傳結果物件。
ranges::sort(a);   // 必須先排序成「最小排列」，否則會漏掉字典序在它之前的排列
do {
    /* use this permutation */
} while (ranges::next_permutation(a).found);   // found 為 false 代表已經是最大排列（遞減），列舉結束`,
            complexity: '每次 O(n)'
          }
        ]
      }
    ]
  },
  {
    id: 'strengthening-practical-data-structures',
    sourceChapter: 2,
    title: '實用的資料結構',
    leetcodeProblemIds: [
      'dsu-004',
      'seg-002',
      'lift-001',
      'dsu-lc-1579',
      'dsu-001',
      'dsu-003',
      'lc-1101',
      'lc-235',
      'lc-236',
      'seg-001',
      'lc-308',
      'lc-715',
      'mono-003'
    ],
    topics: [
      {
        title: '並查集',
        summary:
          '維護「不相交集合」的合併與查詢。find 用路徑壓縮、合併用按秩/大小，均攤近 O(α(n))≈O(1)。比較連通性時比的是「根」。',
        code: `// 並查集: find 的路徑壓縮讓樹越用越扁，uni 的按大小合併避免樹長歪，兩者合計讓均攤複雜度接近 O(1)。
int parent[kMaxN], sz[kMaxN];
void init(int n) {
    for (int i = 1; i <= n; ++i) {
        parent[i] = i;   // 一開始每個點自成一個集合，父親是自己
        sz[i] = 1;
    }
}
int find(int x) {
    // 路徑壓縮：遞迴找到根之後，順便把 x 直接接到根下面，下次查詢就不用再走一次長路徑
    return parent[x] == x ? x : parent[x] = find(parent[x]);
}
void uni(int a, int b) {
    a = find(a);
    b = find(b);
    if (a == b) {
        return;          // 已經在同一集合，不用合併
    }
    if (sz[a] < sz[b]) {
        swap(a, b);       // 保證把「小樹」掛到「大樹」下面，避免樹越合併越高
    }
    parent[b] = a;
    sz[a] += sz[b];
}`,
        complexity: '均攤 O(α(n))'
      },
      {
        title: '倍增、稀疏表（ST）、區間值查詢（RMQ）',
        summary: '「倍增」思想：預處理 2 的冪長度區間，查詢時用若干 2 的冪拼出答案。',
        children: [
          {
            title: '倍增',
            summary:
              '把「跳 1 步」擴展成「跳 2^k 步」的預處理技巧。f[i][k] 表示從 i 跳 2^k 的結果，查詢時按二進位拆分步數，O(log n) 完成一次跳躍。'
          },
          {
            title: '稀疏表',
            summary:
              '對「可重複貢獻」的運算（max/min/gcd）預處理 st[k][i]=區間 [i, i+2^k−1] 的值，O(n log n) 建表。刻意把層數 k 放第一維、起點 i 放第二維，讓每層是一段連續記憶體，建表時能循序存取，對快取更友善。',
            code: `// 稀疏表: k（層數）放第一維、i（起點）放第二維，讓每層 st[k] 是一段連續陣列，建表時能循序讀寫，比 st[i][k] 的寫法更快取友善。
int st[20][kMaxN];
for (int i = 0; i < n; ++i) {
    st[0][i] = a[i];   // 第 0 層：長度 2^0 = 1 的區間，就是它自己
}
for (int k = 1; (1 << k) <= n; ++k) {                     // 逐步把區間長度加倍：2^1, 2^2, ...
    for (int i = 0; i + (1 << k) <= n; ++i) {              // 只枚舉「不超出陣列右界」的起點
        // 把 [i, i+2^k-1] 拆成左半 [i, i+2^(k-1)-1] 與右半 [i+2^(k-1), i+2^k-1]，各自的答案已在上一輪（st[k-1]）算好；
        // st[k-1] 與 st[k] 都是連續陣列，這裡等於對上一層做兩次「循序掃描」再循序寫入這一層，遠比 st[i][k-1] 那種
        // 每個 i 都要跳一個 row stride 的寫法更快取友善，n 很大時建表常數會有感差異
        st[k][i] = max(st[k - 1][i], st[k - 1][i + (1 << (k - 1))]);
    }
}`,
            complexity: '建表 O(n log n)'
          },
          {
            title: '區間值查詢',
            summary:
              '查 [l,r] 時取 k=⌊log2(r−l+1)⌋，用兩個長 2^k 的區間覆蓋（可重疊）取極值，O(1)。僅適用可重複貢獻運算，區間求和不可用。',
            code: `// 區間值查詢: bit_width 取得 floor(log2(length))；兩次存取都落在同一層 st[k]，仍是同一段連續陣列裡的兩個位置。
int query(int l, int r) {
    int len = r - l + 1;
    int k = static_cast<int>(bit_width(static_cast<unsigned>(len)) - 1);   // k = floor(log2(len))：C++20 <bit> 函式，取代手寫迴圈算 log
    // 用兩個長度為 2^k 的區間去覆蓋 [l, r]：允許重疊是因為 max/min 這類運算對「重複計入」不敏感
    return max(st[k][l], st[k][r - (1 << k) + 1]);
}`,
            complexity: '查詢 O(1)'
          }
        ]
      },
      {
        title: '最近公共祖先（LCA）',
        summary: '求樹上兩點最深的公共祖先。多種實作，選型看線上/離線與資料規模。',
        children: [
          {
            title: '暴力搜索法',
            summary: '先把較深的點跳到與另一點同深，再一起往上跳到相遇。單次最壞 O(n)，適合小樹或少量查詢。'
          },
          {
            title: '樹上倍增法',
            summary:
              '預處理 up[u][k]=u 的 2^k 級祖先與深度，查詢時先對齊深度再一起倍增上跳。線上、好寫，最常用。',
            code: `// 樹上倍增法: up[u][k] 存 u 的第 2^k 級祖先，查詢時把「往上跳的步數」用二進位拆解，故只需 O(log n) 步。
int up[kMaxN][20], depth[kMaxN];
int lca(int u, int v) {
    if (depth[u] < depth[v]) {
        swap(u, v);          // 確保 u 是較深（或同深）的那個點，後續程式碼才不用分兩種情況寫
    }
    for (int k = 19; k >= 0; --k) {                 // 從最大的 2^k 開始嘗試，才能用最少步數對齊深度
        if (depth[up[u][k]] >= depth[v]) {
            u = up[u][k];    // 跳這一步之後深度仍不小於 v，代表可以放心跳（不會跳過頭）
        }
    }
    if (u == v) {
        return u;             // 對齊深度後兩點就相同，代表 v 原本就是 u 的祖先
    }
    for (int k = 19; k >= 0; --k) {
        if (up[u][k] != up[v][k]) {      // 兩點的 2^k 級祖先仍不同，代表還沒相遇，可以一起跳
            u = up[u][k];
            v = up[v][k];
        }
    }
    return up[u][0];   // 此時 u、v 是 LCA 的左右兩個孩子，各自的父親就是答案
}`,
            complexity: '預處理 O(n log n)，查詢 O(log n)'
          },
          {
            title: '線上區間值查詢算法',
            summary:
              '把 LCA 化為歐拉序上的 RMQ：記錄 DFS 歐拉序與各點深度，兩點首次出現位置之間、深度最小者即 LCA，用 ST 表 O(1) 查詢。'
          },
          {
            title: '離線 Tarjan 算法',
            summary:
              '一次 DFS 配合並查集離線處理所有查詢：回溯時把子樹併入父節點，遇到另一端已訪問的查詢，其 LCA 即該端所在集合的根。O((n+q)α)。'
          }
        ]
      },
      {
        title: '樹狀數組',
        summary:
          '用 lowbit(x)=x&−x 分塊維護前綴和，單點改、前綴查皆 O(log n)，常數遠小於線段樹。下標務必從 1 開始，0 會導致 lowbit 死循環。',
        children: [
          {
            title: '一維樹狀數組',
            summary: '支援單點加與前綴和查詢；區間和 = sum(r) − sum(l−1)。',
            code: `// 一維樹狀數組: i & -i（lowbit）取出 i 的二進位最低位的 1，決定每個節點「管轄」的區間長度，是跳躍的步伐。
int c[kMaxN];
void add(int i, int v) {
    for (; i <= n; i += i & -i) {   // 加上 lowbit(i) 會跳到「管轄範圍包含 i」的下一個節點，逐一更新受影響的區段
        c[i] += v;
    }
}
int sum(int i) {
    int s = 0;
    for (; i; i -= i & -i) {        // 減去 lowbit(i) 會跳到管轄範圍在它左邊、緊接著的區段，逐段累加湊出前綴和
        s += c[i];
    }
    return s;
}`,
            complexity: 'O(log n) 每次'
          },
          {
            title: '多維樹狀數組',
            summary: '把 lowbit 跳躍套在每一維上，二維即巢狀兩層迴圈，支援單點改、子矩陣和。',
            code: `// 多維樹狀數組: 把一維的 lowbit 跳躍分別套用在兩個維度上，兩層迴圈互相獨立，互不干擾。
void add(int x, int y, int v) {
    for (int i = x; i <= n; i += i & -i) {       // 先在第一維按一維樹狀數組的方式跳躍
        for (int j = y; j <= m; j += j & -j) {   // 對每個 i，再在第二維同樣跳躍，更新對應的二維節點
            c[i][j] += v;
        }
    }
}`,
            complexity: '二維 O(log n · log m)'
          }
        ]
      },
      {
        title: '線段樹',
        summary:
          '把區間遞迴二分成樹，支援區間查詢與（配合懶標記的）區間修改，皆 O(log n)。是區間問題的萬用工具。',
        children: [
          {
            title: '基本操作',
            summary: '建樹、單點/區間查詢：遞迴到與查詢區間相交的節點，用 pushup 由子節點合併父節點資訊。',
            code: `// 基本操作: 陣列模擬的完全二叉樹，節點 p 的左右孩子固定是 2p、2p+1，故開 4 倍陣列保證不越界。
int t[4 * kMaxN];
void build(int p, int l, int r) {
    if (l == r) {
        t[p] = a[l];    // 葉節點：區間只剩一個元素，直接取原始值
        return;
    }
    int m = (l + r) / 2;
    build(2 * p, l, m);          // 遞迴建左半區間
    build(2 * p + 1, m + 1, r);  // 遞迴建右半區間
    t[p] = t[2 * p] + t[2 * p + 1];   // pushup：用兩個子節點的結果合併出父節點的答案
}
int query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) {
        return t[p];    // 目前節點代表的區間完全落在查詢範圍內，直接回傳整段答案，不必再往下切
    }
    int m = (l + r) / 2, s = 0;
    if (ql <= m) {                 // 查詢範圍與左半有交集才遞迴進去，避免做不必要的呼叫
        s += query(2 * p, l, m, ql, qr);
    }
    if (qr > m) {                  // 與右半有交集
        s += query(2 * p + 1, m + 1, r, ql, qr);
    }
    return s;
}`,
            complexity: 'O(log n) 每次'
          },
          {
            title: '懶操作',
            summary:
              '區間修改時不立刻下推到葉，先在節點打「懶標記」，等需要訪問其子區間時才 pushdown 並清空標記。這是區間改+區間查的關鍵。',
            code: `// 懶操作: 修改時只在當前節點記一個「欠帳」標記，真正下推給子節點的時機延後到「必須進入子區間」時才做。
long long tag[4 * kMaxN];
void push_down(int p, int l, int r) {
    if (!tag[p]) {
        return;               // 沒有懶標記代表子節點資訊已是最新，不必下推，省下無謂的操作
    }
    int m = (l + r) / 2;
    t[2 * p] += tag[p] * (m - l + 1);     // 左子區間有 (m-l+1) 個元素，每個都要加上欠的值
    tag[2 * p] += tag[p];                  // 把欠帳轉記到左子節點身上，之後它自己的子節點需要時再繼續下推
    t[2 * p + 1] += tag[p] * (r - m);      // 右子區間同理
    tag[2 * p + 1] += tag[p];
    tag[p] = 0;               // 欠帳已經轉移給子節點，當前節點清空，避免之後被重複下推
}`,
            complexity: 'O(log n) 每次'
          }
        ]
      }
    ]
  },
  {
    id: 'strengthening-searching',
    sourceChapter: 3,
    title: '查找算法',
    leetcodeProblemIds: [
      'str-lc-208',
      'str-lc-214',
      'str-lc-1392',
      'str-lc-3008',
      'lc-1',
      'str-lc-28',
      'lc-1408',
      'lc-211',
      'lc-212',
      'lc-1032',
      'lc0x3f-421',
      'lc-49'
    ],
    topics: [
      {
        title: '散列表',
        summary:
          '用雜湊函數把鍵映射到桶，平均 O(1) 增刪查。C++ 直接用 unordered_map/unordered_set，惡意資料可能把它逼到 O(n)（可自訂雜湊防卡）。',
        children: [
          {
            title: '雜湊函數',
            summary: '把鍵均勻散布到 [0, m) 的函數，通常取質數模。好的雜湊能減少衝突、避免聚集。'
          },
          {
            title: '開放地址法',
            summary: '衝突時在同一陣列裡按規則探測下一個空位（線性/二次/雙重雜湊）。負載因子高時效能急降。'
          },
          {
            title: '鏈結位址法',
            summary:
              '每個桶掛一條鏈（或 vector），衝突元素串在同桶。實作簡單、對負載因子較不敏感，是 STL 的做法。'
          },
          {
            title: '建立公共溢位區',
            summary: '主表之外另設一塊溢位區，所有衝突元素統一放溢位區，查詢時主表未命中再查溢位區。'
          },
          {
            title: '散列查找及其性能分析',
            summary:
              '平均查找長度取決於負載因子 α=元素數/桶數。α 越小越快但越費空間，通常維持 α<0.75 並適時再雜湊擴容。'
          }
        ]
      },
      {
        title: '字串模式比對 (BF與KMP)',
        summary: '在主串中找模式串出現位置。BF 直觀但最壞 O(nm)，KMP 用失配資訊避免回退達 O(n+m)。',
        children: [
          {
            title: 'BF 算法',
            summary: '暴力法：對每個起點逐字比對，失配就整體右移一位重來。實作最簡，資料弱時夠用。',
            complexity: '最壞 O(nm)'
          },
          {
            title: 'KMP 算法',
            summary:
              '預處理模式串的 next（前綴函數）：next[i] 為前 i 字元的最長相等真前後綴長度。失配時模式指標跳到 next 處、主串指標不回退。',
            code: `// KMP 算法: nxt[i] 記錄「前 i+1 個字元」的最長相等真前後綴長度，失配時靠它跳轉而不必回退已比對過的字元。
vector<int> nxt(m);
for (int i = 1, j = 0; i < m; ++i) {   // j 是目前已匹配的前綴長度，也是下一個要比對的字元下標
    while (j && p[i] != p[j]) {        // 失配：退而求其次，改比對「次長的相等前後綴」，這正是 nxt 遞迴定義的來源
        j = nxt[j - 1];
    }
    if (p[i] == p[j]) {
        ++j;                            // 配對成功，最長相等前後綴長度加一
    }
    nxt[i] = j;                         // 紀錄「前 i+1 個字元」目前算出的最長相等真前後綴長度
}
// matching works the same: use nxt to skip ahead when a mismatch occurs`,
            complexity: 'O(n+m)'
          }
        ]
      },
      {
        title: '字典樹（Trie 樹）',
        summary:
          '把字串集合按字元逐層下沉存成樹，共享公共前綴。查詢/插入耗時僅與字串長度相關。開陣列要估好節點總數（總字元數+1）。',
        children: [
          {
            title: '創建',
            summary: '插入時沿字元下沉，缺節點就新建；可在終點記錄計數或標記。',
            code: `// 創建: 節點 0 是根（代表空字串），ch[u][x] 存「節點 u 沿字元 x 的孩子」，0 代表尚未建立這條邊。
int ch[kMaxN][26], cnt[kMaxN], total_nodes;
void insert(const string& s) {
    int u = 0;              // 從根出發
    for (char c : s) {
        int x = c - 'a';    // 把字元映射到 0~25，當作陣列下標
        if (!ch[u][x]) {
            ch[u][x] = ++total_nodes;   // 這條路徑第一次出現，新開一個節點
        }
        u = ch[u][x];        // 往下沉一層
    }
    cnt[u]++;                // 在字串結尾的節點做標記，代表「這裡是某個完整字串的終點」
}`,
            complexity: 'O(|s|)'
          },
          {
            title: '查找',
            summary: '沿字元往下走，走不通即不存在；走到終點看標記判斷是否為完整詞。',
            code: `// 查找: 與插入共用同一棵樹，只是遇到不存在的邊就直接判定失敗，不會新建節點。
bool find(const string& s) {
    int u = 0;
    for (char c : s) {
        int x = c - 'a';
        if (!ch[u][x]) {
            return false;    // 這條路徑沒人走過，s 一定不在集合中
        }
        u = ch[u][x];
    }
    return cnt[u] > 0;       // 走到底了，還要檢查這個節點是否真的是某個字串的終點（而非只是別的字串的前綴）
}`,
            complexity: 'O(|s|)'
          },
          {
            title: '應用',
            summary: '前綴統計、字典補全、以及「01-Trie」處理最大異或對等位元問題，都是 Trie 的延伸。'
          }
        ]
      },
      {
        title: '字符串哈希 (String Hashing)',
        summary:
          '把字串映射成一個大整數（多項式雜湊），O(1) 比較任意子串是否相等。實作簡單、適用範圍廣，代價是有極小機率碰撞。',
        children: [
          {
            title: 'Rabin-Karp 演算法',
            summary:
              '把字串看成 base 進位數，預處理前綴雜湊與 base 冪，子串 [l,r] 雜湊 = h[r]−h[l−1]·base^(r−l+1)，O(1) 取得。',
            code: `// Rabin-Karp 演算法: constexpr 表示 base 是編譯期常數。這裡用 unsigned long long 自然溢位（相當於對 2^64 取模）當作雜湊模數。
constexpr unsigned long long kBase = 131;
unsigned long long h[kMaxN], pw[kMaxN];
// preprocess the prefix function
pw[0] = 1;
for (int i = 1; i <= n; ++i) {
    h[i] = h[i - 1] * kBase + s[i];   // h[i] 是前 i 個字元看成 base 進位數的值，等同秦九韶算法逐位累乘累加
    pw[i] = pw[i - 1] * kBase;        // pw[i] = base^i，供之後對齊位數用
}
auto sub = [&](int l, int r) {
    // 想像 h[r] = h[l-1] * base^(r-l+1) + hash(s[l..r])，故子串雜湊 = h[r] 減去「前 l-1 位貢獻」對齊後的值
    return h[r] - h[l - 1] * pw[r - l + 1];
};`,
            complexity: '預處理 O(n)，查詢 O(1)'
          },
          {
            title: '雙重哈希防碰撞技巧',
            summary:
              '用兩組不同的 base/模同時雜湊，兩者都相等才判相等，碰撞機率降到可忽略。或用 unsigned long long 自然溢位配隨機 base 防被 hack。',
            code: `// 雙重哈希防碰撞技巧: 兩組 base/mod 同時相等才視為同一子串，單組雜湊碰撞的機率相乘後接近可忽略。
constexpr long long kBase1 = 131, kBase2 = 13331;              // 兩組 base 刻意選不同的值，降低同時碰撞的機率
constexpr long long kMod1 = 1'000'000'007LL, kMod2 = 998'244'353LL;  // 兩個大質數，各自獨立取模
long long h1[kMaxN], h2[kMaxN], p1[kMaxN], p2[kMaxN];
void build(const string& s) {
    int n = s.size();
    p1[0] = p2[0] = 1;
    for (int i = 1; i <= n; ++i) {
        h1[i] = (h1[i - 1] * kBase1 + s[i - 1]) % kMod1;   // 第一組雜湊，做法與單一雜湊相同，只是模數不同
        h2[i] = (h2[i - 1] * kBase2 + s[i - 1]) % kMod2;   // 第二組雜湊，完全獨立計算
        p1[i] = p1[i - 1] * kBase1 % kMod1;
        p2[i] = p2[i - 1] * kBase2 % kMod2;
    }
}
// hash pair for substring [l, r] (1-indexed); both halves must match for equality
pair<long long, long long> get(int l, int r) {
    // 減法後可能為負，先加一次模數再取模，確保結果落在 [0, mod) 內
    long long a = ((h1[r] - h1[l - 1] * p1[r - l + 1]) % kMod1 + kMod1) % kMod1;
    long long b = ((h2[r] - h2[l - 1] * p2[r - l + 1]) % kMod2 + kMod2) % kMod2;
    return {a, b};   // 回傳一組 pair，比較兩個子串時要兩個分量都相等才算真正相等
}`,
            complexity: '預處理 O(n)，查詢 O(1)'
          }
        ]
      },
      {
        title: 'Manacher 演算法 (馬拉車)',
        summary:
          '線性求每個中心的最長回文半徑。先在字元間插入分隔符統一奇偶長度，再利用「回文對稱性」重用已知資訊，達到 O(n)。',
        children: [
          {
            title: 'O(n) 求解最長回文子串',
            summary:
              '維護當前最右回文邊界 r 與其中心 c，對位置 i 先用鏡像點 p[2c−i] 初始化半徑，再嘗試擴張並更新 c、r。',
            code: `// O(n) 求解最長回文子串: 插入分隔符把奇偶長度統一處理，頭尾加哨兵字元讓邊界判斷不必額外寫 if。
string t = "^#";                 // '^' 是左哨兵，確保 while 擴張時不會往左越界
for (char c : s) {
    t += c;
    t += '#';                    // 每個原字元後面插入 '#'：不論原回文長度奇偶，t 中的回文半徑都以它為中心對稱
}
t += '$';                        // '$' 是右哨兵，確保不會往右越界；'^'、'$'、'#' 都不會出現在原字串中，不怕誤判
vector<int> p(t.size());         // p[i] 是以 t[i] 為中心，在 t 上的回文半徑
int c = 0, r = 0;                 // c: 目前已知最靠右的回文的中心；r: 該回文能覆蓋到的最右邊界（不含）
for (int i = 1; i + 1 < (int)t.size(); ++i) {
    if (i < r) {
        // i 在已知回文 [c-?, r) 內部：利用對稱性，i 關於 c 的鏡像點 2c-i 的半徑資訊可以直接重用（但不能超過 r-i）
        p[i] = min(r - i, p[2 * c - i]);
    }
    while (t[i + p[i] + 1] == t[i - p[i] - 1]) {   // 中心擴展：暴力比對邊界字元是否相同就繼續擴大半徑
        ++p[i];
    }
    if (i + p[i] > r) {           // 這個回文比目前紀錄的更靠右，更新「最右邊界」的紀錄
        c = i;
        r = i + p[i];
    }
}`,
            complexity: 'O(n)'
          }
        ]
      }
    ]
  },
  {
    id: 'strengthening-balanced-trees',
    sourceChapter: 4,
    title: '平衡樹',
    leetcodeProblemIds: [
      'seg-003',
      'lc-1469',
      'int-003',
      'lc-2764',
      'lc-1382',
      'lc-98',
      'lc-450',
      'lc-729',
      'lc-731',
      'lc-715',
      'lc-1206',
      'lc-146'
    ],
    topics: [
      {
        title: '樹高與性能',
        summary:
          'BST 一切操作是 O(樹高)。隨機資料期望 O(log n)，但有序插入退化成 O(n)。平衡樹的使命就是把樹高鎖在 O(log n)。'
      },
      {
        title: '平衡二叉搜索樹（AVL 樹）',
        summary:
          '最嚴格的平衡：任一節點左右子樹高度差不超過 1。查詢最快，但插入/刪除需維護平衡因子並旋轉，程式較繁。',
        children: [
          {
            title: '調整平衡的方法',
            summary: '依失衡型態做 LL、RR、LR、RL 四種旋轉恢復平衡；本質都是一到兩次的單旋組合。'
          },
          {
            title: '插入',
            summary: '按 BST 插入後，沿回溯路徑更新高度、檢查平衡因子，一旦失衡就對該子樹旋轉。'
          },
          {
            title: '創建',
            summary: '逐個插入即建成 AVL；因自動平衡，即使有序輸入也保持 O(log n) 高。'
          },
          {
            title: '刪除',
            summary: '按 BST 刪除後同樣沿路徑回溯調整，可能需要多次旋轉（不像插入只需一次）。'
          }
        ]
      },
      {
        title: '樹堆（Treap）',
        summary:
          'BST + 堆：每節點附一個隨機優先級，同時滿足按鍵的 BST 性質與按優先級的堆性質。隨機優先級讓期望樹高 O(log n)，程式比 AVL 短。',
        children: [
          {
            title: '右旋和左旋',
            summary: '旋轉是所有平衡樹的原子操作，在不破壞 BST 性質下調整結構。「左旋提右子、右旋提左子」。',
            code: `// 右旋和左旋: 把 x 的左孩子 y 提升成新的子樹根，同時保持中序遍歷（也就是 BST 有序性）完全不變。
// right rotation: promote y, the left child of x
Node* rotate_right(Node* x) {
    Node* y = x->l;
    x->l = y->r;   // y 原本的右子樹裡的值介於 y 和 x 之間，改掛到 x 的左邊仍滿足 BST 性質
    y->r = x;       // x 降級變成 y 的右孩子
    upd(x);         // 先更新 x（現在的子樹範圍變小了），再更新 y，順序不能顛倒
    upd(y);
    return y;       // y 是這棵子樹的新根，呼叫端要用它替換原本指向 x 的指標
}`
          },
          {
            title: '插入',
            summary: '按鍵做 BST 插入，若子節點優先級優於父，就旋轉把它上提，直到堆序恢復。',
            complexity: '期望 O(log n)'
          },
          {
            title: '刪除',
            summary: '找到節點後，把優先級較優的孩子旋上來，逐步把待刪節點旋到葉再摘除。'
          },
          {
            title: '前驅',
            summary: '小於 x 的最大值：走到 x 後取左子樹最右節點，或查找路徑上記錄的最後一次「向右轉」節點。'
          },
          {
            title: '後繼',
            summary: '大於 x 的最小值：對稱地取右子樹最左節點，或路徑上最後一次「向左轉」節點。'
          }
        ]
      },
      {
        title: '伸展樹（Splay 樹）',
        summary:
          '不維護嚴格平衡，而是每次訪問後把該節點「伸展」到根，靠均攤保證 O(log n)，並利用時空局部性，還便於實作區間操作。',
        children: [
          {
            title: '時空局部性的原理',
            summary: '最近訪問的元素被移到根附近，下次訪問更快——對有局部性的查詢序列特別有利。'
          },
          {
            title: '右旋和左旋',
            summary: '同其他平衡樹的旋轉，是 splay 的組成步。'
          },
          {
            title: '伸展',
            summary:
              'splay 用 zig、zig-zig、zig-zag 三種雙旋策略把節點旋到根；zig-zig（同方向）先旋父再旋子是保證均攤的關鍵。'
          },
          {
            title: '查找',
            summary: '按 BST 查找，命中後對其做 splay，把它旋到根。'
          },
          {
            title: '插入',
            summary: '按 BST 插入新節點後 splay 到根。'
          },
          {
            title: '分裂',
            summary: '把第 k 個元素 splay 到根，其左子樹（含它）與右子樹即為兩棵樹，O(log n)。'
          },
          {
            title: '合併',
            summary: '把左樹最大值 splay 到根（右子為空），再把右樹接為其右子。要求左樹全部小於右樹。'
          },
          {
            title: '刪除',
            summary: '把待刪節點 splay 到根後移除，再合併它的左右子樹。'
          },
          {
            title: '區間操作',
            summary:
              '以「序列下標」為鍵，用分裂/合併把任意區間隔離成一棵子樹，即可對它整體打翻轉、加值等懶標記——這是 Splay/文藝平衡樹的招牌用途。'
          },
          {
            title: '算法分析',
            summary: '單次操作最壞 O(n)，但任意連續 m 次操作總計 O(m log n)，即均攤 O(log n)。'
          }
        ]
      },
      {
        title: '用 __gnu_pbds 免手寫平衡樹',
        summary:
          'GCC 內建的 `__gnu_pbds::tree` 是一棵紅黑樹，加上 `tree_order_statistics_node_update` 策略後，除了 `std::set` 的增刪查外還免費支援「查第 k 小」與「查排名」。多數只需「單點插入／刪除 + 排名查詢」的題目，用它就能取代手寫平衡樹，省下大量除錯時間。',
        children: [
          {
            title: '宣告與基本操作',
            summary:
              '引入 `<ext/pb_ds/assoc_container.hpp>` 與 `<ext/pb_ds/tree_policy.hpp>` 兩個標頭並 `using namespace __gnu_pbds;`。模板參數為 `<鍵, 映射值, 比較子, 底層樹, 節點更新策略>`；把映射值設成 `null_type` 就是「只有鍵」的有序集合，`insert`／`erase`／`find` 介面與 `std::set` 完全相同。',
            code: `// 宣告與基本操作: 注意 __gnu_pbds 是 GCC/libstdc++ 專屬擴充，「不是」ISO C++ 標準的一部分——換到 Clang/MSVC 或其他不帶
// libstdc++ 的環境會編譯失敗。多數線上評測系統用 GCC，才讓這個技巧在競程中很實用；正式專案請優先考慮下方提到的
// std::set 或自製 Fenwick 樹方案以確保可攜性。
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
using namespace __gnu_pbds;

// <key_type, mapped_type, comparator, underlying_tree, node_update>
// mapped_type = null_type means an ordered set of keys only (equivalent to std::set)
using ordered_set = tree<
    int,
    null_type,                           // 不需要「鍵對應的值」，只當有序集合用
    std::less<>,
    rb_tree_tag,                          // 底層是紅黑樹，插入/刪除/查詢都是 O(log n)
    tree_order_statistics_node_update>;   // 這個策略讓每個節點額外維護子樹大小，才能支援排名／第 k 小查詢

ordered_set s;
s.insert(10);
s.insert(30);
s.insert(20);
if (s.find(20) != s.end()) {   // 介面與 std::set 幾乎一致，換掉型別名稱即可沿用既有寫法
    s.erase(20);
}`,
            complexity: '每次操作 O(log n)'
          },
          {
            title: '排名與第 k 小',
            summary:
              '`find_by_order(k)` 回傳「第 k 小」（0-indexed）元素的迭代器；`order_of_key(x)` 回傳「嚴格小於 x 的元素個數」，也就是 x 的排名（0-indexed）。兩者都是 O(log n)，正是手寫平衡樹最花時間維護的子樹大小功能。',
            code: `// 排名與第 k 小: 這兩個函式是標準 std::set 沒有提供的能力，正是改用 __gnu_pbds::tree 的主要理由。
ordered_set s;
for (int x : {10, 20, 30, 40}) {
    s.insert(x);
}

// k-th smallest (0-indexed): find_by_order
int second = *s.find_by_order(1);   // 20：回傳的是迭代器，解參考才拿到值；下標從 0 開始

// rank: order_of_key returns the number of elements strictly less than x
int rank_30 = s.order_of_key(30);    // 2 (10 and 20 are less than 30)：即使 30 存在，也只算「嚴格小於」它的個數
int rank_35 = s.order_of_key(35);    // 3 (10, 20 and 30 are less than 35, so 35 would be inserted at index 3)`,
            complexity: 'O(log n)'
          },
          {
            title: '需要可重複值（multiset）怎麼辦',
            summary:
              '預設 `std::less` 會像 `std::set` 一樣去重。想保留重複值，最穩健的做法是改存 `pair<值, 唯一時間戳>`：每個元素因時間戳不同而唯一，查某個值的排名時用 `order_of_key({v, 極小值})`。直接改用 `std::less_equal` 雖能塞入重複值，但會讓 `find` 與 `erase(value)` 失效（比較子不再是嚴格弱序），除非必要不建議。',
            code: `// 需要可重複值（multiset）怎麼辦: __gnu_pbds::tree 的鍵預設要唯一（像 std::set），這是繞過限制而非改變比較子的標準做法。
// to keep duplicates, store pair<value, unique timestamp> sorted with std::less
using ordered_multiset = tree<
    std::pair<int, int>,   // 用 {值, 時間戳記} 當鍵，即使值重複，時間戳記也讓每個鍵保持唯一
    null_type,
    std::less<>,
    rb_tree_tag,
    tree_order_statistics_node_update>;

ordered_multiset s;
int timestamp = 0;
auto add = [&](int v) {
    s.insert({v, timestamp++});   // timestamp guarantees uniqueness so duplicate values are preserved
};
add(20);
add(20);

// query rank of value v: use {v, smallest timestamp} as lower bound
int rank = s.order_of_key({20, -1});   // 用比任何真實時間戳記都小的 -1 湊出下界，才能正確算出「值嚴格小於 20」的個數`,
            complexity: 'O(log n)'
          }
        ]
      }
    ]
  },
  {
    id: 'strengthening-graph-advanced',
    sourceChapter: 5,
    title: '圖論提高',
    leetcodeProblemIds: [
      'graph-lc-827',
      'graph-lc-1345',
      'lc0x3f-1976',
      'lc0x3f-1254',
      'lc-1192',
      'graph-004',
      'lc-1568',
      'graph-lc-207',
      'graph-lc-210',
      'lc-785',
      'lc-886'
    ],
    topics: [
      {
        title: '連通圖與強連通圖',
        summary:
          '無向圖任兩點互達為連通；有向圖任兩點互相可達為強連通。連通性分析是許多圖論建模（縮點、2-SAT）的前置。'
      },
      {
        title: '橋與割點',
        summary:
          '割點：刪去後連通塊增加的點；橋：刪去後連通塊增加的邊。它們刻畫圖的「脆弱處」，用 Tarjan 的 dfn/low 一次 DFS 求出。'
      },
      {
        title: '雙連通分量的縮點',
        summary:
          '把邊雙連通分量（無橋連通塊）縮成點後，原圖變成一棵「橋樹」，可將複雜連通性問題化簡為樹上問題。'
      },
      {
        title: 'Tarjan 算法',
        summary:
          '基於 DFS 的時間戳。dfn[u] 是訪問順序，low[u] 是 u 子樹能回溯到的最早 dfn。橋與割點、SCC 都由 dfn 與 low 的關係判定。',
        children: [
          {
            title: '無向圖的橋',
            summary: '若 low[v] > dfn[u]（v 是 u 的子），則邊 (u,v) 是橋。注意避開父邊、但允許重邊。',
            code: `// 無向圖的橋: dfn 是訪問時間戳，low 是「不經過父邊」能回溯到的最早祖先，兩者的關係決定一條邊是不是橋。
void tarjan(int u, int fe) {           // fe: id of the incoming edge
    discovery_time[u] = low[u] = ++timer;   // 初始時 low[u] 只能回到自己
    for (auto [v, id] : g[u]) {
        if (!discovery_time[v]) {           // v 還沒訪問過，是樹邊
            tarjan(v, id);
            low[u] = min(low[u], low[v]);   // 子樹能回溯到的最早點，u 也能經由這條樹邊回溯到
            if (low[v] > discovery_time[u]) {
                // v 及其子樹完全無法（透過非樹邊）繞回 u 或更早的祖先，代表 (u, v) 是連接兩個連通塊的唯一通道
                is_bridge[id] = true;
            }
        } else if (id != (fe ^ 1)) {
            // v 已訪問過：這是回邊或前向邊，用它更新 low；但要排除「原路走回父親」這條邊本身（用邊編號互斥的 id^1 判斷）
            low[u] = min(low[u], discovery_time[v]);
        }
    }
}`,
            complexity: 'O(n+m)'
          },
          {
            title: '無向圖的割點',
            summary:
              '非根節點 u 是割點當且僅當存在子 v 使 low[v] ≥ dfn[u]（等號差別）；根節點是割點當且僅當它有 ≥2 個 DFS 子樹。',
            code: `// 無向圖的割點: 與求橋的框架相同，但判定條件差一個等號，且根節點要另外特判。
int timer;
int discovery_time[kMaxN], low[kMaxN];
bool cut[kMaxN];
void tarjan(int u, int root) {
    discovery_time[u] = low[u] = ++timer;
    int child = 0;                     // 統計 u 在 DFS 樹上的子樹數量，只有根節點需要這個資訊
    for (int v : g[u]) {
        if (!discovery_time[v]) {
            ++child;
            tarjan(v, root);
            low[u] = min(low[u], low[v]);
            if (u != root && low[v] >= discovery_time[u]) {
                // 非根節點：子樹 v 最多只能回溯到 u（不能繞過 u 到達更上層），代表拿掉 u 後這棵子樹就斷開了
                cut[u] = true;
            }
        } else {
            low[u] = min(low[u], discovery_time[v]);
        }
    }
    if (u == root && child >= 2) {
        // 根節點沒有「更上層」可回溯，只能看它是否連接了 >= 2 棵獨立子樹——是的話拿掉根就會斷成多塊
        cut[u] = true;
    }
}`,
            complexity: 'O(n+m)'
          },
          {
            title: '有向圖的強連通分量',
            summary:
              '用堆疊存當前路徑，回溯時若 dfn[u]==low[u]，則從堆疊彈出直到 u，這批點構成一個 SCC。low 只用「仍在堆疊中」的點更新。',
            code: `// 有向圖的強連通分量: 堆疊裡永遠只留「還可能屬於未結束 SCC」的點，dfn[u]==low[u] 代表 u 是它所在 SCC 的「根」。
void tarjan(int u) {
    discovery_time[u] = low[u] = ++timer;
    stk.push(u);           // 進入時先入棧，代表 u 目前是「候選在某個 SCC 裡」的點
    in_stack[u] = true;
    for (int v : g[u]) {
        if (!discovery_time[v]) {
            tarjan(v);
            low[u] = min(low[u], low[v]);
        } else if (in_stack[v]) {
            // 只有「仍在棧中」的點才能更新 low：不在棧中代表 v 屬於已經結算完的另一個 SCC，用它會得到錯誤的橫跨邊資訊
            low[u] = min(low[u], discovery_time[v]);
        }
    }
    if (discovery_time[u] == low[u]) {   // u 是這個強連通分量裡最早被訪問、且誰都繞不出去的「根」
        int x;
        do {
            x = stk.top();
            stk.pop();
            in_stack[x] = false;   // 彈出時要同步清掉標記，之後才不會被誤判為「仍在棧中」
            comp[x] = scc;          // 把彈出的這批點都歸入同一個 SCC 編號
        } while (x != u);           // 一路彈到 u 自己為止，這批點恰好構成一個完整的 SCC
        ++scc;
    }
}`,
            complexity: 'O(n+m)'
          }
        ]
      },
      {
        title: '歐拉路徑與歐拉迴路',
        summary: '一筆畫問題：經過每條邊恰一次。存在性由度數與連通性決定。',
        children: [
          {
            title: '七橋問題與存在性判定',
            summary:
              '無向連通圖：所有點度數皆偶 → 有歐拉迴路；恰兩點奇度 → 有歐拉路徑（以奇度點為端）。有向圖則看每點入度=出度（迴路）或恰一點出−入=1、一點入−出=1（路徑）。'
          },
          {
            title: 'Hierholzer 演算法',
            summary:
              'DFS 走邊，走過即刪；回溯時把節點壓入答案棧，最後反轉得歐拉路。用「當前弧」避免重複掃已刪邊，O(n+m)。',
            code: `// Hierholzer 演算法: 「當前弧優化」讓每條邊只會被掃描一次，把總複雜度從可能的 O(m^2) 降到 O(n+m)。
void dfs(int u) {
    while (head[u] < (int)g[u].size()) {
        int v = g[u][head[u]++];         // current arc optimization (skips saturated edges)：head[u] 記住掃到哪，走過的邊不會被重複檢查
        dfs(v);                           // 沿著還沒走過的邊繼續深入，直到某點的邊全部走完為止
    }
    order.push_back(u);                  // 這個點的所有出邊都走完了，才把它加進答案——所以結果要反轉才是正確的走訪順序
}
// reverse the order to obtain the Eulerian path`,
            complexity: 'O(n+m)'
          }
        ]
      },
      {
        title: '二分圖基礎',
        summary: '頂點可分成兩部、邊只在部間的圖。等價於「圖中無奇環」，是匹配問題的載體。',
        children: [
          {
            title: '二分圖染色判定',
            summary: '用 BFS/DFS 兩色交替染色，若遇到相鄰同色即非二分圖。',
            code: `// 二分圖染色判定: 相鄰點必須染不同色，一旦發現矛盾就代表存在奇環，圖不是二分圖。
bool bfs(int s) {
    queue<int> q;
    q.push(s);
    col[s] = 0;             // 起點任意指定一個顏色
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : g[u]) {
            if (col[v] == -1) {           // 還沒染色：染成與 u 相反的顏色
                col[v] = col[u] ^ 1;      // ^1 讓 0、1 互相翻轉，恰好是「另一種顏色」
                q.push(v);
            } else if (col[v] == col[u]) {   // 已經染色但跟 u 同色：出現相鄰同色，矛盾
                return false;
            }
        }
    }
    return true;
}`,
            complexity: 'O(n+m)'
          }
        ]
      },
      {
        title: '2-SAT 問題',
        summary:
          '每個布林變數有真/假兩個節點，把「若 a 則 b」的約束化為蘊含邊，跑 SCC；若某變數的真、假落在同一 SCC 則無解，否則按 SCC 拓撲序取值。',
        children: [
          {
            title: '邏輯滿足性與強連通分量的結合',
            summary:
              '建圖後用 Tarjan 求 SCC，變數 x 取值看 comp[x為真] 與 comp[x為假] 的拓撲先後（Tarjan 的 SCC 編號逆序即拓撲序），選較後者。'
          }
        ]
      }
    ]
  },
  {
    id: 'strengthening-graph-algorithms',
    sourceChapter: 6,
    title: '圖論算法',
    leetcodeProblemIds: [
      'graph-003',
      'mst-lc-1168',
      'sp-lc-2642',
      'lc-3219',
      'mst-lc-1584',
      'lc-1135',
      'sp-lc-743',
      'sp-lc-1514',
      'sp-lc-1334',
      'sp-lc-787',
      'graph-lc-210',
      'graph-004'
    ],
    topics: [
      {
        title: '最小生成樹 (Prim, Kruskal)',
        summary: '在連通帶權無向圖中選 n−1 條邊連通所有點且總權最小。兩大算法選型看稠密度。',
        children: [
          {
            title: 'Prim 算法',
            summary:
              '從一點出發，每次把「連向已選集合的最短邊」的新點加入。用堆優化後 O(m log n)，適合稠密圖（樸素 O(n^2) 版對稠密更省）。',
            code: `// Prim 算法: 用小根堆維護「連向已選集合的候選邊」，每次貪心取最短邊擴張集合，思路類似 Dijkstra。
priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;   // pair 是 {距離, 節點}，greater<> 讓最小的排前面
pq.push({0, s});
long long mst = 0;
while (!pq.empty()) {
    auto [d, u] = pq.top();
    pq.pop();
    if (visited[u]) {
        continue;    // 這個節點已經被更早、更短的邊選進來了，堆裡殘留的是過期紀錄，跳過即可
    }
    visited[u] = true;
    mst += d;         // 累加選中這條邊的權重
    for (auto [v, w] : g[u]) {
        if (!visited[v]) {
            pq.push({w, v});   // 把新加入點的所有出邊都當候選推進堆，之後自然會挑出最小的
        }
    }
}`,
            complexity: 'O(m log n)'
          },
          {
            title: 'Kruskal 算法',
            summary: '所有邊按權升序，用並查集依序加入不成環的邊，直到選滿 n−1 條。適合稀疏圖，最常用。',
            code: `// Kruskal 算法: 邊按權重由小到大貪心加入，用並查集判斷「加入會不會成環」，是比 Prim 更直觀的寫法。
sort(edges.begin(), edges.end(), [](auto& a, auto& b) { return a.w < b.w; });
long long mst = 0;
int cnt = 0;
for (auto& e : edges) {
    if (find(e.u) != find(e.v)) {   // 兩端不在同一集合，代表這條邊不會形成環，可以放心加入
        uni(e.u, e.v);
        mst += e.w;
        if (++cnt == n - 1) {       // 生成樹恰好需要 n-1 條邊，選滿就不用再看剩下（權重更大）的邊
            break;
        }
    }
}`,
            complexity: 'O(m log m)'
          }
        ]
      },
      {
        title: '最短路徑 (Dijkstra, Floyd, Bellman-Ford, SPFA)',
        summary: '按「邊權正負、單源還是全源、圖稠密度」挑算法。這是競程最常考的圖論主題。',
        children: [
          {
            title: 'Dijkstra 算法',
            summary:
              '單源、非負權。每次取當前最短的未定點擴展鄰居（貪心），堆優化 O(m log n)。出堆時若距離已過期就跳過。不能處理負權。',
            code: `// Dijkstra 算法: 用足夠大的 kInf，避免 dist + w 溢位。除以 4 是留出安全餘裕，讓 kInf 加上邊權也不會真的溢位。
constexpr long long kInf = numeric_limits<long long>::max() / 4;
priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
fill(dist, dist + n + 1, kInf);
dist[s] = 0;
pq.push({0, s});
while (!pq.empty()) {
    auto [d, u] = pq.top();
    pq.pop();
    if (d > dist[u]) {
        continue;   // 惰性刪除：這是 u 較舊、較差的一筆紀錄（因為不刪除堆中舊資料，同一點可能重複入堆），略過即可
    }
    for (auto [v, w] : g[u]) {
        if (d + w < dist[v]) {         // 貪心：目前取出的 u 一定已經是最短距離（非負權下堆頂保證最小），可以放心鬆弛鄰居
            dist[v] = d + w;
            pq.push({dist[v], v});
        }
    }
}`,
            complexity: 'O(m log n)'
          },
          {
            title: 'Floyd 算法',
            summary:
              '全源最短路，DP：以 k 為中轉點鬆弛所有 (i,j)。三重迴圈最外層必須是中轉點 k。O(n^3)，適合 n≤400 或求傳遞閉包。',
            code: `// Floyd 算法: 本質是 DP：d[k][i][j] 表示「只允許用 1..k 當中轉點」時 i 到 j 的最短路，k 是外層迴圈，滾動掉了一維。
for (int k = 1; k <= n; ++k) {           // 逐一開放中轉點：k 必須放最外層，否則 d[i][k]、d[k][j] 可能還沒用到「最新」的中轉點更新
    for (int i = 1; i <= n; ++i) {
        for (int j = 1; j <= n; ++j) {
            d[i][j] = min(d[i][j], d[i][k] + d[k][j]);   // 嘗試「經過 k 中轉」是否比目前已知的路徑更短
        }
    }
}`,
            complexity: 'O(n^3)'
          },
          {
            title: 'Bellman-Ford 算法',
            summary:
              '單源、可含負權。對所有邊做 n−1 輪鬆弛（最短路至多 n−1 條邊）；若第 n 輪還能鬆弛則存在負環。O(nm)，穩健但慢。',
            code: `// Bellman-Ford 算法: 額外一輪鬆弛可判斷負環。最短路最多經過 n-1 條邊，所以跑 n-1 輪「對所有邊鬆弛」必定收斂。
constexpr long long kInf = numeric_limits<long long>::max() / 4;
fill(dist, dist + n + 1, kInf);
dist[s] = 0;
for (int i = 1; i < n; ++i) {             // 跑 n-1 輪
    for (auto& e : edges) {               // 每輪對「所有邊」嘗試鬆弛，不像 Dijkstra 依賴貪心順序，所以能處理負權邊
        if (dist[e.u] != kInf && dist[e.u] + e.w < dist[e.v]) {
            dist[e.v] = dist[e.u] + e.w;
        }
    }
}
bool neg = false;                        // one extra relaxation round to detect negative cycles
for (auto& e : edges) {
    if (dist[e.u] != kInf && dist[e.u] + e.w < dist[e.v]) {
        neg = true;   // 正常情況下 n-1 輪後不會再有任何邊能鬆弛；如果還能鬆弛，代表存在負環讓路徑可以無限變短
    }
}`,
            complexity: 'O(nm)'
          },
          {
            title: 'SPFA 算法',
            summary:
              'Bellman-Ford 的佇列優化：只有距離被更新的點才重新入隊鬆弛鄰居。某些資料上很快，但沒有可依賴的平均複雜度保證，特殊構造圖會退化 O(nm)。判負環可記錄鬆弛路徑邊數，若某點達到 n 即存在可達負環。',
            code: `// SPFA 算法: 只有距離更新過的點才需要重新入隊，是 Bellman-Ford「盲目對所有邊鬆弛 n-1 輪」的隊列優化版本。
constexpr long long kInf = numeric_limits<long long>::max() / 4;
queue<int> q;
fill(dist, dist + n + 1, kInf);
dist[s] = 0;
q.push(s);
in_queue[s] = true;
while (!q.empty()) {
    int u = q.front();
    q.pop();
    in_queue[u] = false;   // 出隊後先取消標記，之後若它的距離又被更新，還能再次入隊
    for (auto [v, w] : g[u]) {
        if (dist[u] + w < dist[v]) {   // 只有真的能讓 v 變短時才需要處理，避免浪費在「沒有進步」的鬆弛上
            dist[v] = dist[u] + w;
            if (!in_queue[v]) {         // 已經在隊列中就不重複塞入，避免隊列爆量
                q.push(v);
                in_queue[v] = true;
            }
        }
    }
}`,
            complexity: '最壞 O(nm)；實務速度高度依賴圖形與入隊順序'
          }
        ]
      },
      {
        title: '拓撲排序',
        summary:
          'DAG 上把所有點排成線性序，使每條邊都從前指向後。Kahn 法用入度為 0 的佇列逐步剝離；排不滿 n 個即存在環。是 DAG 上 DP 的前置。',
        code: `// 拓撲排序: Kahn 演算法——不斷剝除「入度為 0」的點，模擬「沒有任何未完成的前置條件」才能開始的順序。
queue<int> q;
for (int i = 1; i <= n; ++i) {
    if (indeg[i] == 0) {   // 入度 0 代表沒有任何邊指向它，可以最先被排進答案
        q.push(i);
    }
}
vector<int> order;
while (!q.empty()) {
    int u = q.front();
    q.pop();
    order.push_back(u);
    for (int v : g[u]) {
        if (--indeg[v] == 0) {   // 移除 u 這個點（及其出邊）後，v 的入度歸零，代表 v 的前置條件都已排定
            q.push(v);
        }
    }
}
// order.size() < n means the graph contains a cycle`,
        complexity: 'O(n+m)'
      },
      {
        title: '關鍵路徑',
        summary:
          'AOE 網（邊表工序耗時）中從起點到終點的最長路，決定專案最短總工期。求每事件最早/最晚發生時間，兩者相等的活動即關鍵活動；先拓撲排序再正/反向 DP。',
        code: `// 關鍵路徑: 先按拓撲序正向 DP 算「最早能開始」，再逆拓撲序反向 DP 算「最晚不能超過」，兩者的差即每個事件的機動時間。
// ve[u] = earliest event time, vl[u] = latest event time
// order is the topological order; g[u] stores (v, w)
void critical_path(int n) {
    for (int u : order) {                    // 依拓撲序處理，保證算 ve[v] 時，所有能到達 v 的前驅 ve 值都已算好
        for (auto [v, w] : g[u]) {
            ve[v] = max(ve[v], ve[u] + w);    // v 最早能開始的時間，取所有前驅路徑中最晚完成的那一條
        }
    }
    for (int i = 0; i < n; ++i) {
        vl[i] = ve[n - 1];   // 邊界：終點的「最晚時間」就是全專案的最早完工時間，不能再拖
    }
    for (int i = n - 1; i >= 0; --i) {        // 逆拓撲序：處理 u 時，它的所有後繼 vl 值都已算好
        int u = order[i];
        for (auto [v, w] : g[u]) {
            vl[u] = min(vl[u], vl[v] - w);    // u 最晚要在「不耽誤最緊的後繼」前完成，取所有後繼中最嚴格的限制
        }
    }
    // edge (u, v, w) is critical if ve[u] == vl[v] - w
}`,
        complexity: 'O(n+m)'
      }
    ]
  },
  {
    id: 'strengthening-search-advanced',
    sourceChapter: 7,
    title: '搜尋算法提高',
    leetcodeProblemIds: [
      'graph-lc-2608',
      'lc0x3f-1210',
      'lc0x3f-924',
      'lc-1786',
      'lc-37',
      'lc-1263',
      'lc-752',
      'lc-773',
      'lc-854',
      'graph-005',
      'bm-lc-847',
      'lc-1293'
    ],
    topics: [
      {
        title: '剪枝優化',
        summary:
          '搜索的靈魂是「砍掉不可能的分支」。四類常用剪枝：可行性（此路必不可行就返回）、最優性（已劣於當前最優就返回）、搜索順序（先搜分支少/約束強的）、記憶化。剪枝順序影響常常差幾個數量級。'
      },
      {
        title: '嵌套廣度優先搜尋',
        summary:
          '狀態本身需要一次內層搜索才能展開的 BFS（如推箱子：外層是箱子位置、內層 BFS 判斷人能否推）。把「複合狀態」編碼成整體節點來擴展。'
      },
      {
        title: '雙向廣度優先搜尋',
        summary:
          '同時從起點與終點各做 BFS，兩側相遇即得最短路。搜索空間從 O(b^d) 降到約 O(b^(d/2))。每次擴展「較小的一側」以保持優勢。適合分支因子大、深度深的問題。',
        complexity: '約 O(b^(d/2))'
      },
      {
        title: '啟發式搜尋 (A*, IDA*)',
        summary:
          '用估價函數 h（對到目標剩餘代價的估計）引導方向。h 必須「可採納」（不高估真實代價）才能保證最優。',
        children: [
          {
            title: 'A* 算法',
            summary:
              '以 f=g+h（已走代價+估計剩餘）為優先級的優先佇列搜索。h 可採納時首次取出目標即最優解。h 越接近真實、剪枝越強。',
            code: `// a* 算法: 用「已走代價 + 估計剩餘代價」排序，比純 Dijkstra（只看已走代價）更早朝目標方向搜尋，減少展開的節點數。
// Node = {f = g + h, g, state}; min-heap ordered by f
struct Node {
    int f, g, state;
    bool operator>(const Node& o) const {   // 自訂比較讓 priority_queue 依 f 值排序成小根堆
        return f > o.f;
    }
};
int astar(int start, int goal) {
    priority_queue<Node, vector<Node>, greater<Node>> pq;
    pq.push({heuristic(start), 0, start});   // 起點 g=0，f 就等於估價本身
    while (!pq.empty()) {
        Node cur = pq.top();
        pq.pop();
        if (is_goal(cur.state, goal)) {
            return cur.g;   // 只要 heuristic 可採納（不高估），第一次取出目標時的 g 就是最優解
        }
        if (cur.g > dist[cur.state]) {
            continue;        // 惰性刪除：這是該狀態較舊、較差的一筆紀錄，跳過
        }
        for (auto [nxt, w] : g[cur.state]) {
            int ng = cur.g + w;
            if (ng < dist[nxt]) {
                dist[nxt] = ng;
                pq.push({ng + heuristic(nxt), ng, nxt});   // f = 新的已走代價 + 估計剩餘代價，決定它在堆中的優先順序
            }
        }
    }
    return -1;
}`
          },
          {
            title: 'IDA* 算法',
            summary:
              '迭代加深 + 估價：以「g+h ≤ limit」為界做 DFS，超界即剪枝並回溯；每輪把 limit 放大到本輪最小的超界值。空間 O(深度)，適合狀態多、難以雜湊的問題（如八數碼）。',
            code: `// IDA* 算法: 用「深度限制的 DFS」取代 A* 的優先佇列，靠反覆放寬限制逼近答案，省去維護大量節點的記憶體。
bool dfs(int g, int limit) {
    int h = heuristic();
    if (g + h > limit) {
        // 這條路徑已經確定超出本輪限制，剪掉它；同時記錄「最小的超界值」，作為下一輪要放寬到的新限制
        next_limit = min(next_limit, g + h);
        return false;
    }
    if (is_goal()) {
        return true;   // 因為 g+h <= limit 的檢查已保證不會漏掉更優解，第一次到達目標即最優
    }
    // enumerate next moves, then recurse...   // 對每個可行的下一步遞迴呼叫 dfs(g + cost, limit)，任何一條成功就整體回傳 true
    return false;
}`
          }
        ]
      }
    ]
  },
  {
    id: 'strengthening-dp',
    sourceChapter: 8,
    title: '動態規劃提升',
    leetcodeProblemIds: [
      'treedp-lc-124',
      'bm-lc-698',
      'treedp-lc-968',
      'bm-lc-1239',
      'treedp-lc-337',
      'treedp-lc-543',
      'treedp-lc-834',
      'bm-lc-847',
      'lc-943',
      'mono-003',
      'lc-1438',
      'dp-002',
      'lc-2463'
    ],
    topics: [
      {
        title: '樹狀動態規劃',
        summary:
          '在樹上做 DP，自底向上合併子樹資訊。狀態常為 f[u][狀態]，在 DFS 回溯（後序）時用子節點更新父節點。最大獨立集是最典型例子。',
        code: `// 樹狀動態規劃: 以最大獨立集為例，f[u][1]/f[u][0] 分別是「選/不選 u」時，u 的子樹能得到的最大權重和。
void dfs(int u, int parent) {
    f[u][1] = a[u];              // pick u：選了 u，之後子節點就不能再選（獨立集限制），先只計入 u 自己的權重
    f[u][0] = 0;                 // skip u：不選 u，子節點各自自由選或不選，等下面迴圈逐步累加
    for (int v : g[u]) {
        if (v != parent) {       // 用 parent 避免往回走到父節點，樹上 DFS 必備的技巧
            dfs(v, u);            // 先遞迴處理子樹，回溯時子節點的 f 值才是齊全的
            f[u][0] += max(f[v][0], f[v][1]);   // u 不選：子節點選或不選都可以，取較優者
            f[u][1] += f[v][0];                  // u 選了：子節點就不能選（避免相鄰都被選中），只能加上 f[v][0]
        }
    }
}`,
        complexity: 'O(n)'
      },
      {
        title: '狀態壓縮動態規劃',
        summary:
          '用整數的二進位位元表示「集合狀態」，適合 n≤20 的子集問題（旅行商、棋盤覆蓋）。枚舉子集要用 for(int s=m; s; s=(s-1)&m) 才是 O(3^n)。',
        code: `// 狀態壓縮動態規劃: 用一個整數的每個二進位位元代表「第 i 個城市是否已拜訪」，把「集合」壓成一個可當陣列下標的數字。
// TSP: dp[mask][i] = shortest path having visited set mask, currently at i
for (int mask = 1; mask < (1 << n); ++mask) {         // 枚舉所有可能的已訪問集合
    for (int i = 0; i < n; ++i) {
        if ((mask >> i) & 1) {          // 額外加上括號讓「先取出第 i 位」的意圖更明確，避免誤解位移與 & 的優先順序
            for (int j = 0; j < n; ++j) {
                if (!((mask >> j) & 1)) {   // j 還沒被拜訪過，才能作為下一步要去的城市
                    int new_mask = mask | (1 << j);   // 把第 j 位設成 1，代表拜訪過 j 之後的新集合
                    dp[new_mask][j] = min(dp[new_mask][j], dp[mask][i] + d[i][j]);   // 從 i 走到 j，用新的最短路更新
                }
            }
        }
    }
}`,
        complexity: 'TSP O(2^n · n^2)'
      },
      {
        title: '動態規劃優化 (倍增、資料結構、單調隊列)',
        summary: '當轉移本身是瓶頸時，用工具加速「找最優前驅」這一步。',
        children: [
          {
            title: '倍增優化',
            summary: '轉移具「跳 2^k 步」結構時，預處理倍增表把逐步轉移壓成 O(log) 次跳躍。'
          },
          {
            title: '資料結構優化',
            summary:
              '轉移要在某個範圍取最值/求和時，用線段樹或樹狀陣列維護 dp 值，把每步的 O(n) 查詢降到 O(log n)。'
          },
          {
            title: '單調隊列優化',
            summary:
              '轉移是「在滑動視窗內取最值」時，用單調隊列維護候選：隊頭是視窗最優、過期就彈出，隊尾維持單調。把 O(nk) 降到 O(n)。',
            code: `// 單調隊列優化: 雙端佇列存的是「候選最優決策點的下標」，隊頭永遠是目前視窗內最優者，兩個彈出條件缺一不可。
deque<int> dq;                        // stores indices while maintaining monotonic values
for (int i = 0; i < n; ++i) {
    while (!dq.empty() && dq.front() < i - k) {      // out of window, discard：隊頭已經超出視窗範圍，即使值再好也不能用
        dq.pop_front();
    }
    f[i] = a[i] + (dq.empty() ? 0 : f[dq.front()]);   // 隊頭是目前視窗內的最優決策點，直接拿來轉移
    while (!dq.empty() && f[dq.back()] >= f[i]) {    // maintain monotonicity by popping larger values：隊尾比 i 差且更早過期，永遠不會被選中，可以直接淘汰
        dq.pop_back();
    }
    dq.push_back(i);                  // i 有機會成為未來視窗的最優解，加入隊尾候選
}`,
            complexity: 'O(n)'
          }
        ]
      }
    ]
  },
  {
    id: 'strengthening-advanced-math',
    sourceChapter: 9,
    title: '進階數論與博弈論',
    topics: [
      {
        title: '同餘與逆元',
        summary: '模意義下的除法要靠「乘法逆元」。a 的逆元 a⁻¹ 滿足 a·a⁻¹≡1 (mod m)，於是 b/a ≡ b·a⁻¹。',
        children: [
          {
            title: '擴展歐幾里得演算法 (ExGCD)',
            summary:
              '在求 gcd 的同時求出 ax+by=gcd(a,b) 的一組整數解。可用來求逆元（gcd=1 時 x 即 a⁻¹）與解線性同餘方程。',
            code: `// 擴展歐幾里得演算法 (ExGCD): 在遞迴求 gcd 的同時，反推出滿足 ax+by=gcd(a,b) 的一組整數解 x, y。
long long extended_gcd(long long a, long long b, long long& x, long long& y) {
    if (!b) {
        x = 1;    // 邊界：a*1 + b*0 = a = gcd(a, 0)，恆成立
        y = 0;
        return a;
    }
    long long g = extended_gcd(b, a % b, y, x);   // 遞迴解 bx' + (a mod b)y' = g，注意 x、y 故意對調傳入
    y -= a / b * x;   // 由 bx' + (a - floor(a/b)*b)y' = g 展開整理，反推出對應到 (a, b) 的解
    return g;
}`,
            complexity: 'O(log min(a,b))'
          },
          {
            title: '乘法逆元 (費馬小定理與ExGCD求法)',
            summary:
              '模 p 為質數時，由費馬小定理 a⁻¹ ≡ a^(p−2)，用快速冪求；模非質數但與 a 互質時用 ExGCD 求。需要 1..n 全部逆元時可線性遞推。',
            code: `// 乘法逆元 (費馬小定理與ExGCD求法): 費馬小定理告訴我們 a^(p-1) ≡ 1 (mod p)，兩邊除以 a 就得到 a 的逆元是 a^(p-2)。
long long inv(long long a, long long p) {
    return mod_pow(a, p - 2, p);   // 直接沿用前面寫好的快速冪，O(log p) 求出逆元
} // p must be prime for Fermat's little theorem`,
            complexity: 'O(log p)'
          }
        ]
      },
      {
        title: '中國剩餘定理 (CRT)',
        summary:
          '解一組模兩兩互質的同餘方程 x≡a_i (mod m_i)。令 M=∏m_i，x=Σ a_i·M_i·(M_i⁻¹ mod m_i) mod M，其中 M_i=M/m_i。模數不互質時用擴展 CRT 逐步合併。',
        code: `// 中國剩餘定理 (CRT): 對每個方程構造一項「只在 mod m[i] 時餘 a[i]、對其他模數則整除」的貢獻，加總即為解。
// extended_gcd finds the modular inverse of a modulo m; m[] are pairwise coprime
long long crt(int k, long long a[], long long m[]) {
    long long mod_product = 1, ans = 0;
    for (int i = 0; i < k; ++i) {
        mod_product *= m[i];   // 所有模數的乘積 M，最終答案落在 [0, M) 內唯一
    }
    for (int i = 0; i < k; ++i) {
        long long modulus_part = mod_product / m[i];   // M_i = M / m[i]，它必定是其他所有 m[j] 的倍數（j != i）
        long long x, y;
        extended_gcd(modulus_part, m[i], x, y);  // modulus_part * x ≡ 1 (mod m[i])，x 就是 M_i 對 m[i] 的逆元
        // a[i] * M_i * (M_i 的逆元) 這一項：對 m[i] 取模餘 a[i]，對其他 m[j] 取模則因含 M_i 因子而為 0，恰好互不干擾
        ans = (ans + a[i] * modulus_part % mod_product * (x % m[i]) % mod_product) % mod_product;
    }
    return (ans % mod_product + mod_product) % mod_product;   // 累加過程可能出現負值（x 可能為負），最後修正回 [0, M)
}`,
        complexity: 'O(k log M)'
      },
      {
        title: '組合數學',
        summary: '計數的核心工具。競程常在模質數下求組合數，選法看 n 的規模。',
        children: [
          {
            title: '排列組合計算',
            summary: 'C(n,k)=n!/(k!(n−k)!)。模 p 下預處理階乘與階乘逆元後可 O(1) 查詢任意 C(n,k)。',
            code: `// 排列組合計算: 先 O(n) 預處理所有階乘與階乘的逆元，之後每次查詢 C(n,k) 只需三次乘法，O(1)。
long long fac[kMaxN], ifac[kMaxN];
void init(int n, long long p) {
    fac[0] = 1;
    for (int i = 1; i <= n; ++i) {
        fac[i] = fac[i - 1] * i % p;   // fac[i] = i! mod p
    }
    ifac[n] = mod_pow(fac[n], p - 2, p);   // 只算一次快速冪求出「最大階乘」的逆元，其餘用遞推即可，避免呼叫 n 次快速冪
    for (int i = n; i; --i) {
        ifac[i - 1] = ifac[i] * i % p;   // 利用 (i!)^-1 * i = (i-1)!^-1，遞推出所有更小的階乘逆元，O(1) 每步
    }
}
long long combination(int n, int k, long long p) {
    if (k < 0 || k > n) {
        return 0;   // 選的數量超出範圍，組合數定義為 0
    }
    return fac[n] * ifac[k] % p * ifac[n - k] % p;   // C(n,k) = n! / (k!(n-k)!)，除法在模意義下用乘逆元取代
}`,
            complexity: '預處理 O(n)，查詢 O(1)'
          },
          {
            title: 'Lucas 定理',
            summary:
              'n、k 很大而模 p 為較小質數時，把 n、k 寫成 p 進位，C(n,k) mod p = ∏ C(n_i, k_i) mod p，遞迴計算。',
            code: `// Lucas 定理: 把 n, k 表示成 p 進位後逐位計算 C(n_i, k_i) 再相乘，繞開直接算 n! 在 n 很大時無法預處理的問題。
// combination(n, k) is the binomial coefficient modulo p as defined in the previous section (p must be prime)
long long lucas(long long n, long long k, long long p) {
    if (k == 0) {
        return 1;   // 邊界：C(n, 0) 恆為 1，遞迴到這裡代表 p 進位下的每一位都處理完了
    }
    // n % p、k % p 是這一位的數字（< p，可以直接用預處理好的 combination 查表），n / p、k / p 遞迴處理更高位
    return lucas(n / p, k / p, p) * combination(n % p, k % p, p) % p;
}`,
            complexity: 'O(p + log_p n)'
          }
        ]
      },
      {
        title: '矩陣快速冪',
        summary: '把線性遞推寫成矩陣乘法，再用快速冪把第 n 項從 O(n) 降到 O(k^3 log n)。',
        children: [
          {
            title: '矩陣乘法基礎',
            summary: 'c[i][j]=Σ a[i][k]·b[k][j]，注意過程取模與 long long 防溢位。',
            code: `// 矩陣乘法基礎: 把迴圈順序從教科書慣用的 i-j-k 換成 i-k-j，讓內層迴圈存取 b.a[k][j] 時是連續記憶體，加速快取命中。
Mat operator*(const Mat& a, const Mat& b) {
    Mat c{};
    for (int i = 0; i < kDimension; ++i) {
        for (int k = 0; k < kDimension; ++k) {
            if (a.a[i][k]) {                 // a.a[i][k] 若是 0，這一整層 j 迴圈的貢獻必然是 0，跳過可省下常數時間
                for (int j = 0; j < kDimension; ++j) {
                    c.a[i][j] = (c.a[i][j] + a.a[i][k] * b.a[k][j]) % kMod;   // 過程中乘積可能很大，要記得逐步取模
                }
            }
        }
    }
    return c;
}`
          },
          {
            title: '利用矩陣快速冪優化 DP 轉移',
            summary:
              '當 DP 轉移是「固定的線性組合」且步數極大（如 10^18）時，把一步轉移寫成轉移矩陣 T，答案 = T^n · 初始向量，用矩陣快速冪求。',
            complexity: 'O(k^3 log n)'
          }
        ]
      },
      {
        title: '博弈論基礎',
        summary: '公平組合遊戲的必勝/必敗分析。核心是 SG 函數與其異或和。',
        children: [
          {
            title: 'Nim 遊戲',
            summary: '多堆石子輪流取，取完者勝。結論：各堆石子數的異或和為 0 時先手必敗，否則先手必勝。',
            code: `// Nim 遊戲: 結論本身要用 SG 理論證明，但實作上只需一行——所有堆的石子數異或起來，非零先手必勝。
int x = 0;
for (int s : piles) {
    x ^= s;   // 逐堆異或累加，最終 x 就是整個遊戲的 SG 值
}
bool first_win = (x != 0);   // 異或和為 0 是必敗局面（無論怎麼取都會讓對手回到必敗態），否則先手必勝`
          },
          {
            title: 'SG 函數與 Sprague-Grundy 定理',
            summary:
              '單個遊戲狀態的 SG = 其所有後繼 SG 的 mex（最小未出現非負整數）。多個獨立遊戲的和，其 SG = 各子遊戲 SG 的異或；為 0 即必敗態。',
            code: `// SG 函數與 Sprague-Grundy 定理: 一個狀態的 SG 值定義成「所有後繼狀態 SG 值」的 mex，是 Nim 堆的推廣。
int sg(int x) {
    if (computed[x]) {
        return f[x];      // 記憶化：同一個狀態的 SG 值只需算一次
    }
    set<int> s;
    for (int nx : moves(x)) {   // 列舉所有能從 x 一步走到的後繼狀態
        s.insert(sg(nx));        // 先遞迴算出每個後繼的 SG 值，收集成一個集合
    }
    int m = 0;
    while (s.count(m)) {     // mex：從 0 開始找「最小的、不在後繼 SG 值集合中」的非負整數
        ++m;
    }
    return f[x] = m;   // 這個 mex 值就是 x 的 SG 值；SG 值為 0 代表 x 是必敗態
}`
          }
        ]
      }
    ]
  }
];
