// Teaching material for each training-camp lecture: how to implement the core
// techniques, what to watch out for, and the complexity you should expect.
// Keyed by TrainingCampModule.id from ./trainingCamp.

export interface TrainingCampImplementation {
  title: string;
  idea: string;
  code?: string;
  complexity?: string;
}

export interface TrainingCampNote {
  summary: string;
  implementations: TrainingCampImplementation[];
  pitfalls: string[];
  tips?: string[];
}

export const kTrainingCampNotes: Record<string, TrainingCampNote> = {
  'foundation-cpp-basics': {
    summary:
      '這一講建立競程的 C++ 底盤：資料型別的範圍、輸入輸出的效率、以及陣列與字串的記憶體佈局。這些細節看似基礎，卻是 WA 與 TLE 最常見的來源。',
    implementations: [
      {
        title: '關閉同步、加速 cin/cout',
        idea: '預設的 cin/cout 會與 C 的 stdio 同步，讀入 10^6 級別資料時會明顯變慢。在 main 開頭關閉同步並解除 cin/cout 綁定即可。關閉後不要再混用 scanf/printf。',
        code: 'int main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    int n;\n    cin >> n;\n    return 0;\n}',
        complexity: '輸入 O(n)，常數大幅下降'
      },
      {
        title: '選對整數型別',
        idea: 'int 約到 2.1×10^9，任何可能超過的乘法或前綴和都要用 long long。判斷準則：把最大輸入代入運算式，只要中間值可能超過 2×10^9 就升型。',
        code: 'long long sum = 0;\nfor (int i = 0; i < n; ++i) sum += (long long)a[i] * b[i];'
      }
    ],
    pitfalls: [
      'int 溢位：a * b 兩個 int 相乘即使結果存進 long long 也會先以 int 溢位，必須在乘法前就轉型。',
      'cin >> s 讀字串會在空白處停止；要讀整行請用 getline，且注意前一個 cin >> 殘留的換行符。',
      '區域陣列開太大會爆棧，10^6 以上的陣列請開成全域或 static。'
    ],
    tips: [
      '用 `#define int long long` 來避免忘記轉型，最後 `main()` 回傳改寫 `signed main()`。',
      '陣列開 `MAXN + 5` 避免邊界存取越界（off-by-one）。',
      '字串 `s += c` 在少量次數下尚可；大量拼接請改用 `ostringstream` 或 `string::append`。'
    ]
  },
  'foundation-algorithm-beauty': {
    summary:
      '從「能跑」進到「跑得夠快」。重點是用大 O 估算時間與空間，並理解遞迴如何在系統堆疊上展開、如何從遞迴看出重複子問題。',
    implementations: [
      {
        title: '用資料規模反推可用複雜度',
        idea: '賽場上先看 n 的範圍再選算法：n ≤ 20 可指數；n ≤ 5000 可 O(n^2)；n ≤ 10^5 需 O(n log n)；n ≤ 10^7 幾乎只能 O(n)。以 10^8 次基本運算約 1 秒為基準估算。',
        complexity: '以 10^8 ops/s 估時限'
      },
      {
        title: '遞迴三要素',
        idea: '寫遞迴先確定：終止條件、每層要做的事、如何縮小問題。缺少終止條件會無限遞迴，縮小方向錯誤會堆疊溢位。',
        code: 'long long fib(int n) {\n    if (n <= 1) return n; // 終止條件\n    return fib(n - 1) + fib(n - 2); // 縮小規模\n}',
        complexity: '樸素 O(2^n)，加記憶化後 O(n)'
      }
    ],
    pitfalls: [
      '別忽略空間複雜度：一個 10^4 × 10^4 的 int 陣列就是 400MB，會 MLE。',
      '遞迴深度過大（例如 10^6 層）會爆棧，此時改寫成迭代或手動堆疊。',
      '樸素遞迴常有指數級重複計算，看到重疊子問題就該想記憶化或 DP。'
    ],
    tips: [
      '遇到 n ≤ 20 的題目，立刻想到狀態壓縮 / 枚舉子集（2^n ≈ 10^6）。',
      '遞迴記憶化比寫自底向上 DP 更快上手，遇到熟悉的遞推式再轉迭代。',
      '複雜度估算口訣：10^8 運算約 1 秒；10^6 可接受 O(n^2)，10^5 需 O(n log n)。'
    ]
  },
  'foundation-linear-list': {
    summary:
      '線性表是所有資料結構的起點。掌握順序表（陣列）與鏈表的取捨，並熟練用 STL 的 vector/stack/queue 取代手寫結構。',
    implementations: [
      {
        title: '單鏈表的插入與刪除',
        idea: '鏈表的價值在於 O(1) 改接指標。刪除節點要先找到「前驅」，再讓前驅指向下一個；插入則相反。務必處理頭節點與空表的邊界。',
        code: 'struct Node { int val; Node* next; };\n// 在 p 之後插入 x\nvoid insertAfter(Node* p, int x) {\n    Node* q = new Node{x, p->next};\n    p->next = q;\n}',
        complexity: '插入/刪除 O(1)，查找 O(n)'
      },
      {
        title: '用 STL 容器代替手寫',
        idea: '賽場上大多數情境用 vector、stack、queue 就夠，省下手寫指標的除錯時間。需要兩端操作時用 deque。',
        code: 'stack<int> st;\nst.push(1);\nif (!st.empty()) { int t = st.top(); st.pop(); }'
      }
    ],
    pitfalls: [
      '順序表中間插入/刪除是 O(n) 搬移，頻繁改動請改用鏈表或別的結構。',
      '對空的 stack/queue 呼叫 top()/front()/pop() 是未定義行為，先判 empty()。',
      '手寫鏈表 new 出來的節點若不釋放會漏記憶體；比賽可忽略，工程要 delete。'
    ],
    tips: [
      '賽場上除非題目強制，否則一律用 `std::vector`、`std::stack`、`std::queue`。',
      '鏈表題若無法確保不會造環，先畫出節點連接圖再寫程式碼。',
      '手寫鏈表時，把頭節點（dummy node）統一成哨兵節點，簡化邊界判斷。'
    ]
  },
  'foundation-tree': {
    summary:
      '樹是遞迴結構的典型。這一講聚焦二元樹的存儲與四種遍歷、哈夫曼樹的貪心構造，以及二元搜尋樹的查找/插入/刪除。',
    implementations: [
      {
        title: '前中後序遞迴遍歷',
        idea: '三種深度遍歷只差「處理當前節點」的位置：前序在遞迴左右子樹之前，中序在之間，後序在之後。層序則改用佇列做 BFS。',
        code: 'void inorder(Node* r) {\n    if (!r) return;\n    inorder(r->left);\n    visit(r);          // 中序：夾在左右之間\n    inorder(r->right);\n}',
        complexity: 'O(n)'
      },
      {
        title: 'BST 刪除節點',
        idea: '刪除分三種情況：葉節點直接刪；只有一個子節點就用子節點頂替；有兩個子節點則用右子樹最小值（後繼）替換再刪那個後繼。',
        complexity: '平均 O(log n)，退化 O(n)'
      }
    ],
    pitfalls: [
      'BST 若按有序資料插入會退化成鏈，查找變 O(n)，需要平衡樹來保證。',
      '哈夫曼樹每次要取兩個最小權值，用 priority_queue 小根堆維護，別每次線性掃描。',
      '遞迴遍歷要先判空節點再取 left/right，否則對 nullptr 解參崩潰。'
    ],
    tips: [
      '二元樹遞迴題的記憶訣竅：前序「根左右」、中序「左根右」、後序「左右根」。',
      '重建二元樹題型：前序提供根，中序提供左右分隔；無法中序則無法唯一確定。',
      'BST 的性質意味著「中序遍歷 = 有序」，檢查 BST 合法性可直接驗證中序單調。'
    ]
  },
  'foundation-graph': {
    summary:
      '圖的兩件大事：怎麼存、怎麼走。掌握鄰接矩陣、鄰接表、鏈式前向星的取捨，並用 BFS/DFS 走遍每個連通塊。',
    implementations: [
      {
        title: '鄰接表存圖',
        idea: '稀疏圖（邊數遠小於點數平方）一律用鄰接表，空間 O(n+m)。vector<int> g[N] 最直觀；追求極致常數才用鏈式前向星。',
        code: 'vector<int> g[N];\ng[u].push_back(v);\ng[v].push_back(u); // 無向圖雙向加邊',
        complexity: '空間 O(n+m)'
      },
      {
        title: 'BFS 求最短步數',
        idea: '無權圖最短路用 BFS：起點入隊並標記，逐層擴展，第一次訪問到的層數就是最短步數。用 visited 避免重複入隊。',
        code: 'queue<int> q; q.push(s); dist[s] = 0;\nwhile (!q.empty()) {\n    int u = q.front(); q.pop();\n    for (int v : g[u]) if (dist[v] == -1) {\n        dist[v] = dist[u] + 1;\n        q.push(v);\n    }\n}',
        complexity: 'O(n+m)'
      }
    ],
    pitfalls: [
      '無向圖每條邊要加兩次；忘記反向邊是最常見的 bug。',
      '鄰接矩陣是 O(n^2) 空間，n 超過幾千就 MLE，換鄰接表。',
      'DFS 遞迴在 10^5 級深度可能爆棧，必要時改成顯式堆疊或 BFS。'
    ],
    tips: [
      '儲存圖優先用 `vector<vector<int>>`（鄰接表），邊數 > 10^5 別用鄰接矩陣。',
      'BFS 求最短路只適用「權重相同」；有權重立刻轉 Dijkstra 或 SPFA。',
      'DFS 回溯別忘記 `visited` 的撤銷，尤其路徑計數類題目。'
    ]
  },
  'foundation-algorithm-intro': {
    summary:
      '貪心與分治是兩種基本設計範式。貪心靠「局部最優導出全域最優」的證明，分治靠「拆解—遞迴—合併」的框架，合併排序與快排是必背模板。',
    implementations: [
      {
        title: '貪心：先排序再掃描',
        idea: '多數貪心的骨架是「按某個關鍵字排序，再一次掃描做選擇」。難點在證明排序關鍵字正確——通常用交換論證：證明交換任意逆序對不會變差。',
        code: 'sort(a, a + n, [](auto& x, auto& y){ return x.end < y.end; });\nint cnt = 0, last = -INF;\nfor (auto& it : a) if (it.start >= last) { ++cnt; last = it.end; }',
        complexity: 'O(n log n)'
      },
      {
        title: '快速排序的分治',
        idea: '選 pivot，把小於的丟左、大於的丟右，遞迴兩側。隨機化 pivot 可避免有序輸入退化成 O(n^2)。',
        complexity: '平均 O(n log n)，最壞 O(n^2)'
      }
    ],
    pitfalls: [
      '貪心沒證明就用很危險，很多「看起來對」的貪心其實是錯的，先想反例或 DP。',
      '快排在已排序資料上不隨機化會退化；合併排序穩定但需 O(n) 額外空間。',
      '合併排序可順帶求逆序對數量，別漏了這個常考應用。'
    ],
    tips: [
      '貪心題的判斷訊號：「排序後掃描即可」或「每次取極值」。',
      '分治題常用「中點分割」，線段樹、合併排序、CDQ 都基於此框架。',
      '快速排序的 `partition` 可用於求解第 k 大元素（QuickSelect），不用全排序。'
    ]
  },
  'foundation-big-integer': {
    summary:
      '當數字超出 long long，就用陣列模擬豎式運算。核心是把數字逆序存進陣列（個位在前），再逐位處理進位/借位。',
    implementations: [
      {
        title: '高精度加法',
        idea: '低位對齊，逐位相加並處理進位。逆序存儲讓「個位在下標 0」，進位自然向高位傳播。',
        code: 'vector<int> add(vector<int>& A, vector<int>& B) {\n    vector<int> C; int carry = 0;\n    for (int i = 0; i < A.size() || i < B.size() || carry; ++i) {\n        if (i < A.size()) carry += A[i];\n        if (i < B.size()) carry += B[i];\n        C.push_back(carry % 10);\n        carry /= 10;\n    }\n    return C;\n}',
        complexity: 'O(len)'
      },
      {
        title: '減法與比較',
        idea: '減法要先比較大小，保證大減小，結果為負再補負號。借位時當前位 +10 並從下一位扣 1，最後去掉前導零。',
        complexity: 'O(len)'
      }
    ],
    pitfalls: [
      '結果別忘了去除前導零（但要保留單個 0）。',
      '減法沒判大小就相減會出錯，先比長度再逐位比較。',
      '除法是最難的，通常轉成「高精度除以低精度」按位相除，注意餘數傳遞。'
    ],
    tips: [
      '高精度題若只到 10^500，用 Python 的內建大數即可；C++ 需手寫陣列模擬。',
      '進制不一定要 10，選 10^4 或 10^9 可大幅減少位數，壓高精度常數。',
      '高精度除法通常只考「大除小」（大整數除以 int），通分即可。'
    ]
  },
  'foundation-search': {
    summary:
      '搜尋三板斧：二分（在單調性上找邊界或答案）、DFS 回溯（枚舉解空間並剪枝）、BFS（求最少步數）。三者是後續高階搜尋的基礎。',
    implementations: [
      {
        title: '二分答案',
        idea: '當「答案越大越容易/越難滿足」具單調性時，二分答案值再用 check 驗證，把最優化問題轉成判定問題。',
        code: 'int lo = 0, hi = MAX;\nwhile (lo < hi) {\n    int mid = lo + (hi - lo) / 2;\n    if (check(mid)) hi = mid; else lo = mid + 1;\n}\n// lo 即最小可行答案',
        complexity: 'O(log(range) × check)'
      },
      {
        title: 'DFS 回溯模板',
        idea: '在每一層做選擇、遞迴、撤銷選擇（回溯）。撤銷是關鍵，否則狀態會污染其他分支。',
        code: 'void dfs(int step) {\n    if (step == n) { record(); return; }\n    for (int c : choices) {\n        make(c);\n        dfs(step + 1);\n        undo(c);   // 回溯\n    }\n}'
      }
    ],
    pitfalls: [
      '二分邊界寫錯會死循環：mid 取法與 lo/hi 更新要配套，避免 mid == lo 不前進。',
      '回溯忘記「撤銷選擇」是最經典的 bug，狀態會殘留到兄弟分支。',
      'BFS 求最短步數要在「入隊時」標記已訪問，而不是出隊時，否則會重複入隊爆記憶體。'
    ],
    tips: [
      '二分答案的 check() 函式盡量「複製貼上後改幾行」，節省實作時間。',
      '回溯題在枚舉前先「排序＋去重」，可以有效減少搜索空間。',
      'BFS 的 visited 標記要「入隊時」就打，否則同一節點可能入隊多次。'
    ]
  },
  'foundation-dp': {
    summary:
      'DP 的本質是「有重疊子問題 + 最優子結構」。設計順序是：定義狀態 → 寫轉移方程 → 確定邊界與遍歷順序。背包、線性 DP、區間 DP 是三大入門模型。',
    implementations: [
      {
        title: '01 背包（滾動一維）',
        idea: 'f[j] 表示容量 j 的最大價值。因為每件物品只能取一次，容量要「從大到小」遍歷，才不會重複取同一件。',
        code: 'for (int i = 0; i < n; ++i)\n    for (int j = W; j >= w[i]; --j)\n        f[j] = max(f[j], f[j - w[i]] + v[i]);',
        complexity: 'O(nW)'
      },
      {
        title: '區間 DP',
        idea: 'f[i][j] 表示區間 [i,j] 的最優解，按區間長度從小到大枚舉，內層枚舉分割點 k。',
        code: 'for (int len = 2; len <= n; ++len)\n    for (int i = 1, j = len; j <= n; ++i, ++j)\n        for (int k = i; k < j; ++k)\n            f[i][j] = min(f[i][j], f[i][k] + f[k+1][j] + cost(i,j));',
        complexity: 'O(n^3)'
      }
    ],
    pitfalls: [
      '01 背包一維寫法必須逆序枚舉容量；完全背包才是正序，兩者只差這一點。',
      '狀態定義要「無後效性」——當前狀態只依賴已算好的子狀態。',
      '別忘了初始化邊界，尤其是 f[0] 與「無法到達」狀態設成 ±INF。'
    ],
    tips: [
      '01 背包與完全背包只差「遍歷方向」：01 逆序、完全正序，先寫對再優化。',
      '區間 DP 按「長度從小到大」枚舉，確保計算 [i,j] 時所有子區間已就緒。',
      'dp 陣列的初始化通常是解題的一半：邊界條件錯，轉移再對也沒用。'
    ]
  },
  'strengthening-stl': {
    summary:
      '進階 STL：deque、priority_queue、bitset、set/map 系列，以及一批高頻算法函數。用對容器能省下大量手寫結構的時間。',
    implementations: [
      {
        title: 'priority_queue 定製比較',
        idea: '預設是大根堆。要小根堆可用 greater，或存負值。自訂結構體則傳比較器，注意「比較器語意與 sort 相反」——回傳 true 表示優先級更低。',
        code: 'priority_queue<int, vector<int>, greater<int>> minHeap;\nminHeap.push(3); minHeap.push(1);\nint mn = minHeap.top(); // 1'
      },
      {
        title: 'set 有序性與二分',
        idea: 'set 內部有序，lower_bound/upper_bound 是成員函數（O(log n)），別用 std::lower_bound（對 set 會退化成 O(n)）。',
        code: 'set<int> s = {1, 4, 9};\nauto it = s.lower_bound(5); // 指向 9'
      }
    ],
    pitfalls: [
      '對 set/map 用全域 std::lower_bound 會是 O(n)；一定要用成員函數版本。',
      'priority_queue 比較器的方向與直覺相反，寫小根堆時特別容易搞錯。',
      'bitset 大小是編譯期常數，不能用執行期變數當模板參數。'
    ],
    tips: [
      '`set::lower_bound` 與 `std::lower_bound` 區別很大：前者 O(log n)，後者對 set 是 O(n)。',
      '`priority_queue` 的預設比較器與 `sort` 相反，寫小根堆用 `greater<>` 或存負值。',
      '`bitset` 支援位元運算（&、|、^、<<、>>），可直接做集合運算，常數極小。'
    ]
  },
  'strengthening-practical-data-structures': {
    summary:
      '實戰資料結構主力：並查集、ST 表（RMQ）、LCA、樹狀陣列、線段樹。它們共同支撐了大量區間與集合合併問題。',
    implementations: [
      {
        title: '並查集（路徑壓縮 + 按秩合併）',
        idea: 'find 時把路徑上所有點直接掛到根下（路徑壓縮），合併時把小樹掛大樹下，均攤幾乎 O(1)。',
        code: 'int find(int x) { return fa[x] == x ? x : fa[x] = find(fa[x]); }\nvoid uni(int a, int b) { fa[find(a)] = find(b); }',
        complexity: '均攤 O(α(n))'
      },
      {
        title: '樹狀陣列（單點改、前綴查）',
        idea: '用 lowbit(x)=x&-x 跳躍維護前綴和，單點修改與前綴查詢都是 O(log n)，常數比線段樹小很多。',
        code: 'void add(int i, int v) { for (; i <= n; i += i & -i) c[i] += v; }\nint sum(int i) { int s = 0; for (; i; i -= i & -i) s += c[i]; return s; }',
        complexity: 'O(log n) 每次操作'
      },
      {
        title: '線段樹懶標記',
        idea: '區間修改時不立刻下推，而是打上懶標記，等到需要訪問子區間時再 pushdown。這是區間改+區間查的關鍵。',
        complexity: 'O(log n) 每次操作'
      }
    ],
    pitfalls: [
      '並查集一定要路徑壓縮，否則退化成鏈；比較大小/連通性時記得比較的是「根」。',
      '樹狀陣列下標從 1 開始，下標 0 會導致 lowbit 死循環。',
      '線段樹忘記 pushdown 或 pushup 是最常見錯誤；懶標記下推後要清空。'
    ],
    tips: [
      '並查集的「路徑壓縮」和「按秩合併」是獨立的優化，只用其一效果也夠。',
      'ST 表只能處理「不重疊查詢」，區間求和不可用（要用前綴和或線段樹）。',
      '樹狀陣列常數遠小於線段樹，能用 BIT 就不用線段樹，除非需要區間修改區間查詢。'
    ]
  },
  'strengthening-searching': {
    summary:
      '查找進階：散列表的衝突處理、字串匹配的 KMP、以及字典樹 Trie。核心都是用預處理換取查詢時的線性效率。',
    implementations: [
      {
        title: 'KMP 的 next 陣列',
        idea: 'next[i] 表示模式串前 i 個字元的最長公共前後綴長度。匹配失配時用它跳轉，避免主串指標回退，達成 O(n+m)。',
        code: 'vector<int> nxt(m);\nfor (int i = 1, j = 0; i < m; ++i) {\n    while (j && p[i] != p[j]) j = nxt[j - 1];\n    if (p[i] == p[j]) ++j;\n    nxt[i] = j;\n}',
        complexity: 'O(n+m)'
      },
      {
        title: 'Trie 插入與查詢',
        idea: '每個節點有若干子指標（如 26 個字母）。插入沿字元下沉、缺節點就建；查詢沿字元走，走不通即不存在。',
        code: 'int ch[N][26], cnt = 0;\nvoid insert(const string& s) {\n    int u = 0;\n    for (char c : s) {\n        int x = c - 97;\n        if (!ch[u][x]) ch[u][x] = ++cnt;\n        u = ch[u][x];\n    }\n}',
        complexity: 'O(字串長度)'
      }
    ],
    pitfalls: [
      'KMP 的 next 定義有「前綴函數」與「失配跳轉」兩種寫法，混用會錯位，選定一種。',
      '散列表要選好質數模與衝突策略，惡意資料會把開放定址逼到 O(n)。',
      'Trie 開陣列要估好節點總數（總字元數 + 1），開小會越界。'
    ],
    tips: [
      'KMP 的 next 陣列也可以用於「最小循環節」問題，`n - next[n-1]` 即循環長度。',
      '開放定址的散列表探測用「二次探測」比線性探測更能分散聚集，但實現稍複雜。',
      'Trie 的空間估算：每個字元一個節點，總節點 = 所有字串長度總和 + 1。'
    ]
  },
  'strengthening-balanced-trees': {
    summary:
      '平衡樹保證樹高 O(log n)：AVL 靠嚴格平衡因子與旋轉，Treap 用隨機優先級期望平衡，Splay 靠訪問後伸展兼顧局部性與區間操作。',
    implementations: [
      {
        title: '旋轉是所有平衡樹的原子操作',
        idea: '左旋/右旋在不破壞 BST 性質的前提下調整樹高。所有平衡樹（AVL、Treap、Splay）都靠旋轉來維持或恢復平衡。',
        code: '// 右旋：x 的左子 y 上提\nNode* rotateRight(Node* x) {\n    Node* y = x->l; x->l = y->r; y->r = x;\n    return y;\n}'
      },
      {
        title: 'Treap = BST + 堆',
        idea: '每個節點多存一個隨機優先級，讓它同時滿足 BST（按鍵）與堆（按優先級）。插入後靠旋轉把優先級調回堆序，期望樹高 O(log n)。',
        complexity: '期望 O(log n)'
      }
    ],
    pitfalls: [
      '旋轉後忘記更新子樹大小/高度等維護資訊，會讓後續操作全錯。',
      'AVL 刪除可能需要沿路徑多次旋轉，只轉一次不夠。',
      'Splay 每次訪問後都要 splay 到根，否則失去均攤複雜度保證。'
    ],
    tips: [
      'Treap 的隨機優先級可用 `rand()` 或 `chrono` 種子，比賽中 `srand(time(0))` 即可。',
      '旋轉操作只要記住「左旋提右子、右旋提左子」，判斷誰當新根就好。',
      '普通平衡樹題目，若無區間反轉等特殊操作，直接用 `std::set` 或 `__gnu_pbds` 省下大量除錯時間。'
    ]
  },
  'strengthening-graph-advanced': {
    summary:
      '圖的連通性進階：用 Tarjan 的 DFS 時間戳與 low 值，一次遍歷求出橋、割點與強連通分量，再用縮點把問題簡化。',
    implementations: [
      {
        title: 'Tarjan 求強連通分量',
        idea: '維護 dfn（訪問時間）與 low（能回溯到的最早祖先）。用堆疊存當前路徑，當 dfn[u]==low[u] 時彈出堆疊得到一個 SCC。',
        code: 'void tarjan(int u) {\n    dfn[u] = low[u] = ++idx;\n    stk.push(u); inStk[u] = true;\n    for (int v : g[u]) {\n        if (!dfn[v]) { tarjan(v); low[u] = min(low[u], low[v]); }\n        else if (inStk[v]) low[u] = min(low[u], dfn[v]);\n    }\n    if (dfn[u] == low[u]) { /* 彈棧成一個 SCC */ }\n}',
        complexity: 'O(n+m)'
      }
    ],
    pitfalls: [
      '求割點時根節點要特判：根是割點當且僅當它有 ≥2 個 DFS 子樹。',
      '橋的判定用 low[v] > dfn[u]，割點用 low[v] >= dfn[u]，差一個等號。',
      '無向圖 Tarjan 要避免走回父邊（但重邊要允許），處理不當會誤判。'
    ],
    tips: [
      'Tarjan 求 SCC 時，low 只更新「目前在 stack 中」的節點，否則會用到 cross edge 的錯誤值。',
      '無向圖求橋時，不要把父邊當成 back edge；有多重邊時要記錄邊編號。',
      '縮點後的 DAG 上經常需要做拓撲 DP，提前建好入度陣列。'
    ]
  },
  'strengthening-graph-algorithms': {
    summary:
      '圖論主力算法：最小生成樹（Prim/Kruskal）、最短路（Dijkstra/Floyd/Bellman-Ford/SPFA）、拓撲排序與關鍵路徑。選對算法取決於邊權正負與圖的稠密度。',
    implementations: [
      {
        title: '堆優化 Dijkstra',
        idea: '每次取當前最短的未定點擴展。用小根堆維護候選距離，適用「非負權」圖。取出時若距離過期就跳過。',
        code: 'priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;\npq.push({0, s}); dist[s] = 0;\nwhile (!pq.empty()) {\n    auto [d, u] = pq.top(); pq.pop();\n    if (d > dist[u]) continue;\n    for (auto [v, w] : g[u]) if (dist[u] + w < dist[v]) {\n        dist[v] = dist[u] + w; pq.push({dist[v], v});\n    }\n}',
        complexity: 'O(m log n)'
      },
      {
        title: 'Kruskal 求 MST',
        idea: '所有邊按權排序，用並查集依次加入不成環的邊，直到選滿 n-1 條。',
        complexity: 'O(m log m)'
      }
    ],
    pitfalls: [
      'Dijkstra 不能處理負權邊；有負權要用 Bellman-Ford 或 SPFA。',
      'Floyd 的三重迴圈中，最外層一定是中轉點 k，順序寫錯結果就錯。',
      'SPFA 在特殊構造圖上會退化成 O(nm)，稠密圖或卡常題慎用。'
    ],
    tips: [
      'Dijkstra 無法處理負邊，若題目有負邊且無負環，用 SPFA 或 Bellman-Ford。',
      'Floyd 適合「全源最短路」或「中轉點限制」的題目，單源且 n 大時太慢。',
      '判負環：跑完 Bellman-Ford 後再多鬆弛一次，若還能更新則有負環。'
    ]
  },
  'strengthening-search-advanced': {
    summary:
      '搜尋優化：可行性/最優性剪枝、雙向 BFS 壓縮搜尋空間、A*/IDA* 用估價函數引導方向。核心是砍掉不可能的分支。',
    implementations: [
      {
        title: '剪枝的四個方向',
        idea: '常用剪枝：可行性剪枝（此路必不可行就返回）、最優性剪枝（已劣於當前最優就返回）、搜索順序剪枝（先搜分支少的）、記憶化剪枝。',
        complexity: '大幅降低指數常數'
      },
      {
        title: 'IDA* 迭代加深',
        idea: '以「當前深度 + 估價 h」為界，逐步放大深度上限做 DFS。h 必須是「不高估」的可採納啟發，否則得不到最優解。',
        code: 'bool dfs(int g, int limit) {\n    int h = heuristic();\n    if (g + h > limit) return false; // 超界剪枝\n    if (isGoal()) return true;\n    // 枚舉下一步...\n}'
      }
    ],
    pitfalls: [
      'A*/IDA* 的估價函數必須可採納（不高估真實代價），否則會得到次優解。',
      '雙向 BFS 兩側要交替擴展「較小的一側」，否則優勢喪失。',
      '剪枝順序影響巨大：優先擴展約束最強的分支往往快幾個數量級。'
    ],
    tips: [
      'IDA* 的估價函數越強剪枝越多，但計算估價本身也耗時，需權衡。',
      '雙向 BFS 優勢在「分支因子大、深度深」的搜索樹；淺而廣的樹優勢不明顯。',
      '剪枝優先從「可行性」下手，再疊加「最優性」與「對稱性」。'
    ]
  },
  'strengthening-dp': {
    summary:
      'DP 進階三型：樹形 DP（在樹上自底向上合併子樹）、狀態壓縮 DP（用位元表示集合），以及倍增/資料結構/單調隊列優化轉移。',
    implementations: [
      {
        title: '樹形 DP',
        idea: 'f[u][0/1] 常表示「u 選/不選」的子樹最優解，DFS 回溯時用子節點的值更新父節點。轉移在遞迴返回時進行。',
        code: 'void dfs(int u, int fa) {\n    f[u][1] = a[u];\n    for (int v : g[u]) if (v != fa) {\n        dfs(v, u);\n        f[u][0] += max(f[v][0], f[v][1]);\n        f[u][1] += f[v][0];\n    }\n}',
        complexity: 'O(n)'
      },
      {
        title: '單調隊列優化',
        idea: '當轉移是「在滑動視窗內取最值」時，用單調隊列維護候選，把 O(nk) 降到 O(n)。隊頭是視窗最優，過期就彈出。',
        complexity: 'O(n)'
      }
    ],
    pitfalls: [
      '狀壓 DP 枚舉子集要用 for (int s = m; s; s = (s-1) & m) 才是 O(3^n) 而非 O(4^n)。',
      '樹形 DP 的合併順序（尤其樹上背包）決定複雜度，別把 O(n^2) 寫成 O(n^3)。',
      '單調隊列要同時判「隊頭過期」與「隊尾不優」，兩個彈出條件缺一不可。'
    ],
    tips: [
      '樹形 DP 常見模式：「選或不選」（最大獨立集）、「根在子樹中的狀態」（換根 DP）。',
      '狀態壓縮 DP 枚舉子集：`for (int s = m; s; s = (s-1)&m)` 才是正確枚舉順序。',
      '單調隊列優化前，先把轉移式整理成「候選值 = 直線截距」的形式，再觀察橫坐標單調性。'
    ]
  },
  'advanced-data-structures': {
    summary:
      '進階資料結構：分塊用「大段維護 + 小段暴力」在 O(√n) 平衡各種操作；跳躍表用多層索引達成期望 O(log n) 的有序集合。',
    implementations: [
      {
        title: '分塊的通用套路',
        idea: '把序列分成約 √n 個塊，整塊打標記、散塊暴力。區間操作拆成「兩端散塊 + 中間整塊」，單次 O(√n)。',
        code: 'int blk = sqrt(n);\nint bl(int i) { return i / blk; }\n// 區間 [l,r]：bl(l)==bl(r) 則暴力，否則兩端暴力 + 中間整塊打標記',
        complexity: 'O(√n) 每次操作'
      }
    ],
    pitfalls: [
      '塊大小取 √n 附近最優，但有時要按「查詢/修改比例」微調才能過卡常。',
      '散塊暴力前要先把該塊的懶標記下推，否則讀到過期值。',
      '跳躍表每層晉升是隨機的，最壞情況仍可能退化，別在需要嚴格保證處使用。'
    ],
    tips: [
      '分塊的精髓是「塊大小根號平衡」；實際測試時可在 √n 附近微調找最優常數。',
      '分塊題若修改次數遠多於查詢次數，考慮塊內直接重構而非維護標記。',
      '跳躍表（Skip List）在實戰中很少手寫，但理解它的「多層索引」思想有助於看資料庫索引。'
    ]
  },
  'advanced-string-algorithms': {
    summary:
      '字串進階：AC 自動機是「Trie + KMP 失配指標」做多模式匹配；後綴陣列把所有後綴排序，配合 height 陣列解決大量子串問題。',
    implementations: [
      {
        title: 'AC 自動機的 fail 指標',
        idea: '在 Trie 上 BFS 建立 fail 指標：fail[u] 指向「u 對應字串的最長真後綴」所在節點。匹配時沿 trie 走，失配沿 fail 跳。',
        complexity: 'O(總長度 + 匹配長度)'
      },
      {
        title: '後綴陣列 + height',
        idea: 'sa[i] 是排名第 i 的後綴起點，height[i] 是排名相鄰兩後綴的最長公共前綴。用倍增+基數排序建 sa 為 O(n log n)。',
        complexity: '建構 O(n log n)'
      }
    ],
    pitfalls: [
      'AC 自動機統計出現次數要沿 fail 樹累加，漏了會少算被包含的模式。',
      '後綴陣列的 height 用 h[i] >= h[i-1]-1 的性質線性求，別每次重算 LCP。',
      '多組資料時 AC 自動機的節點陣列與 fail 要清乾淨，殘留會污染下一組。',
      '後綴自動機（SAM）與後綴數組功能重疊，SAM 更適合在線場合，後綴數組更適合離線查詢。'
    ],
    tips: [
      'AC 自動機統計出現次數時，記得沿 fail 樹累加，否則只統計了完整匹配。',
      '後綴數組 + height 陣列 = 幾乎所有子串問題的答案，熟練後可替代 SAM。',
      '字典樹 + fail = AC 自動機；後綴數組 + LCP = 重複子串分析，都是「組合兩個基本結構」的典範。'
    ]
  },
  'advanced-tree-operations': {
    summary:
      '樹上操作：樹鏈剖分把樹拆成重鏈並映射到線段樹，支援路徑/子樹的區間操作；點分治/邊分治則按重心遞迴處理「經過某點/邊」的路徑統計。',
    implementations: [
      {
        title: '重鏈剖分',
        idea: '兩次 DFS：第一次求子樹大小與重兒子，第二次按重鏈給每個點連續的 dfs 序，於是「路徑」與「子樹」都變成線段樹上的區間。',
        complexity: '路徑操作 O(log^2 n)'
      },
      {
        title: '點分治用重心遞迴',
        idea: '每層找當前子樹的重心作為分治中心，統計所有「經過重心」的路徑，再刪除重心遞迴各子樹。以重心保證 O(log n) 層。',
        complexity: 'O(n log n) 級'
      }
    ],
    pitfalls: [
      '樹剖求 LCA 時要「跳鏈頂較深的一方」，跳錯方向會死循環。',
      '點分治必須每層重新找重心，固定根會退化成 O(n^2)。',
      '點分治統計路徑要「容斥」減去同一子樹內的重複貢獻。'
    ],
    tips: [
      '樹剖的 dfs 序讓「子樹查詢」變成區間查詢，與「路徑查詢」共用同一套線段樹。',
      '點分治統計跨重心路徑時，先統計整棵子樹，再把每個子樹的貢獻「減去」避免重複。',
      '邊分治出題頻率低，但理解「中心邊」概念有助於看樹上直徑/重心相關證明。'
    ]
  },
  'advanced-complex-trees': {
    summary:
      '複雜樹形結構：KD 樹做多維最近鄰、左偏樹做可並堆、LCT（動態樹）維護動態森林的路徑、樹套樹解決帶修改的二維查詢。',
    implementations: [
      {
        title: 'LCT 的核心 access',
        idea: 'LCT 用一堆 Splay 維護實鏈。access(x) 把根到 x 的路徑變成一條實鏈，是 link/cut/查詢的基礎操作。',
        complexity: '均攤 O(log n)'
      },
      {
        title: '左偏樹合併',
        idea: '可並堆的合併遞迴進行：小根頂當根，遞迴合併右子堆，再依「左子距離 ≥ 右子」維護左偏性質，必要時交換左右。',
        complexity: '合併 O(log n)'
      }
    ],
    pitfalls: [
      'LCT 操作前後的 pushup/pushdown 極易漏，翻轉標記尤其容易出錯。',
      'KD 樹最近鄰查詢要靠估價剪枝，否則退化成 O(n)。',
      '樹套樹空間常數巨大，注意 MLE，能用整體二分/CDQ 就別硬套。'
    ],
    tips: [
      'LCT 的實作難度極高，賽場上除非無法避免，否則優先考慮 DFS 序 + 線段樹。',
      '左偏樹是「可並堆」的實現，合併兩個堆只需 O(log n)，遠快於把一個堆的元素逐一插入另一個。',
      '樹套樹的題目若 n ≤ 5×10^4，可嘗試 CDQ 分治或整體二分來降低程式碼量。'
    ]
  },
  'advanced-persistent-data-structures': {
    summary:
      '可持久化：保留每次修改後的歷史版本。可持久化線段樹（主席樹）每次只新建修改路徑上的 O(log n) 個節點，共享其餘部分。',
    implementations: [
      {
        title: '主席樹求區間第 k 小',
        idea: '對每個前綴建一棵權值線段樹（可持久化共享節點）。查詢 [l,r] 時用 root[r] 與 root[l-1] 相減，在樹上二分定位第 k 小。',
        code: '// 新版本只複製修改路徑\nint update(int pre, int l, int r, int pos) {\n    int cur = ++tot; tr[cur] = tr[pre]; tr[cur].cnt++;\n    if (l == r) return cur;\n    int mid = (l + r) >> 1;\n    if (pos <= mid) tr[cur].ls = update(tr[pre].ls, l, mid, pos);\n    else tr[cur].rs = update(tr[pre].rs, mid+1, r, pos);\n    return cur;\n}',
        complexity: '每次修改/查詢 O(log n)'
      }
    ],
    pitfalls: [
      '節點池要開足 n log n 級，開小會 RE；不能重複使用同一節點下標。',
      '新版本必須「複製後再改」，直接改舊節點會破壞歷史版本。',
      '權值線段樹要先離散化，值域太大直接開會 MLE。'
    ],
    tips: [
      '主席樹的節點數約為「版本數 × log(值域)」，開靜態陣列時預留 n×20 較安全。',
      '每次修改都會產生新版本，但查詢只用「兩個版本的 root」做差分，不需遍歷所有版本。',
      '可持久化 Trie 可解決「區間最大異或對」問題，與主席樹思路類似。'
    ]
  },
  'advanced-graph-algorithms': {
    summary:
      '網路流與匹配：最大流（EK/Dinic/ISAP）、二分圖匹配（匈牙利）、最大流最小割定理、最小費用最大流。建模能力比模板更關鍵。',
    implementations: [
      {
        title: 'Dinic 分層 + 多路增廣',
        idea: '先 BFS 分層建層次圖，再 DFS 沿層次遞增的邊多路增廣，反覆直到無增廣路。當前弧優化避免重複掃已滿的邊。',
        complexity: '一般圖 O(V^2 E)，二分圖 O(E√V)'
      },
      {
        title: '匈牙利算法',
        idea: '對左部每個點嘗試找增廣路：若對面未匹配或其匹配對象能讓出，就完成匹配。每輪 DFS/BFS 找一條增廣路。',
        complexity: 'O(VE)'
      }
    ],
    pitfalls: [
      '殘量網路要成對存邊（i 與 i^1），初始邊編號從偶數開始才能用異或取反邊。',
      '費用流找增廣路要用最短路（SPFA/Dijkstra 帶勢），不是隨便找一條。',
      '網路流題的難點在建模：拆點、超級源匯、上下界，模板只是最後一步。'
    ],
    tips: [
      '網路流題的難點在建模而非模板，拿到題先問「什麼是流量？什麼是容量？」。',
      '二分圖匹配可用 Dinic 模板跑，速度常數比匈牙利快很多。',
      '最大流 = 最小割，遇到「選 A 或 B 的最小代價」類題目，優先考慮最小割建模。'
    ]
  },
  'advanced-dp': {
    summary: 'DP 進階模型：多重/分組/混合背包的變形與優化，以及背包類樹形 DP 與不定根（換根）樹形 DP。',
    implementations: [
      {
        title: '多重背包的二進位拆分',
        idea: '把「某物品有 k 件」拆成 1,2,4,…,剩餘 的若干「捆」，每捆當一件做 01 背包，把 O(nWk) 降到 O(nW log k)。',
        code: 'for (int k = 1; cnt > 0; k <<= 1) {\n    int use = min(k, cnt); cnt -= use;\n    // 以 (use*w, use*v) 做一次 01 背包\n}',
        complexity: 'O(nW log k)'
      },
      {
        title: '換根 DP',
        idea: '先一次 DFS 求以某根為根的答案，再一次 DFS「把根從父換到子」時 O(1) 調整，得到每個點為根的答案。',
        complexity: 'O(n)'
      }
    ],
    pitfalls: [
      '多重背包不拆分直接三重迴圈會 TLE；件數大時二進位或單調隊列優化。',
      '分組背包要「組」在最外層、容量在中層、組內物品在最內層，順序錯會重複選。',
      '換根 DP 換根時的貢獻加減要與原轉移嚴格對應，容易漏項。'
    ],
    tips: [
      '多重背包用「二進制拆分」把件數拆成 1,2,4,…,剩…,剩餘，轉成 01 背包；件數小時直接枚舉。',
      '換根 DP 的第一輪 DFS 求「以 1 為根」的答案，第二輪利用公式 O(1) 轉移到子節點。',
      '分組背包記住「組在最外層、容量在中層、組內物品在最內層」，順序錯會導致同一組選多個。'
    ]
  },
  'advanced-complex-dp': {
    summary:
      '最難的 DP 分支：數位 DP（按位枚舉 + 上界限制）、插頭 DP（輪廓線狀壓）、斜率優化與四邊形不等式優化，把 O(n^2) 轉移降到 O(n)/O(n log n)。',
    implementations: [
      {
        title: '數位 DP 記憶化框架',
        idea: '按高位到低位 DFS，帶「是否貼上界 limit」與「是否有前導零」兩個標記。非 limit 且非前導零的狀態可記憶化重複使用。',
        code: 'int dfs(int pos, int state, bool limit, bool lead) {\n    if (pos < 0) return /* 統計 */;\n    if (!limit && !lead && f[pos][state] != -1) return f[pos][state];\n    int up = limit ? digit[pos] : 9, res = 0;\n    for (int d = 0; d <= up; ++d)\n        res += dfs(pos - 1, next(state, d), limit && d == up, lead && d == 0);\n    if (!limit && !lead) f[pos][state] = res;\n    return res;\n}'
      },
      {
        title: '斜率優化',
        idea: '把轉移式整理成 y = kx + b 的直線形式，用單調隊列維護下凸/上凸殼，查詢時彈掉斜率不優的隊頭，均攤 O(1)。',
        complexity: 'O(n)'
      }
    ],
    pitfalls: [
      '數位 DP 記憶化只能存「非 limit、非前導零」的狀態，否則會用到錯誤的上界結果。',
      '斜率優化要確認橫坐標與斜率的單調性，不單調時要改用二分或李超線段樹。',
      '四邊形不等式優化前必須先驗證決策單調性，盲套會得到錯誤答案。'
    ],
    tips: [
      '數位 DP 的記憶化只能缓存「非 limit 且非 lead」的狀態，這兩個 flag 為 true 時不可缓存。',
      '斜率優化適用條件：轉移式能整理成 y = kx + b，且橫坐標與詢問斜率均單調。',
      '四邊形不等式優化前務必先驗證決策單調性：若 op(l,r) ≤ op(l+1,r) 不單調，不可套用。'
    ]
  }
};

export function getTrainingCampNote(moduleId: string): TrainingCampNote | undefined {
  return kTrainingCampNotes[moduleId];
}
