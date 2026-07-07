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
        summary:
          '兩端都能 O(1) 增刪的序列，且支援隨機存取。是單調隊列、滑動窗口最值的底層容器。',
        code: `// deque（雙端隊列）: 兩端操作都是 O(1)。
deque<int> dq;
dq.push_back(1);
dq.push_front(0);
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
priority_queue<int> max_heap;                         // max-heap
priority_queue<int, vector<int>, greater<>> min_heap; // min-heap
min_heap.push(3);
min_heap.push(1);
int mn = min_heap.top();
min_heap.pop();`,
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
            code: `// 定義與初始化: 現代 C++ 範例，註解標出此段的核心意圖。
bitset<1000> b;          // all zeros
bitset<8> c(0b1010);     // from integer
bitset<8> d("1100");     // from string`
          },
          {
            title: '基本操作',
            summary: 'set/reset/flip 單位或全體，count() 數 1，test(i) 查位，並支援 & | ^ << >> 做集合運算，常數極小。',
            code: `// 基本操作: 現代 C++ 範例，註解標出此段的核心意圖。
b.set(3); b.reset(0); b.flip();
int ones = b.count();
bitset<1000> inter = x & y;   // set intersection`
          }
        ]
      },
      {
        title: 'set、multiset（集合、多重集合）',
        summary:
          '紅黑樹實作的有序集合，增刪查皆 O(log n)。set 去重、multiset 允許重複。務必用「成員函數」lower_bound/upper_bound（O(log n)），別用 std::lower_bound（對 set 退化 O(n)）。',
        code: `// set、multiset（集合、多重集合）: 現代 C++ 範例，註解標出此段的核心意圖。
set<int> s = {1, 4, 9};
s.insert(5);
auto it = s.lower_bound(5);   // first element that is >= 5
multiset<int> ms; ms.insert(2); ms.insert(2);
if (auto it2 = ms.find(2); it2 != ms.end()) {
    ms.erase(it2);            // erase only one; erase(key) removes all duplicates
}`,
        complexity: 'O(log n) 每次操作'
      },
      {
        title: 'map、multimap（映射、多重映射）',
        summary:
          '有序鍵值對，按鍵排序，增刪查 O(log n)。map[k] 存取不存在的鍵會「自動插入」預設值，只想查詢請用 count/find。追求速度且不需有序時改 unordered_map（平均 O(1)）。',
        code: `// map、multimap（映射、多重映射）: 現代 C++ 範例，註解標出此段的核心意圖。
map<string, int> cnt;
cnt["apple"]++;               // inserts 0 then increments if the key was absent
if (cnt.contains("banana")) { /* C++20 membership test */ }
for (auto& [k, v] : cnt) {
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
ranges::fill(dist, kInf);
fill(a.begin(), a.end(), 0);  // use fill instead of byte-wise memset for typed values`
          },
          {
            title: 'nth_element()',
            summary: '把第 k 小放到定位，且左邊皆不大於它、右邊皆不小於它，平均 O(n)——不必整段排序即取第 k 小。',
            code: `// nth_element(): 只保證第 k 小定位，不會完全排序。
ranges::nth_element(a, a.begin() + k);
int kth = a[k];`,
            complexity: '平均 O(n)'
          },
          {
            title: 'lower_bound()、upper_bound()',
            summary:
              '在有序區間二分：lower_bound 找第一個 ≥ x，upper_bound 找第一個 > x。兩者相減即某值出現次數。',
            code: `// lower_bound()、upper_bound(): 對已排序容器做二分。
auto first = ranges::lower_bound(a, x);
auto last = ranges::upper_bound(a, x);
int cnt = static_cast<int>(last - first);`,
            complexity: 'O(log n)'
          },
          {
            title: 'next_permutation()、prev_permutation()',
            summary: '就地產生字典序的下一個/上一個排列，回傳是否還有下一個。配 do-while 可枚舉全排列。',
            code: `// next_permutation()、prev_permutation(): C++20 ranges 版本回傳結果物件。
ranges::sort(a);
do {
    /* use this permutation */
} while (ranges::next_permutation(a).found);`,
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
        code: `// 並查集: 現代 C++ 範例，註解標出此段的核心意圖。
int parent[kMaxN], sz[kMaxN];
void init(int n) {
    for (int i = 1; i <= n; ++i) {
        parent[i] = i;
        sz[i] = 1;
    }
}
int find(int x) {
    return parent[x] == x ? x : parent[x] = find(parent[x]);
}
void uni(int a, int b) {
    a = find(a);
    b = find(b);
    if (a == b) {
        return;
    }
    if (sz[a] < sz[b]) {
        swap(a, b);
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
              '對「可重複貢獻」的運算（max/min/gcd）預處理 st[i][k]=區間 [i, i+2^k−1] 的值，O(n log n) 建表。',
            code: `// 稀疏表: 現代 C++ 範例，註解標出此段的核心意圖。
int st[kMaxN][20];
for (int i = 0; i < n; ++i) {
    st[i][0] = a[i];
}
for (int k = 1; (1 << k) <= n; ++k) {
    for (int i = 0; i + (1 << k) <= n; ++i) {
        st[i][k] = max(st[i][k - 1], st[i + (1 << (k - 1))][k - 1]);
    }
}`,
            complexity: '建表 O(n log n)'
          },
          {
            title: '區間值查詢',
            summary:
              '查 [l,r] 時取 k=⌊log2(r−l+1)⌋，用兩個長 2^k 的區間覆蓋（可重疊）取極值，O(1)。僅適用可重複貢獻運算，區間求和不可用。',
            code: `// 區間值查詢: bit_width 取得 floor(log2(length))。
int query(int l, int r) {
    int len = r - l + 1;
    int k = static_cast<int>(bit_width(static_cast<unsigned>(len)) - 1);
    return max(st[l][k], st[r - (1 << k) + 1][k]);
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
            code: `// 樹上倍增法: 現代 C++ 範例，註解標出此段的核心意圖。
int up[kMaxN][20], depth[kMaxN];
int lca(int u, int v) {
    if (depth[u] < depth[v]) {
        swap(u, v);
    }
    for (int k = 19; k >= 0; --k) {
        if (depth[up[u][k]] >= depth[v]) {
            u = up[u][k];
        }
    }
    if (u == v) {
        return u;
    }
    for (int k = 19; k >= 0; --k) {
        if (up[u][k] != up[v][k]) {
            u = up[u][k];
            v = up[v][k];
        }
    }
    return up[u][0];
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
            code: `// 一維樹狀數組: 現代 C++ 範例，註解標出此段的核心意圖。
int c[kMaxN];
void add(int i, int v) {
    for (; i <= n; i += i & -i) {
        c[i] += v;
    }
}
int sum(int i) {
    int s = 0;
    for (; i; i -= i & -i) {
        s += c[i];
    }
    return s;
}`,
            complexity: 'O(log n) 每次'
          },
          {
            title: '多維樹狀數組',
            summary: '把 lowbit 跳躍套在每一維上，二維即巢狀兩層迴圈，支援單點改、子矩陣和。',
            code: `// 多維樹狀數組: 現代 C++ 範例，註解標出此段的核心意圖。
void add(int x, int y, int v) {
    for (int i = x; i <= n; i += i & -i) {
        for (int j = y; j <= m; j += j & -j) {
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
            code: `// 基本操作: 現代 C++ 範例，註解標出此段的核心意圖。
int t[4 * kMaxN];
void build(int p, int l, int r) {
    if (l == r) {
        t[p] = a[l];
        return;
    }
    int m = (l + r) / 2;
    build(2 * p, l, m);
    build(2 * p + 1, m + 1, r);
    t[p] = t[2 * p] + t[2 * p + 1];
}
int query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) {
        return t[p];
    }
    int m = (l + r) / 2, s = 0;
    if (ql <= m) {
        s += query(2 * p, l, m, ql, qr);
    }
    if (qr > m) {
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
            code: `// 懶操作: 現代 C++ 範例，註解標出此段的核心意圖。
long long tag[4 * kMaxN];
void push_down(int p, int l, int r) {
    if (!tag[p]) {
        return;
    }
    int m = (l + r) / 2;
    t[2 * p] += tag[p] * (m - l + 1);
    tag[2 * p] += tag[p];
    t[2 * p + 1] += tag[p] * (r - m);
    tag[2 * p + 1] += tag[p];
    tag[p] = 0;
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
            summary: '每個桶掛一條鏈（或 vector），衝突元素串在同桶。實作簡單、對負載因子較不敏感，是 STL 的做法。'
          },
          {
            title: '建立公共溢位區',
            summary: '主表之外另設一塊溢位區，所有衝突元素統一放溢位區，查詢時主表未命中再查溢位區。'
          },
          {
            title: '散列查找及其性能分析',
            summary: '平均查找長度取決於負載因子 α=元素數/桶數。α 越小越快但越費空間，通常維持 α<0.75 並適時再雜湊擴容。'
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
            code: `// KMP 算法: 現代 C++ 範例，註解標出此段的核心意圖。
vector<int> nxt(m);
for (int i = 1, j = 0; i < m; ++i) {
    while (j && p[i] != p[j]) {
        j = nxt[j - 1];
    }
    if (p[i] == p[j]) {
        ++j;
    }
    nxt[i] = j;
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
            code: `// 創建: 現代 C++ 範例，註解標出此段的核心意圖。
int ch[kMaxN][26], cnt[kMaxN], total_nodes;
void insert(const string& s) {
    int u = 0;
    for (char c : s) {
        int x = c - 'a';
        if (!ch[u][x]) {
            ch[u][x] = ++total_nodes;
        }
        u = ch[u][x];
    }
    cnt[u]++;
}`,
            complexity: 'O(|s|)'
          },
          {
            title: '查找',
            summary: '沿字元往下走，走不通即不存在；走到終點看標記判斷是否為完整詞。',
            code: `// 查找: 現代 C++ 範例，註解標出此段的核心意圖。
bool find(const string& s) {
    int u = 0;
    for (char c : s) {
        int x = c - 'a';
        if (!ch[u][x]) {
            return false;
        }
        u = ch[u][x];
    }
    return cnt[u] > 0;
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
            code: `// Rabin-Karp 演算法: constexpr 表示 base 是編譯期常數。
constexpr unsigned long long kBase = 131;
unsigned long long h[kMaxN], pw[kMaxN];
// preprocess the prefix function
pw[0] = 1;
for (int i = 1; i <= n; ++i) {
    h[i] = h[i - 1] * kBase + s[i];
    pw[i] = pw[i - 1] * kBase;
}
auto sub = [&](int l, int r) {
    return h[r] - h[l - 1] * pw[r - l + 1];
};`,
            complexity: '預處理 O(n)，查詢 O(1)'
          },
          {
            title: '雙重哈希防碰撞技巧',
            summary:
              '用兩組不同的 base/模同時雜湊，兩者都相等才判相等，碰撞機率降到可忽略。或用 unsigned long long 自然溢位配隨機 base 防被 hack。',
            code: `// 雙重哈希防碰撞技巧: 兩組 base/mod 同時相等才視為同一子串。
constexpr long long kBase1 = 131, kBase2 = 13331;
constexpr long long kMod1 = 1'000'000'007LL, kMod2 = 998'244'353LL;
long long h1[kMaxN], h2[kMaxN], p1[kMaxN], p2[kMaxN];
void build(const string& s) {
    int n = s.size();
    p1[0] = p2[0] = 1;
    for (int i = 1; i <= n; ++i) {
        h1[i] = (h1[i - 1] * kBase1 + s[i - 1]) % kMod1;
        h2[i] = (h2[i - 1] * kBase2 + s[i - 1]) % kMod2;
        p1[i] = p1[i - 1] * kBase1 % kMod1;
        p2[i] = p2[i - 1] * kBase2 % kMod2;
    }
}
// hash pair for substring [l, r] (1-indexed); both halves must match for equality
pair<long long, long long> get(int l, int r) {
    long long a = ((h1[r] - h1[l - 1] * p1[r - l + 1]) % kMod1 + kMod1) % kMod1;
    long long b = ((h2[r] - h2[l - 1] * p2[r - l + 1]) % kMod2 + kMod2) % kMod2;
    return {a, b};
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
            code: `// O(n) 求解最長回文子串: 現代 C++ 範例，註解標出此段的核心意圖。
string t = "^#";
for (char c : s) {
    t += c;
    t += '#';
}
t += '$';
vector<int> p(t.size());
int c = 0, r = 0;
for (int i = 1; i + 1 < (int)t.size(); ++i) {
    if (i < r) {
        p[i] = min(r - i, p[2 * c - i]);
    }
    while (t[i + p[i] + 1] == t[i - p[i] - 1]) {
        ++p[i];
    }
    if (i + p[i] > r) {
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
            code: `// 右旋和左旋: 現代 C++ 範例，註解標出此段的核心意圖。
// right rotation: promote y, the left child of x
Node* rotate_right(Node* x) {
    Node* y = x->l;
    x->l = y->r;
    y->r = x;
    upd(x);
    upd(y);
    return y;
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
            code: `// 宣告與基本操作: 現代 C++ 範例，註解標出此段的核心意圖。
#include <ext/pb_ds/assoc_container.hpp>
#include <ext/pb_ds/tree_policy.hpp>
using namespace __gnu_pbds;

// <key_type, mapped_type, comparator, underlying_tree, node_update>
// mapped_type = null_type means an ordered set of keys only (equivalent to std::set)
using ordered_set = tree<
    int,
    null_type,
    std::less<>,
    rb_tree_tag,
    tree_order_statistics_node_update>;

ordered_set s;
s.insert(10);
s.insert(30);
s.insert(20);
if (s.find(20) != s.end()) {
    s.erase(20);
}`,
            complexity: '每次操作 O(log n)'
          },
          {
            title: '排名與第 k 小',
            summary:
              '`find_by_order(k)` 回傳「第 k 小」（0-indexed）元素的迭代器；`order_of_key(x)` 回傳「嚴格小於 x 的元素個數」，也就是 x 的排名（0-indexed）。兩者都是 O(log n)，正是手寫平衡樹最花時間維護的子樹大小功能。',
            code: `// 排名與第 k 小: 現代 C++ 範例，註解標出此段的核心意圖。
ordered_set s;
for (int x : {10, 20, 30, 40}) {
    s.insert(x);
}

// k-th smallest (0-indexed): find_by_order
int second = *s.find_by_order(1);   // 20

// rank: order_of_key returns the number of elements strictly less than x
int rank_30 = s.order_of_key(30);    // 2 (10 and 20 are less than 30)
int rank_35 = s.order_of_key(35);    // 3 (10, 20 and 30 are less than 35, so 35 would be inserted at index 3)`,
            complexity: 'O(log n)'
          },
          {
            title: '需要可重複值（multiset）怎麼辦',
            summary:
              '預設 `std::less` 會像 `std::set` 一樣去重。想保留重複值，最穩健的做法是改存 `pair<值, 唯一時間戳>`：每個元素因時間戳不同而唯一，查某個值的排名時用 `order_of_key({v, 極小值})`。直接改用 `std::less_equal` 雖能塞入重複值，但會讓 `find` 與 `erase(value)` 失效（比較子不再是嚴格弱序），除非必要不建議。',
            code: `// 需要可重複值（multiset）怎麼辦: 現代 C++ 範例，註解標出此段的核心意圖。
// to keep duplicates, store pair<value, unique timestamp> sorted with std::less
using ordered_multiset = tree<
    std::pair<int, int>,
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
int rank = s.order_of_key({20, -1});`,
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
            code: `// 無向圖的橋: 現代 C++ 範例，註解標出此段的核心意圖。
void tarjan(int u, int fe) {           // fe: id of the incoming edge
    discovery_time[u] = low[u] = ++timer;
    for (auto [v, id] : g[u]) {
        if (!discovery_time[v]) {
            tarjan(v, id);
            low[u] = min(low[u], low[v]);
            if (low[v] > discovery_time[u]) {
                is_bridge[id] = true;
            }
        } else if (id != (fe ^ 1)) {
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
            code: `// 無向圖的割點: 現代 C++ 範例，註解標出此段的核心意圖。
int timer;
int discovery_time[kMaxN], low[kMaxN];
bool cut[kMaxN];
void tarjan(int u, int root) {
    discovery_time[u] = low[u] = ++timer;
    int child = 0;
    for (int v : g[u]) {
        if (!discovery_time[v]) {
            ++child;
            tarjan(v, root);
            low[u] = min(low[u], low[v]);
            if (u != root && low[v] >= discovery_time[u]) {
                cut[u] = true;
            }
        } else {
            low[u] = min(low[u], discovery_time[v]);
        }
    }
    if (u == root && child >= 2) {
        cut[u] = true;
    }
}`,
            complexity: 'O(n+m)'
          },
          {
            title: '有向圖的強連通分量',
            summary:
              '用堆疊存當前路徑，回溯時若 dfn[u]==low[u]，則從堆疊彈出直到 u，這批點構成一個 SCC。low 只用「仍在堆疊中」的點更新。',
            code: `// 有向圖的強連通分量: 現代 C++ 範例，註解標出此段的核心意圖。
void tarjan(int u) {
    discovery_time[u] = low[u] = ++timer;
    stk.push(u);
    in_stack[u] = true;
    for (int v : g[u]) {
        if (!discovery_time[v]) {
            tarjan(v);
            low[u] = min(low[u], low[v]);
        } else if (in_stack[v]) {
            low[u] = min(low[u], discovery_time[v]);
        }
    }
    if (discovery_time[u] == low[u]) {
        int x;
        do {
            x = stk.top();
            stk.pop();
            in_stack[x] = false;
            comp[x] = scc;
        } while (x != u);
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
            code: `// Hierholzer 演算法: 現代 C++ 範例，註解標出此段的核心意圖。
void dfs(int u) {
    while (head[u] < (int)g[u].size()) {
        int v = g[u][head[u]++];         // current arc optimization (skips saturated edges)
        dfs(v);
    }
    order.push_back(u);
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
            code: `// 二分圖染色判定: 現代 C++ 範例，註解標出此段的核心意圖。
bool bfs(int s) {
    queue<int> q;
    q.push(s);
    col[s] = 0;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : g[u]) {
            if (col[v] == -1) {
                col[v] = col[u] ^ 1;
                q.push(v);
            } else if (col[v] == col[u]) {
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
            code: `// Prim 算法: 現代 C++ 範例，註解標出此段的核心意圖。
priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;
pq.push({0, s});
long long mst = 0;
while (!pq.empty()) {
    auto [d, u] = pq.top();
    pq.pop();
    if (visited[u]) {
        continue;
    }
    visited[u] = true;
    mst += d;
    for (auto [v, w] : g[u]) {
        if (!visited[v]) {
            pq.push({w, v});
        }
    }
}`,
            complexity: 'O(m log n)'
          },
          {
            title: 'Kruskal 算法',
            summary: '所有邊按權升序，用並查集依序加入不成環的邊，直到選滿 n−1 條。適合稀疏圖，最常用。',
            code: `// Kruskal 算法: 現代 C++ 範例，註解標出此段的核心意圖。
sort(edges.begin(), edges.end(), [](auto& a, auto& b) { return a.w < b.w; });
long long mst = 0;
int cnt = 0;
for (auto& e : edges) {
    if (find(e.u) != find(e.v)) {
        uni(e.u, e.v);
        mst += e.w;
        if (++cnt == n - 1) {
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
            code: `// Dijkstra 算法: 用足夠大的 kInf，避免 dist + w 溢位。
constexpr long long kInf = numeric_limits<long long>::max() / 4;
priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;
fill(dist, dist + n + 1, kInf);
dist[s] = 0;
pq.push({0, s});
while (!pq.empty()) {
    auto [d, u] = pq.top();
    pq.pop();
    if (d > dist[u]) {
        continue;
    }
    for (auto [v, w] : g[u]) {
        if (d + w < dist[v]) {
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
            code: `// Floyd 算法: 現代 C++ 範例，註解標出此段的核心意圖。
for (int k = 1; k <= n; ++k) {
    for (int i = 1; i <= n; ++i) {
        for (int j = 1; j <= n; ++j) {
            d[i][j] = min(d[i][j], d[i][k] + d[k][j]);
        }
    }
}`,
            complexity: 'O(n^3)'
          },
          {
            title: 'Bellman-Ford 算法',
            summary:
              '單源、可含負權。對所有邊做 n−1 輪鬆弛（最短路至多 n−1 條邊）；若第 n 輪還能鬆弛則存在負環。O(nm)，穩健但慢。',
            code: `// Bellman-Ford 算法: 額外一輪鬆弛可判斷負環。
constexpr long long kInf = numeric_limits<long long>::max() / 4;
fill(dist, dist + n + 1, kInf);
dist[s] = 0;
for (int i = 1; i < n; ++i) {
    for (auto& e : edges) {
        if (dist[e.u] != kInf && dist[e.u] + e.w < dist[e.v]) {
            dist[e.v] = dist[e.u] + e.w;
        }
    }
}
bool neg = false;                        // one extra relaxation round to detect negative cycles
for (auto& e : edges) {
    if (dist[e.u] != kInf && dist[e.u] + e.w < dist[e.v]) {
        neg = true;
    }
}`,
            complexity: 'O(nm)'
          },
          {
            title: 'SPFA 算法',
            summary:
              'Bellman-Ford 的佇列優化：只有距離被更新的點才重新入隊鬆弛鄰居。平均很快，但特殊構造圖會退化 O(nm)，稠密圖或卡常題慎用。判負環看某點入隊次數是否 ≥ n。',
            code: `// SPFA 算法: 只有距離更新過的點才需要重新入隊。
constexpr long long kInf = numeric_limits<long long>::max() / 4;
queue<int> q;
fill(dist, dist + n + 1, kInf);
dist[s] = 0;
q.push(s);
in_queue[s] = true;
while (!q.empty()) {
    int u = q.front();
    q.pop();
    in_queue[u] = false;
    for (auto [v, w] : g[u]) {
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            if (!in_queue[v]) {
                q.push(v);
                in_queue[v] = true;
            }
        }
    }
}`,
            complexity: '平均 O(km)，最壞 O(nm)'
          }
        ]
      },
      {
        title: '拓撲排序',
        summary:
          'DAG 上把所有點排成線性序，使每條邊都從前指向後。Kahn 法用入度為 0 的佇列逐步剝離；排不滿 n 個即存在環。是 DAG 上 DP 的前置。',
        code: `// 拓撲排序: 現代 C++ 範例，註解標出此段的核心意圖。
queue<int> q;
for (int i = 1; i <= n; ++i) {
    if (indeg[i] == 0) {
        q.push(i);
    }
}
vector<int> order;
while (!q.empty()) {
    int u = q.front();
    q.pop();
    order.push_back(u);
    for (int v : g[u]) {
        if (--indeg[v] == 0) {
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
        code: `// 關鍵路徑: 現代 C++ 範例，註解標出此段的核心意圖。
// ve[u] = earliest event time, vl[u] = latest event time
// order is the topological order; g[u] stores (v, w)
void critical_path(int n) {
    for (int u : order) {
        for (auto [v, w] : g[u]) {
            ve[v] = max(ve[v], ve[u] + w);
        }
    }
    for (int i = 0; i < n; ++i) {
        vl[i] = ve[n - 1];
    }
    for (int i = n - 1; i >= 0; --i) {
        int u = order[i];
        for (auto [v, w] : g[u]) {
            vl[u] = min(vl[u], vl[v] - w);
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
        summary: '用估價函數 h（對到目標剩餘代價的估計）引導方向。h 必須「可採納」（不高估真實代價）才能保證最優。',
        children: [
          {
            title: 'A* 算法',
            summary:
              '以 f=g+h（已走代價+估計剩餘）為優先級的優先佇列搜索。h 可採納時首次取出目標即最優解。h 越接近真實、剪枝越強。',
            code: `// a* 算法: 現代 C++ 範例，註解標出此段的核心意圖。
// Node = {f = g + h, g, state}; min-heap ordered by f
struct Node {
    int f, g, state;
    bool operator>(const Node& o) const {
        return f > o.f;
    }
};
int astar(int start, int goal) {
    priority_queue<Node, vector<Node>, greater<Node>> pq;
    pq.push({heuristic(start), 0, start});
    while (!pq.empty()) {
        Node cur = pq.top();
        pq.pop();
        if (is_goal(cur.state, goal)) {
            return cur.g;
        }
        if (cur.g > dist[cur.state]) {
            continue;
        }
        for (auto [nxt, w] : g[cur.state]) {
            int ng = cur.g + w;
            if (ng < dist[nxt]) {
                dist[nxt] = ng;
                pq.push({ng + heuristic(nxt), ng, nxt});
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
            code: `// IDA* 算法: 現代 C++ 範例，註解標出此段的核心意圖。
bool dfs(int g, int limit) {
    int h = heuristic();
    if (g + h > limit) {
        next_limit = min(next_limit, g + h);
        return false;
    }
    if (is_goal()) {
        return true;
    }
    // enumerate next moves, then recurse...
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
        code: `// 樹狀動態規劃: 現代 C++ 範例，註解標出此段的核心意圖。
void dfs(int u, int parent) {
    f[u][1] = a[u];              // pick u
    f[u][0] = 0;                 // skip u
    for (int v : g[u]) {
        if (v != parent) {
            dfs(v, u);
            f[u][0] += max(f[v][0], f[v][1]);
            f[u][1] += f[v][0];
        }
    }
}`,
        complexity: 'O(n)'
      },
      {
        title: '狀態壓縮動態規劃',
        summary:
          '用整數的二進位位元表示「集合狀態」，適合 n≤20 的子集問題（旅行商、棋盤覆蓋）。枚舉子集要用 for(int s=m; s; s=(s-1)&m) 才是 O(3^n)。',
        code: `// 狀態壓縮動態規劃: 現代 C++ 範例，註解標出此段的核心意圖。
// TSP: dp[mask][i] = shortest path having visited set mask, currently at i
for (int mask = 1; mask < (1 << n); ++mask) {
    for (int i = 0; i < n; ++i) {
        if (mask >> i & 1) {
            for (int j = 0; j < n; ++j) {
                if (!(mask >> j & 1)) {
                    dp[mask | 1 << j][j] = min(dp[mask | 1 << j][j], dp[mask][i] + d[i][j]);
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
            code: `// 單調隊列優化: 現代 C++ 範例，註解標出此段的核心意圖。
deque<int> dq;                        // stores indices while maintaining monotonic values
for (int i = 0; i < n; ++i) {
    while (!dq.empty() && dq.front() < i - k) {      // out of window, discard
        dq.pop_front();
    }
    f[i] = a[i] + (dq.empty() ? 0 : f[dq.front()]);
    while (!dq.empty() && f[dq.back()] >= f[i]) {    // maintain monotonicity by popping larger values
        dq.pop_back();
    }
    dq.push_back(i);
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
            code: `// 擴展歐幾里得演算法 (ExGCD): 現代 C++ 範例，註解標出此段的核心意圖。
long long extended_gcd(long long a, long long b, long long& x, long long& y) {
    if (!b) {
        x = 1;
        y = 0;
        return a;
    }
    long long g = extended_gcd(b, a % b, y, x);
    y -= a / b * x;
    return g;
}`,
            complexity: 'O(log min(a,b))'
          },
          {
            title: '乘法逆元 (費馬小定理與ExGCD求法)',
            summary:
              '模 p 為質數時，由費馬小定理 a⁻¹ ≡ a^(p−2)，用快速冪求；模非質數但與 a 互質時用 ExGCD 求。需要 1..n 全部逆元時可線性遞推。',
            code: `// 乘法逆元 (費馬小定理與ExGCD求法): 現代 C++ 範例，註解標出此段的核心意圖。
long long inv(long long a, long long p) {
    return mod_pow(a, p - 2, p);
} // p must be prime for Fermat's little theorem`,
            complexity: 'O(log p)'
          }
        ]
      },
      {
        title: '中國剩餘定理 (CRT)',
        summary:
          '解一組模兩兩互質的同餘方程 x≡a_i (mod m_i)。令 M=∏m_i，x=Σ a_i·M_i·(M_i⁻¹ mod m_i) mod M，其中 M_i=M/m_i。模數不互質時用擴展 CRT 逐步合併。',
        code: `// 中國剩餘定理 (CRT): 現代 C++ 範例，註解標出此段的核心意圖。
// extended_gcd finds the modular inverse of a modulo m; m[] are pairwise coprime
long long crt(int k, long long a[], long long m[]) {
    long long mod_product = 1, ans = 0;
    for (int i = 0; i < k; ++i) {
        mod_product *= m[i];
    }
    for (int i = 0; i < k; ++i) {
        long long modulus_part = mod_product / m[i];
        long long x, y;
        extended_gcd(modulus_part, m[i], x, y);  // modulus_part * x ≡ 1 (mod m[i])
        ans = (ans + a[i] * modulus_part % mod_product * (x % m[i]) % mod_product) % mod_product;
    }
    return (ans % mod_product + mod_product) % mod_product;
}`,
        complexity: 'O(k log M)'
      },
      {
        title: '組合數學',
        summary: '計數的核心工具。競程常在模質數下求組合數，選法看 n 的規模。',
        children: [
          {
            title: '排列組合計算',
            summary:
              'C(n,k)=n!/(k!(n−k)!)。模 p 下預處理階乘與階乘逆元後可 O(1) 查詢任意 C(n,k)。',
            code: `// 排列組合計算: 現代 C++ 範例，註解標出此段的核心意圖。
long long fac[kMaxN], ifac[kMaxN];
void init(int n, long long p) {
    fac[0] = 1;
    for (int i = 1; i <= n; ++i) {
        fac[i] = fac[i - 1] * i % p;
    }
    ifac[n] = mod_pow(fac[n], p - 2, p);
    for (int i = n; i; --i) {
        ifac[i - 1] = ifac[i] * i % p;
    }
}
long long combination(int n, int k, long long p) {
    if (k < 0 || k > n) {
        return 0;
    }
    return fac[n] * ifac[k] % p * ifac[n - k] % p;
}`,
            complexity: '預處理 O(n)，查詢 O(1)'
          },
          {
            title: 'Lucas 定理',
            summary:
              'n、k 很大而模 p 為較小質數時，把 n、k 寫成 p 進位，C(n,k) mod p = ∏ C(n_i, k_i) mod p，遞迴計算。',
            code: `// Lucas 定理: 現代 C++ 範例，註解標出此段的核心意圖。
// combination(n, k) is the binomial coefficient modulo p as defined in the previous section (p must be prime)
long long lucas(long long n, long long k, long long p) {
    if (k == 0) {
        return 1;
    }
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
            code: `// 矩陣乘法基礎: 現代 C++ 範例，註解標出此段的核心意圖。
Mat operator*(const Mat& a, const Mat& b) {
    Mat c{};
    for (int i = 0; i < kDimension; ++i) {
        for (int k = 0; k < kDimension; ++k) {
            if (a.a[i][k]) {
                for (int j = 0; j < kDimension; ++j) {
                    c.a[i][j] = (c.a[i][j] + a.a[i][k] * b.a[k][j]) % kMod;
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
            summary:
              '多堆石子輪流取，取完者勝。結論：各堆石子數的異或和為 0 時先手必敗，否則先手必勝。',
            code: `// Nim 遊戲: 現代 C++ 範例，註解標出此段的核心意圖。
int x = 0;
for (int s : piles) {
    x ^= s;
}
bool first_win = (x != 0);`
          },
          {
            title: 'SG 函數與 Sprague-Grundy 定理',
            summary:
              '單個遊戲狀態的 SG = 其所有後繼 SG 的 mex（最小未出現非負整數）。多個獨立遊戲的和，其 SG = 各子遊戲 SG 的異或；為 0 即必敗態。',
            code: `// SG 函數與 Sprague-Grundy 定理: 現代 C++ 範例，註解標出此段的核心意圖。
int sg(int x) {
    if (computed[x]) {
        return f[x];
    }
    set<int> s;
    for (int nx : moves(x)) {
        s.insert(sg(nx));
    }
    int m = 0;
    while (s.count(m)) {     // mex
        ++m;
    }
    return f[x] = m;
}`
          }
        ]
      }
    ]
  }
];
