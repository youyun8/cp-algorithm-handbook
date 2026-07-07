import type { TrainingCampModule } from './trainingCamp';

// 入門營：從 C++ 語法到動態規劃入門。每個子標題都附上概念說明、C++ 實作與複雜度，
// 以「教授授課」的口吻，由淺入深地建立競程底盤。

export const foundationModules: TrainingCampModule[] = [
  {
    id: 'foundation-cpp-basics',
    sourceChapter: 1,
    title: 'C++ 基礎知識',
    leetcodeProblemIds: [
      'tp-lc-167',
      'math-lc-204',
      'tp-001',
      'math-lc-1922',
      'lc-1480',
      'lc-1929',
      'lc-1672',
      'lc-1108',
      'lc-2011',
      'lc-26'
    ],
    topics: [
      {
        title: '開啟算法之旅',
        summary:
          '競程的一份程式碼就是「讀入資料 → 計算 → 輸出答案」。評測系統以標準輸入（stdin）餵資料、比對標準輸出（stdout）。先熟悉這個流程，比背任何演算法都重要。'
      },
      {
        title: '常用的數據類型',
        summary:
          '選型別的唯一準則是「值域」。int 約 ±2.1×10^9，long long 約 ±9.2×10^18，double 有效位數約 15 位。凡是計數、前綴和、乘積可能超過 2×10^9，一律用 long long。',
        code: `int a = 1;                 // range approx ±2.1e9
long long b = 1;           // range approx ±9.2e18
double c = 1.5;            // floating-point, ~15 significant digits
char ch = 'A';             // 1 byte
bool flag = true;          // 0 / 1`,
        complexity: 'int 4 bytes、long long 8 bytes'
      },
      {
        title: '玩轉輸入和輸出',
        summary:
          'cin/cout 好寫但預設與 C 的 stdio 同步而較慢。在 main 開頭關閉同步、解除綁定，讀入 10^6 級資料時能快數倍；關閉後不要再混用 scanf/printf。',
        code: `int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n; cin >> n;
    cout << n << '\\n';    // use '\\n' instead of endl because endl flushes the buffer
    return 0;
}`,
        complexity: '輸入 O(n)，常數大幅下降'
      },
      {
        title: '常用的運算符',
        summary:
          '算術（+ - * / %）、關係（< > == !=）、邏輯（&& || !）、位元（& | ^ ~ << >>）四大類。特別注意整數除法會捨去小數、% 對負數的結果符號跟隨被除數。',
        code: `int q = 7 / 2;     // 3 (truncates toward zero)
int r = 7 % 2;     // 1
int neg = -7 % 2;  // -1（sign follows the dividend）
int p = 1 << 20;   // 2^20 = 1048576`
      },
      {
        title: '選擇結構語句',
        summary: '讓程式「依條件走不同分支」。競程裡最常用的是 if-else 鏈與 switch 多路分支。',
        children: [
          {
            title: 'if 條件語句',
            summary:
              '條件為真才執行區塊。多分支用 else if 串接，順序由上而下第一個成立者生效，因此範圍窄的條件要寫在前面。',
            code: `if (x > 0) {
    cout << "positive";
} else if (x == 0) {
    cout << "zero";
} else {
    cout << "negative";
}`
          },
          {
            title: 'switch 條件語句',
            summary:
              '對「單一整數/字元等於某些定值」的分派比 if 鏈清楚。每個 case 結尾要 break，否則會貫穿（fall-through）到下一個 case。',
            code: `switch (op) {
    case '+': ans = a + b; break;
    case '-': ans = a - b; break;
    default:  ans = 0;     // all other cases
}`
          }
        ]
      },
      {
        title: '循環結構語句',
        summary: '把重複的動作交給迴圈。三種寫法差在「先判斷還是先執行」與語意習慣。',
        children: [
          {
            title: 'for 語句',
            summary: '次數已知時的首選：初始化、條件、遞增三段一目了然，迴圈變數作用域也乾淨。',
            code: `for (int i = 0; i < n; ++i) {
    sum += a[i];
}`
          },
          {
            title: 'while 語句',
            summary: '先判斷後執行，適合「不知道要跑幾次、直到某條件成立」的場景，例如二分、雙指標。',
            code: `while (lo < hi) {
    int mid = (lo + hi) / 2;
    // ...update lo or hi depending on the comparison result
}`
          },
          {
            title: 'do while 語句',
            summary: '至少執行一次再判斷，適合「先做一輪再檢查」的流程，例如產生下一個排列後檢查。',
            code: `int x;
do {
    x = next();
} while (x != target);`
          }
        ]
      },
      {
        title: '巧用數組',
        summary:
          '陣列是連續記憶體，隨機存取 O(1)。大陣列（10^6 以上）要開成全域或 static，開在函式內會爆棧；宣告 MAXN+5 預留邊界避免 off-by-one。',
        children: [
          {
            title: '一維數組',
            summary: '下標從 0 起算，a[i] 直接定址。全域陣列會自動歸零，區域陣列則是未定值需自行初始化。',
            code: `const int kMaxN = 1e6 + 5;
int a[kMaxN];              // global arrays are zero-initialized automatically
// local initialization:int b[100] = {0};`
          },
          {
            title: '二維數組',
            summary:
              '以列優先（row-major）連續存放，a[i][j] 的位址是 i*列寬+j。遍歷時外層走 i、內層走 j 才符合快取局部性，速度較快。',
            code: `int g[1005][1005];
for (int i = 0; i < n; ++i) {
    for (int j = 0; j < m; ++j) {
        cin >> g[i][j];
    }
}`
          }
        ]
      },
      {
        title: '玩轉字符串',
        summary: '競程處理字串有兩套：C 風格字元陣列與 C++ 的 string。多數情況用 string，需要極致常數才回退 char[]。',
        children: [
          {
            title: 'C 風格的字符串',
            summary:
              '以 \\0 結尾的 char 陣列，長度靠 strlen 掃描得知（O(n)）。搭配 scanf("%s")、strcmp、strcpy 使用，優點是常數小、缺點是易越界。',
            code: `char s[105];
scanf("%s", s);           // reads until whitespace, appends '\\0'
int len = strlen(s);`
          },
          {
            title: 'C++ string 類型的字符串',
            summary:
              '自動管理長度與記憶體，支援 +、比較、substr、find 等。size() 為 O(1)。大量拼接請用 += 或 reserve，避免反覆重配。',
            code: `string s; cin >> s;         // reads one token
getline(cin, s);            // reads entire line
s += 'x';
if (s.substr(0, 3) == "abc") { /* ... */ }`
          }
        ]
      },
      {
        title: '結構體的應用',
        summary:
          '把相關欄位打包成一個型別，讓資料有語意。競程常用於「一批帶多個屬性的物件」，再配合 sort 自訂比較排序。',
        code: `struct Point { int x, y; };
bool cmp(const Point& a, const Point& b) {
    return a.x != b.x ? a.x < b.x : a.y < b.y;
}
Point p[100];
sort(p, p + n, cmp);`
      },
      {
        title: '指針的應用',
        summary:
          '指標存的是「記憶體位址」。競程主要用於手寫鏈表/樹節點、以及理解陣列與函式參數的傳遞本質。& 取位址、* 解參考。',
        code: `int x = 10;
int* p = &x;      // p stores the address of x
*p = 20;          // dereferencing p modifies the original variable
struct Node { int v; Node* next; };`
      }
    ]
  },
  {
    id: 'foundation-algorithm-beauty',
    sourceChapter: 2,
    title: '算法之美',
    leetcodeProblemIds: [
      'math-lc-372',
      'dp-lc-516',
      'lc-762',
      'lc0x3f-931',
      'math-lc-50',
      'lc-1137',
      'lc0x3f-70',
      'lc-3304',
      'treedp-lc-543'
    ],
    topics: [
      {
        title: '算法複雜度',
        summary:
          '複雜度用大 O 描述「規模成長時資源如何成長」，只看最高階項、忽略常數。它是賽場上「先估算再選演算法」的依據。',
        children: [
          {
            title: '時間複雜度',
            summary:
              '以基本運算次數對 n 的成長階數表示。實務基準：約 10^8 次運算 ≈ 1 秒。反推可用複雜度：n≤20 可 2^n；n≤5000 可 O(n^2)；n≤10^5 需 O(n log n)；n≤10^7 幾乎只能 O(n)。',
            code: `// O(n^2): nested loops
for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) {
        work();
    }
}`,
            complexity: '以 10^8 ops/s 估時限'
          },
          {
            title: '空間複雜度',
            summary:
              '額外記憶體對 n 的成長。int 佔 4 bytes，一個 10^4×10^4 的 int 陣列就是 400MB，會 MLE。開陣列前先估「元素數 × 型別大小」。',
            complexity: '常見上限約 256MB'
          }
        ]
      },
      {
        title: '函數',
        summary: '把邏輯封裝成可重用的單元。關鍵是理解參數如何傳遞——傳值、引用、陣列三者行為不同。',
        children: [
          {
            title: '標準函數',
            summary:
              '善用標準庫省時間：<algorithm> 的 sort/max/min/swap/lower_bound、<cmath> 的 sqrt/abs、<numeric> 的 accumulate/gcd。',
            code: `int m = max(a, b);
int g = __gcd(a, b);
sort(v.begin(), v.end());`
          },
          {
            title: '傳值參數',
            summary: '把實參「複製」一份進函式，函式內修改不影響外部。複製大物件（如 vector）成本高。',
            code: `void f(int x) { x = 100; }  // external value unchanged because it is passed by value`
          },
          {
            title: '引用參數',
            summary:
              '用 & 讓形參成為實參的別名，函式內修改會反映到外部；傳大物件時加 const& 可避免複製又防止誤改。',
            code: `void f(int& x) { x = 100; }         // modifies the external value because it is passed by reference
void g(const vector<int>& v) { /* read-only: avoids copying the entire vector */ }`
          },
          {
            title: '數組參數',
            summary:
              '陣列傳入時退化成指標，函式內拿不到長度，必須另外傳 n。因為傳的是位址，函式內對元素的修改會作用到原陣列。',
            code: `void f(int a[], int n) { a[0] = 42; }  // original array is mutated because arrays decay to pointers`
          }
        ]
      },
      {
        title: '遞歸',
        summary: '函式呼叫自己，把大問題化為同型的小問題。它是分治、DFS、樹/圖走訪的共同骨架。',
        children: [
          {
            title: '遞歸函數',
            summary:
              '三要素缺一不可：終止條件、每層要做的事、如何縮小問題。缺終止條件會無限遞迴，縮小方向錯會爆棧。',
            code: `long long fib(int n) {
    if (n <= 1) {
        return n;          // base case: stops infinite recursion
    }
    return fib(n - 1) + fib(n - 2); // shrink problem size
}`,
            complexity: '樸素 O(2^n)，記憶化後 O(n)'
          },
          {
            title: '遞歸的原理',
            summary:
              '每次呼叫在系統堆疊壓入一層「活動記錄」，返回時彈出。深度過大（如 10^6 層）會堆疊溢位；樸素遞迴常重複計算相同子問題，看到重疊子問題就該想記憶化或改迭代。',
            code: `// memoization turns exponential time into linear
long long f[100]; bool vis[100];
long long fib(int n) {
    if (n <= 1) {
        return n;
    }
    if (vis[n]) {
        return f[n];
    }
    vis[n] = true;
    return f[n] = fib(n - 1) + fib(n - 2);
}`
          }
        ]
      }
    ]
  },
  {
    id: 'foundation-linear-list',
    sourceChapter: 3,
    title: '線性表的應用',
    leetcodeProblemIds: [
      'lc-725',
      'mono-001',
      'lc-817',
      'lc0x3f-1019',
      'lc-206',
      'lc-21',
      'lc-25',
      'lc-1441',
      'lc-232',
      'lc-641'
    ],
    topics: [
      {
        title: '順序表',
        summary:
          '用連續陣列實作的線性表，隨機存取 O(1)。缺點是中間插入/刪除要搬移後續元素，為 O(n)。實務上直接用 std::vector。',
        children: [
          {
            title: '插入',
            summary: '在位置 pos 插入元素，需把 pos 之後全部往後搬一格，再放入新值。',
            code: `void insert(int a[], int& n, int pos, int x) {
    for (int i = n; i > pos; --i) {
        a[i] = a[i - 1];
    }
    a[pos] = x; ++n;
}`,
            complexity: 'O(n)'
          },
          {
            title: '刪除',
            summary: '刪掉位置 pos，需把之後元素往前搬一格覆蓋。',
            code: `void erase(int a[], int& n, int pos) {
    for (int i = pos; i < n - 1; ++i) {
        a[i] = a[i + 1];
    }
    --n;
}`,
            complexity: 'O(n)'
          }
        ]
      },
      {
        title: '鏈表',
        summary:
          '節點以指標串接，插入/刪除只改指標為 O(1)，但不能隨機存取（查第 k 個要走 O(n)）。適合頻繁在中間增刪的場景。',
        children: [
          {
            title: '單鏈表',
            summary: '每個節點存值與指向下一節點的 next。用哨兵（dummy）頭節點可統一邊界處理。',
            code: `struct Node { int val; Node* next; };
// insert x after node p
void insertAfter(Node* p, int x) {
    p->next = new Node{x, p->next};
}
// erase successor of p
void eraseAfter(Node* p) {
    Node* q = p->next;
    if (q) {
        p->next = q->next;
        delete q;
    }
}`,
            complexity: '插入/刪除 O(1)'
          },
          {
            title: '雙向鏈表',
            summary: '節點多一個 prev 指標，可 O(1) 前後移動與雙向刪除，代價是多維護一組指標。對應 STL 的 std::list。',
            code: `struct Node { int val; Node *prev, *next; };`
          },
          {
            title: '循環鏈表',
            summary: '尾節點的 next 指回頭節點，形成環，適合輪轉排程（如約瑟夫問題），可從任一點出發繞回。'
          },
          {
            title: '靜態鏈表',
            summary:
              '用陣列下標當「指標」模擬鏈表：val[i] 存值、nxt[i] 存下一個下標。省去動態配置、常數小，是競程常用寫法。',
            code: `int val[kN], nxt[kN], head, cnt;`
          }
        ]
      },
      {
        title: '棧',
        summary:
          '後進先出（LIFO）。用於括號匹配、運算式求值、單調棧、DFS 的迭代化。對空棧呼叫 top()/pop() 是未定義行為，先判 empty()。',
        children: [
          {
            title: '入棧',
            summary: '把元素壓到棧頂，push 為 O(1)。',
            code: `stack<int> st; st.push(1);`
          },
          {
            title: '出棧',
            summary: 'pop() 移除棧頂但不回傳值，需先用 top() 取值。',
            code: `if (!st.empty()) {
    int t = st.top();
    st.pop();
}`
          },
          {
            title: '取棧頂元素',
            summary: 'top() 讀取棧頂而不移除，O(1)。',
            code: `int t = st.top();`
          }
        ]
      },
      {
        title: '隊列',
        summary: '先進先出（FIFO）。是 BFS 的核心容器；C++ 用 std::queue，兩端都要操作時用 std::deque。',
        children: [
          {
            title: '順序隊列',
            summary: '用陣列 + 頭尾指標（front/rear）實作，入隊移動 rear、出隊移動 front。純線性陣列會「假溢位」浪費前段空間。',
            code: `int q[kN], head = 0, tail = 0;
q[tail++] = x;        // enqueue
int y = q[head++];    // dequeue`
          },
          {
            title: '循環隊列',
            summary:
              '把陣列首尾相接，下標對容量取模，解決假溢位。判空與判滿要留一格或另存 size 來區分。',
            code: `int q[kN], head = 0, tail = 0;
q[tail] = x; tail = (tail + 1) % kN;   // enqueue
int y = q[head]; head = (head + 1) % kN; // dequeue`
          }
        ]
      },
      {
        title: 'STL 中的常用函數和容器',
        summary: '賽場上優先用 STL，省下手寫結構的除錯時間。以下是最高頻的幾個。',
        children: [
          {
            title: 'sort()',
            summary: 'introsort，平均 O(n log n)。第三參數傳比較器，回傳 true 表示「前者該排在前」。',
            code: `sort(a, a + n);                         // ascending
sort(a, a + n, greater<int>());          // descending
sort(v.begin(), v.end(), [](auto x, auto y) { return x.w < y.w; });`,
            complexity: 'O(n log n)'
          },
          {
            title: 'vector（向量）',
            summary: '動態陣列，尾端增刪均攤 O(1)、隨機存取 O(1)。競程最泛用的容器。',
            code: `vector<int> v;
v.push_back(3);
v.pop_back();
for (int x : v) {
    cout << x;
}`
          },
          {
            title: 'stack（棧）',
            summary: 'LIFO 介面封裝，底層預設用 deque。只有 push/pop/top/empty/size。',
            code: `stack<int> st; st.push(1); st.pop();`
          },
          {
            title: 'queue（隊列）',
            summary: 'FIFO 介面，push 進尾、pop 出頭、front 讀頭。BFS 標配。',
            code: `queue<int> q; q.push(1); q.front(); q.pop();`
          },
          {
            title: 'list（雙向鏈表）',
            summary: '雙向鏈表，任意位置 O(1) 增刪但不支援隨機存取。需要迭代器穩定或頻繁中間增刪時用。',
            code: `list<int> lst; lst.push_front(1); lst.push_back(2);`
          }
        ]
      }
    ]
  },
  {
    id: 'foundation-tree',
    sourceChapter: 4,
    title: '樹的應用',
    leetcodeProblemIds: [
      'lc-404',
      'lc-671',
      'lc-872',
      'lc-1214-2',
      'lc-144',
      'lc-94',
      'lc-145',
      'lc-102',
      'lc-105',
      'lc-98',
      'lc-450'
    ],
    topics: [
      {
        title: '樹',
        summary: '樹是無環連通圖，n 個節點 n-1 條邊。它是遞迴結構的典型，許多問題都能「在子樹上遞迴、回到父節點合併」。',
        children: [
          {
            title: '樹的存儲',
            summary: '一般樹用「孩子表示法」：每個節點存一個子節點清單（vector）。有根樹另存父節點便於向上跳。',
            code: `vector<int> child[kN];
child[u].push_back(v);   // v is a child of u`
          },
          {
            title: '樹、森林與二叉樹的轉換',
            summary:
              '「左孩子右兄弟」表示法可把任意樹/森林唯一對應到二叉樹：節點的第一個孩子放左指標、下一個兄弟放右指標。於是一般樹問題能轉成二叉樹處理。'
          }
        ]
      },
      {
        title: '二叉樹',
        summary: '每個節點至多兩個孩子（左、右）。是最核心的樹形結構，遍歷與搜尋樹皆以它為基礎。',
        children: [
          {
            title: '二叉樹的性質',
            summary:
              '第 i 層至多 2^(i-1) 個節點；高度 h 的二叉樹至多 2^h−1 個節點；n 個節點的二叉樹高度至少 ⌈log2(n+1)⌉。這些界決定了平衡與否的效能。'
          },
          {
            title: '滿二叉樹和完全二叉樹',
            summary:
              '滿二叉樹每層都填滿；完全二叉樹只有最後一層可不滿且靠左。完全二叉樹可用陣列緊湊存放：節點 i 的左右孩子為 2i、2i+1，父為 i/2——這正是堆的儲存方式。'
          },
          {
            title: '二叉樹的存儲結構',
            summary: '指標式（左右孩子指標）最通用；完全二叉樹用陣列。競程常用陣列模擬避免動態配置。',
            code: `struct Node { int val; Node *l, *r; };
// or array-based representation:int lc[kN], rc[kN], val[kN];`
          }
        ]
      },
      {
        title: '二叉樹遍歷',
        summary:
          '四種遍歷是所有二叉樹題的基本功。前中後序差在「處理當前節點」的時機，層序則是用佇列的 BFS。全部 O(n)。',
        children: [
          {
            title: '先序遍歷',
            summary: '根 → 左 → 右。先處理根再遞迴子樹，常用於「複製樹」「序列化」。',
            code: `void pre(Node* r) {
    if (!r) {
        return;
    }
    visit(r); pre(r->l); pre(r->r);
}`,
            complexity: 'O(n)'
          },
          {
            title: '中序遍歷',
            summary: '左 → 根 → 右。對二叉搜索樹而言，中序輸出恰為遞增序列，可用來驗證 BST 合法性。',
            code: `void in(Node* r) {
    if (!r) {
        return;
    }
    in(r->l); visit(r); in(r->r);
}`,
            complexity: 'O(n)'
          },
          {
            title: '後序遍歷',
            summary: '左 → 右 → 根。先處理完子樹再處理根，適合「釋放樹」「自底向上計算子樹資訊」。',
            code: `void post(Node* r) {
    if (!r) {
        return;
    }
    post(r->l); post(r->r); visit(r);
}`,
            complexity: 'O(n)'
          },
          {
            title: '層次遍歷',
            summary: '逐層由左到右，用佇列做 BFS：出隊一個就把它的左右孩子入隊。',
            code: `queue<Node*> q; q.push(root);
while (!q.empty()) {
    Node* u = q.front(); q.pop();
    visit(u);
    if (u->l) {
        q.push(u->l);
    }
    if (u->r) {
        q.push(u->r);
    }
}`,
            complexity: 'O(n)'
          }
        ]
      },
      {
        title: '哈夫曼樹',
        summary:
          '給定一組權值，構造帶權路徑長度（WPL）最小的二叉樹。做法是貪心：每次取兩個最小權值合併，用小根堆維護，是最優前綴編碼的基礎。',
        code: `priority_queue<long long, vector<long long>, greater<>> pq;
for (auto w : weights) {
    pq.push(w);
}
long long cost = 0;
while (pq.size() > 1) {
    long long a = pq.top(); pq.pop();
    long long b = pq.top(); pq.pop();
    cost += a + b; pq.push(a + b);
}`,
        complexity: 'O(n log n)',
        children: [
          {
            title: '哈夫曼編碼',
            summary:
              '把字元依頻率建哈夫曼樹，左邊記 0、右邊記 1，得到「頻率越高、碼越短」的前綴碼（無碼是另一碼的前綴），可無歧義解碼並最小化總長。'
          },
          {
            title: '哈夫曼編碼的長度計算方法',
            summary:
              '總編碼長度 = 各葉子權值 × 其深度之和 = 建樹過程中每次合併的權值和累加。因此不需真的建樹，只用上面的堆即可求最小總長。'
          }
        ]
      },
      {
        title: '二叉搜索樹',
        summary:
          'BST 性質：左子樹皆小於根、右子樹皆大於根。因此查找/插入/刪除平均 O(log n)。但按有序資料插入會退化成鏈 O(n)，需平衡樹補救。',
        children: [
          {
            title: '二叉搜索樹原理詳解',
            summary: '中序遍歷即有序，是 BST 的核心不變量；一切操作都在「維持這個有序性」的前提下進行。'
          },
          {
            title: '查找',
            summary: '從根出發，比根小往左、比根大往右，直到命中或走到空。',
            code: `Node* find(Node* r, int x) {
    while (r && r->val != x) {
        r = x < r->val ? r->l : r->r;
    }
    return r;
}`,
            complexity: '平均 O(log n)，最壞 O(n)'
          },
          {
            title: '插入',
            summary: '按查找路徑走到空位置，掛上新節點。',
            code: `Node* insert(Node* r, int x) {
    if (!r) {
        return new Node{x, nullptr, nullptr};
    }
    if (x < r->val) {
        r->l = insert(r->l, x);
    } else {
        r->r = insert(r->r, x);
    }
    return r;
}`,
            complexity: '平均 O(log n)'
          },
          {
            title: '創建',
            summary: '把一組資料逐個 insert 即建成 BST；輸入順序決定樹形與是否退化。'
          },
          {
            title: '刪除',
            summary:
              '三種情況：葉節點直接刪；只有一個孩子用孩子頂替；有兩個孩子用右子樹最小值（中序後繼）替換值，再遞迴刪那個後繼。',
            code: `Node* del(Node* r, int x) {
    if (!r) {
        return r;
    }
    if (x < r->val) {
        r->l = del(r->l, x);
    } else if (x > r->val) {
        r->r = del(r->r, x);
    } else {
        if (!r->l) {
            return r->r;
        }
        if (!r->r) {
            return r->l;
        }
        Node* s = r->r;
        while (s->l) {  // inorder successor
            s = s->l;
        }
        r->val = s->val; r->r = del(r->r, s->val);
    }
    return r;
}`,
            complexity: '平均 O(log n)'
          }
        ]
      }
    ]
  },
  {
    id: 'foundation-graph',
    sourceChapter: 5,
    title: '圖論基礎',
    leetcodeProblemIds: [
      'graph-lc-542',
      'graph-lc-1162',
      'lc-lcp-07',
      'lc-1548',
      'graph-lc-200',
      'graph-001',
      'lc-841',
      'graph-002',
      'lc-1091',
      'lc-785'
    ],
    topics: [
      {
        title: '圖的存儲',
        summary: '圖的第一件事是「怎麼存」。選型看稠密度：稀疏圖用鄰接表 O(n+m)，稠密圖或需 O(1) 查邊用鄰接矩陣。',
        children: [
          {
            title: '鄰接矩陣',
            summary: 'g[u][v] 記錄 u→v 的邊或權。查任一邊 O(1)，但空間 O(n^2)，n 上千就 MLE。適合稠密圖與 Floyd。',
            code: `int g[kN][kN];       // g[u][v] = edge weight; use kInf when there is no edge
g[u][v] = w;`,
            complexity: '空間 O(n^2)'
          },
          {
            title: '邊集數組',
            summary: '直接存所有邊 (u, v, w)。本身不利於查鄰居，但 Kruskal、Bellman-Ford 這類「遍歷所有邊」的算法很合用。',
            code: `struct Edge { int u, v, w; };
vector<Edge> edges;`
          },
          {
            title: '鄰接表',
            summary: '每個點存一串出邊，空間 O(n+m)，遍歷鄰居高效。競程最泛用，直接用 vector 最直觀。',
            code: `vector<pair<int, int>> g[kN];  // {neighbor, weight}
g[u].push_back({v, w});
g[v].push_back({u, w});      // undirected graph: add edges in both directions`,
            complexity: '空間 O(n+m)'
          },
          {
            title: '鏈式前向星',
            summary:
              '用陣列模擬鄰接表：head[u] 指向 u 的第一條邊，每條邊存 to 與 next。常數比 vector 小、無動態配置，卡常時使用。',
            code: `int head[kN], to[kM], nxt[kM], ecnt;
void addEdge(int u, int v) {
    to[ecnt] = v; nxt[ecnt] = head[u]; head[u] = ecnt++;
}
for (int e = head[u]; ~e; e = nxt[e]) {
    int v = to[e]; /* ... */
}`
          },
          {
            title: '圖的存儲技巧',
            summary:
              '無向圖每條邊加兩次（忘記反向邊是最常見 bug）；需要反向邊配對（如網路流）時，讓成對邊編號 i 與 i^1 相鄰。'
          }
        ]
      },
      {
        title: '圖的遍歷',
        summary: '走遍每個節點與連通塊的兩種基本方式。用 visited 標記避免重複；DFS 深度大時可能爆棧。',
        children: [
          {
            title: '廣度優先遍歷',
            summary:
              '從起點逐層外擴，用佇列實作。在「無權圖」中，第一次訪問到某點的層數就是最短步數。務必在「入隊時」標記已訪問，否則會重複入隊。',
            code: `queue<int> q; q.push(s); dist[s] = 0;
while (!q.empty()) {
    int u = q.front(); q.pop();
    for (auto [v, w] : g[u]) {
        if (dist[v] == -1) {
            dist[v] = dist[u] + 1; q.push(v);
        }
    }
}`,
            complexity: 'O(n+m)'
          },
          {
            title: '深度優先遍歷',
            summary: '沿一條路走到底再回溯，天然遞迴。用於連通塊計數、拓撲、找環、樹形 DP 的骨架。',
            code: `void dfs(int u) {
    vis[u] = true;
    for (auto [v, w] : g[u]) {
        if (!vis[v]) {
            dfs(v);
        }
    }
}`,
            complexity: 'O(n+m)'
          }
        ]
      }
    ]
  },
  {
    id: 'foundation-algorithm-intro',
    sourceChapter: 6,
    title: '基礎算法與技巧',
    leetcodeProblemIds: [
      'lc0x3f-1144',
      'int-001',
      'lc0x3f-1247',
      'heap-001',
      'lc-455',
      'int-lc-435',
      'heap-lc-215',
      'lc-912-2',
      'lc-973',
      'bs-lc-410'
    ],
    topics: [
      {
        title: '貪心算法',
        summary: '每步都做「當下看來最好的選擇」，期望導出全域最優。難點不在寫，而在「證明貪心正確」。',
        children: [
          {
            title: '貪心算法秘籍',
            summary:
              '常見骨架是「按某關鍵字排序，再一次掃描做選擇」。正確性通常用交換論證：證明把任意逆序對交換不會讓答案變差。沒證明就用很危險，先想反例或改 DP。',
            code: `// interval scheduling: sort by end time and greedily pick compatible intervals
sort(a, a + n, [](auto& x, auto& y) { return x.end < y.end; });
int cnt = 0, last = -kInf;
for (auto& it : a) {
    if (it.start >= last) {
        ++cnt; last = it.end;
    }
}`,
            complexity: 'O(n log n)'
          },
          {
            title: '最優裝載問題',
            summary:
              '固定載重、物品不可分割且只計數量時，「按重量由小到大取」最優：先取輕的能塞進最多件。這是典型可用交換論證證明的貪心。'
          }
        ]
      },
      {
        title: '分治算法',
        summary: '「拆解 → 遞迴解子問題 → 合併」的框架。合併排序與快速排序是必背模板。',
        children: [
          {
            title: '分治算法秘籍',
            summary:
              '三步：把問題分成規模較小的同型子問題、遞迴求解、把子解合併。適用當「子問題獨立且合併代價可控」。複雜度由主定理估計。'
          },
          {
            title: '合併排序',
            summary:
              '對半分、各自排序、再線性合併兩個有序段。穩定且最壞仍 O(n log n)，需 O(n) 額外空間；合併時可順帶統計逆序對。',
            code: `void mergeSort(int l, int r) {
    if (l >= r) {
        return;
    }
    int m = (l + r) / 2;
    mergeSort(l, m); mergeSort(m + 1, r);
    int i = l, j = m + 1, k = 0;
    while (i <= m && j <= r) {
        tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
    }
    while (i <= m) {
        tmp[k++] = a[i++];
    }
    while (j <= r) {
        tmp[k++] = a[j++];
    }
    for (int t = 0; t < k; ++t) {
        a[l + t] = tmp[t];
    }
}`,
            complexity: 'O(n log n)'
          },
          {
            title: '快速排序',
            summary:
              '選 pivot，將小於的丟左、大於的丟右，遞迴兩側。平均 O(n log n)，但對有序輸入不隨機化會退化 O(n^2)。其 partition 可延伸出 O(n) 平均的 QuickSelect 求第 k 小。',
            code: `void quickSort(int l, int r) {
    if (l >= r) {
        return;
    }
    int i = l, j = r, p = a[l + rand() % (r - l + 1)];
    while (i <= j) {
        while (a[i] < p) {
            ++i;
        }
        while (a[j] > p) {
            --j;
        }
        if (i <= j) {
            swap(a[i++], a[j--]);
        }
    }
    quickSort(l, j); quickSort(i, r);
}`,
            complexity: '平均 O(n log n)，最壞 O(n^2)'
          }
        ]
      },
      {
        title: '常用陣列與區間技巧',
        summary: '把「重複的區間查詢/更新」預處理成 O(1) 操作，是競程的通用加速器。',
        children: [
          {
            title: '前綴和與二維前綴和',
            summary:
              's[i]=a[1..i] 之和，區間和 a[l..r]=s[r]−s[l−1] 為 O(1)。二維以容斥求子矩陣和。適用「陣列不變、多次查區間和」。',
            code: `// 1D prefix sum
for (int i = 1; i <= n; ++i) {
    s[i] = s[i - 1] + a[i];
}
int sum = s[r] - s[l - 1];
// 2D submatrix sum
int S = p[x2][y2] - p[x1 - 1][y2] - p[x2][y1 - 1] + p[x1 - 1][y1 - 1];`,
            complexity: '預處理 O(n)，查詢 O(1)'
          },
          {
            title: '差分與二維差分',
            summary:
              '前綴和的逆運算：對區間 [l,r] 同加 v，只需 d[l]+=v、d[r+1]−=v，最後求前綴和還原。把「多次區間加、最後查值」變 O(n)。',
            code: `d[l] += v; d[r + 1] -= v;          // accumulate range additions lazily
for (int i = 1; i <= n; ++i) {  // restore final values by taking prefix sums
    a[i] = a[i - 1] + d[i];
}`,
            complexity: '每次區間加 O(1)'
          }
        ]
      },
      {
        title: '雙指針與滑動窗口',
        summary: '用兩個下標協同移動，把很多 O(n^2) 的掃描降到 O(n)。前提是問題具「單調性」。',
        children: [
          {
            title: '雙指針算法 (同向與對向)',
            summary:
              '對向指標從兩端向中間逼近（如有序陣列找兩數之和）；同向指標一快一慢（如原地去重、判迴文）。關鍵是想清楚「移動哪一根、何時移」。',
            code: `// two-sum on a sorted array
int i = 0, j = n - 1;
while (i < j) {
    int s = a[i] + a[j];
    if (s == target) {
        break;
    }
    s < target ? ++i : --j;
}`,
            complexity: 'O(n)'
          },
          {
            title: '滑動窗口基礎',
            summary:
              '右指標擴張納入新元素、左指標在條件被破壞時收縮，維持一個合法區間。適用「最長/最短滿足某條件的連續子段」。',
            code: `int l = 0; long long sum = 0, best = 0;
for (int r = 0; r < n; ++r) {
    sum += a[r];
    while (sum > K) {  // shrink window until it satisfies the constraint
        sum -= a[l++];
    }
    best = max(best, (long long)(r - l + 1));
}`,
            complexity: 'O(n)'
          }
        ]
      }
    ]
  },
  {
    id: 'foundation-basic-math',
    sourceChapter: 7,
    title: '基礎數論與數學入門',
    topics: [
      {
        title: '位運算技巧',
        summary: '直接操作二進位位元，常數極小。競程常用於狀態壓縮、集合表示與各種取巧。',
        children: [
          {
            title: '常用位運算操作與奇偶判斷',
            summary:
              '&（且）、|（或）、^（異或）、~（取反）、<</>>（移位）。奇偶用 x&1；乘/除 2 的冪用移位；取第 k 位用 (x>>k)&1；置位用 x|(1<<k)。',
            code: `bool odd = x & 1;
int kth = (x >> k) & 1;   // k-th bit
x |= (1 << k);            // set the k-th bit to 1
x &= ~(1 << k);           // clear the k-th bit to 0
x ^= (1 << k);            // flip the k-th bit`
          },
          {
            title: 'x & (x-1) 的巧妙應用',
            summary:
              'x−1 會把最低位的 1 變 0、其後的 0 變 1，故 x&(x−1) 恰好抹掉最低位的 1。反覆執行可 O(popcount) 數「1 的個數」；判 2 的冪則是 x>0 且 x&(x−1)==0。',
            code: `int popCount(int x) {
    int c = 0;
    while (x) {
        x &= x - 1;
        ++c;
    }
    return c;
}
bool isPow2 = x > 0 && (x & (x - 1)) == 0;`,
            complexity: 'O(位數中 1 的個數)'
          }
        ]
      },
      {
        title: '質數與篩法',
        summary: '質數判定與批量產生質數是數論的入口，選對方法差在單個查詢還是大量預處理。',
        children: [
          {
            title: '質數判定與分解',
            summary:
              '判單一數只需試除到 √n；質因數分解也是試除到 √n，每找到一個因子就除盡，最後剩下的（>1）也是一個質因子。',
            code: `bool isPrime(long long n) {
    if (n < 2) {
        return false;
    }
    for (long long i = 2; i * i <= n; ++i) {
        if (n % i == 0) {
            return false;
        }
    }
    return true;
}`,
            complexity: 'O(√n)'
          },
          {
            title: '埃氏篩與歐拉線性篩',
            summary:
              '埃氏篩：從每個質數起把其倍數標記為合數，O(n log log n)。歐拉篩讓每個合數只被其「最小質因子」篩一次，達到嚴格 O(n)。',
            code: `// Euler linear sieve
vector<int> primes; bool comp[kN];
for (int i = 2; i < kN; ++i) {
    if (!comp[i]) {
        primes.push_back(i);
    }
    for (int p : primes) {
        if (1LL * i * p >= kN) {
            break;
        }
        comp[i * p] = true;
        if (i % p == 0) {  // break when the smallest prime factor divides i
            break;
        }
    }
}`,
            complexity: '埃氏 O(n log log n)，歐拉 O(n)'
          }
        ]
      },
      {
        title: '最大公約數與最小公倍數',
        summary: 'gcd 是數論的基石，lcm 由 gcd 導出。注意先除後乘避免溢位。',
        children: [
          {
            title: '歐幾里得算法 (輾轉相除法)',
            summary:
              '基於 gcd(a,b)=gcd(b, a mod b)，輾轉取餘直到 0。lcm(a,b)=a/gcd*b（先除再乘防溢位）。',
            code: `long long gcd(long long a, long long b) {
    return b ? gcd(b, a % b) : a;
}
long long lcm(long long a, long long b) {
    return a / gcd(a, b) * b;
}`,
            complexity: 'O(log min(a,b))'
          }
        ]
      },
      {
        title: '快速冪',
        summary: '用「指數的二進位分解」把冪次從 O(n) 降到 O(log n)，是模運算與矩陣冪的通用工具。',
        children: [
          {
            title: '取模運算律',
            summary:
              '加、減、乘可逐步取模：(a+b)%m、(a*b)%m 都能先取模再運算。減法先 +m 再 %m 防負；除法不能直接取模，要用逆元。乘法前記得轉 long long。'
          },
          {
            title: '整數快速冪算法',
            summary: '把指數看成二進位，逐位平方底數，遇到為 1 的位就乘進答案。',
            code: `long long qpow(long long a, long long b, long long mod) {
    long long r = 1; a %= mod;
    while (b) {
        if (b & 1) {
            r = r * a % mod;
        }
        a = a * a % mod; b >>= 1;
    }
    return r;
}`,
            complexity: 'O(log b)'
          }
        ]
      }
    ]
  },
  {
    id: 'foundation-big-integer',
    sourceChapter: 8,
    title: '高精度計算',
    leetcodeProblemIds: [
      'lc-2614',
      'lc-3115',
      'lc-3556',
      'lc-3765',
      'lc-989',
      'lc-2',
      'lc-2816',
      'math-lc-50',
      'lc-166'
    ],
    topics: [
      {
        title: '高精度加法',
        summary:
          '數字超出 long long 時，用陣列模擬豎式。核心是「逆序存放（個位在下標 0）」，讓進位自然向高位傳播。',
        children: [
          {
            title: '接收和存儲數據',
            summary: '把輸入字串逆序存進 int 陣列，s 的最後一個字元（個位）放到 A[0]，方便對齊與進位。',
            code: `vector<int> toNum(const string& s) {
    vector<int> a;
    for (int i = s.size() - 1; i >= 0; --i) {
        a.push_back(s[i] - '0');
    }
    return a;
}`
          },
          {
            title: '處理進制',
            summary: '低位對齊逐位相加，carry = 和 /10 進位、和 %10 留下；任一位或進位還在就繼續。',
            code: `vector<int> add(vector<int>& a, vector<int>& b) {
    vector<int> c; int carry = 0;
    for (int i = 0; i < a.size() || i < b.size() || carry; ++i) {
        if (i < a.size()) {
            carry += a[i];
        }
        if (i < b.size()) {
            carry += b[i];
        }
        c.push_back(carry % 10); carry /= 10;
    }
    return c;
}`,
            complexity: 'O(len)'
          }
        ]
      },
      {
        title: '高精度減法',
        summary: '減法要先保證「大減小」，否則補負號。借位時當前位 +10、下一位扣 1，最後去前導零。',
        children: [
          {
            title: '比較大小',
            summary: '先比長度，長者大；等長則從高位往低位逐位比較，決定誰減誰與結果符號。',
            code: `bool geq(vector<int>& a, vector<int>& b) {   // is a greater than or equal to b?
    if (a.size() != b.size()) {
        return a.size() > b.size();
    }
    for (int i = a.size() - 1; i >= 0; --i) {
        if (a[i] != b[i]) {
            return a[i] > b[i];
        }
    }
    return true;
}`
          },
          {
            title: '接收和存儲數據',
            summary: '同加法：逆序存放個位在前，方便從低位開始借位。'
          },
          {
            title: '處理借位',
            summary: '逐位相減，不夠減就向高位借 10；算完去掉多餘前導零（但保留單個 0）。',
            code: `vector<int> sub(vector<int>& a, vector<int>& b) {   // requires a >= b to avoid negative results
    vector<int> c; int borrow = 0;
    for (int i = 0; i < a.size(); ++i) {
        int t = a[i] - borrow - (i < b.size() ? b[i] : 0);
        borrow = t < 0; c.push_back((t + 10) % 10);
    }
    while (c.size() > 1 && c.back() == 0) {
        c.pop_back();
    }
    return c;
}`,
            complexity: 'O(len)'
          }
        ]
      },
      {
        title: '高精度乘法',
        summary: '高精度乘低精度（大數 × int）最常考：把整個 int 當一個乘數，逐位乘後統一處理進位。',
        children: [
          {
            title: '接收和存儲數據',
            summary: '大數逆序存陣列，另一個乘數維持普通整數 b。'
          },
          {
            title: '處理進制',
            summary: '每位乘 b 加進位，%10 留下、/10 進位；進位可能超過一位，用迴圈把剩餘進位攤到高位。',
            code: `vector<int> mul(vector<int>& a, int b) {
    vector<int> c; int carry = 0;
    for (int i = 0; i < a.size() || carry; ++i) {
        if (i < a.size()) {
            carry += a[i] * b;
        }
        c.push_back(carry % 10); carry /= 10;
    }
    while (c.size() > 1 && c.back() == 0) {
        c.pop_back();
    }
    return c;
}`,
            complexity: 'O(len)'
          }
        ]
      },
      {
        title: '高精度除法',
        summary: '高精度除低精度（大數 ÷ int）：從最高位開始按位相除，餘數乘 10 併入下一位。',
        children: [
          {
            title: '接收和存儲數據',
            summary: '除法從高位算起最直觀，可把被除數「正序」處理，餘數往低位傳。'
          },
          {
            title: '按位相除',
            summary: '從高位到低位：cur = 餘數*10 + 當前位，商位 = cur/b，餘數 = cur%b；最後去前導零。',
            code: `vector<int> div(vector<int>& a, int b, int& rem) { // high digit stored at front
    vector<int> c; rem = 0;
    for (int i = 0; i < a.size(); ++i) {
        int cur = rem * 10 + a[i];
        c.push_back(cur / b); rem = cur % b;
    }
    int k = 0;
    while (k + 1 < c.size() && c[k] == 0) {
        ++k;
    }
    return vector<int>(c.begin() + k, c.end());
}`,
            complexity: 'O(len)'
          }
        ]
      }
    ]
  },
  {
    id: 'foundation-search',
    sourceChapter: 9,
    title: '搜索算法入門',
    leetcodeProblemIds: [
      'bs-lc-34',
      'lc-261',
      'bs-lc-153',
      'lc-323',
      'bs-lc-704',
      'bs-001',
      'lc-875',
      'bs-lc-410',
      'lc-46',
      'lc-51-2',
      'lc-1091',
      'lc-1293'
    ],
    topics: [
      {
        title: '二分算法',
        summary: '在「單調性」上折半縮小範圍，每次砍一半，O(log n)。最易錯的是邊界與更新方式，選定一種寫法並固定。',
        children: [
          {
            title: '二分查找',
            summary:
              '在有序陣列找目標或其邊界。用左閉右開或閉區間都行，重點是 mid 取法與 lo/hi 更新要配套，避免 mid==lo 不前進而死循環。',
            code: `int lower(int a[], int n, int x) {   // first position with value >= x
    int lo = 0, hi = n;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < x) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}`,
            complexity: 'O(log n)'
          },
          {
            title: '二分答案',
            summary:
              '當「答案越大越容易/越難滿足」具單調性時，二分答案值、用 check() 驗證，把最優化問題轉成判定問題。check 常是「複製後改幾行」。',
            code: `int lo = 0, hi = kMax;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (check(mid)) {
        hi = mid;
    } else {
        lo = mid + 1;
    }
}
// lo is the smallest feasible answer`,
            complexity: 'O(log(range) × check)'
          }
        ]
      },
      {
        title: '深度優先搜索',
        summary: '枚舉解空間的通用方法：在每一步做選擇、遞迴、再撤銷選擇。配合剪枝可大幅縮小搜索。',
        children: [
          {
            title: '回溯法的原理',
            summary:
              '把解看成一棵決策樹，DFS 逐層選擇；走不通就回退（撤銷選擇）試別的分支。「撤銷」是關鍵，否則狀態會污染兄弟分支。'
          },
          {
            title: '回溯法模板',
            summary: '選擇 → 遞迴 → 撤銷 三段式。到達葉層記錄答案。',
            code: `void dfs(int step) {
    if (step == n) {
        record();
        return;
    }
    for (int c : choices) {
        make(c);
        dfs(step + 1);
        undo(c);          // backtrack: undo the choice so the next branch starts clean
    }
}`
          }
        ]
      },
      {
        title: '廣度優先搜索',
        summary: '逐層擴展，天生求「最少步數」。加上估價與界限就演化成分支限界法。',
        children: [
          {
            title: '分支限界法的原理',
            summary:
              '在 BFS/優先佇列搜索的基礎上，對每個部分解估一個「界」，凡是界已劣於當前最優的分支直接剪掉，只擴展有希望的節點。'
          },
          {
            title: '分支限界法秘籍',
            summary:
              '用優先佇列以「估價」排序節點，優先擴展最有希望者（最佳優先）。估價要合理：既要能剪枝，又不能把最優解誤剪。'
          }
        ]
      }
    ]
  },
  {
    id: 'foundation-dp',
    sourceChapter: 10,
    title: '動態規劃入門',
    leetcodeProblemIds: [
      'lc0x3f-1227',
      'lc0x3f-1884',
      'lc-1221',
      'lc-2294',
      'lc0x3f-70',
      'lc0x3f-746',
      'dp-lc-322',
      'lc-474',
      'dp-lc-1143',
      'dp-002',
      'lc-53',
      'lc-1547',
      'lc-1039'
    ],
    topics: [
      {
        title: '動態規劃秘籍',
        summary: 'DP 的本質是「重疊子問題 + 最優子結構」。把大問題拆成有序可解的子問題，記錄子問題答案避免重算。',
        children: [
          {
            title: '動態規劃的三個要素',
            summary:
              '狀態（子問題的定義）、轉移方程（狀態間的遞推關係）、邊界與遍歷順序。狀態必須「無後效性」——當前狀態只依賴已算好的子狀態。'
          },
          {
            title: '動態規劃的設計方法',
            summary:
              '先定義狀態、再寫轉移、最後定邊界與順序。可自頂向下（記憶化遞迴）或自底向上（迭代）。初始化往往是解題的一半：邊界錯，轉移再對也沒用。'
          }
        ]
      },
      {
        title: '背包問題',
        summary: 'DP 的入門標竿。用一維滾動陣列後，01 與完全背包只差「容量的遍歷方向」。',
        children: [
          {
            title: '01 背包問題',
            summary:
              '每件物品取或不取。f[j] 為容量 j 的最大價值；因為每件只能取一次，容量要「從大到小」遍歷，避免同件被重複取。',
            code: `for (int i = 0; i < n; ++i) {
    for (int j = capacity; j >= w[i]; --j) {
        f[j] = max(f[j], f[j - w[i]] + v[i]);
    }
}`,
            complexity: 'O(nW)'
          },
          {
            title: '完全背包問題',
            summary: '每件物品可取無限次。與 01 背包唯一差別是容量「從小到大」遍歷，讓同件能被重複計入。',
            code: `for (int i = 0; i < n; ++i) {
    for (int j = w[i]; j <= capacity; ++j) {
        f[j] = max(f[j], f[j - w[i]] + v[i]);
    }
}`,
            complexity: 'O(nW)'
          }
        ]
      },
      {
        title: '線性動態規劃',
        summary:
          '狀態沿一維序列推進的一大類 DP，包含最長上升子序列（LIS）、最長公共子序列（LCS）、最大連續子段和等經典模型。',
        code: `// O(n^2) LIS: f[i] = length of longest increasing subsequence ending at i
for (int i = 0; i < n; ++i) {
    f[i] = 1;
    for (int j = 0; j < i; ++j) {
        if (a[j] < a[i]) {
            f[i] = max(f[i], f[j] + 1);
        }
    }
}
// maximum subarray sum (Kadane algorithm)
long long cur = 0, best = LLONG_MIN;
for (int i = 0; i < n; ++i) {
    cur = max((long long)a[i], cur + a[i]);
    best = max(best, cur);
}`,
        complexity: 'LIS O(n^2)（可二分優化到 O(n log n)）'
      },
      {
        title: '區間動態規劃',
        summary:
          'f[i][j] 表示區間 [i,j] 的最優解，按「區間長度由小到大」枚舉，內層枚舉分割點 k，確保計算大區間時子區間已就緒。石子合併、括號匹配、迴文皆屬此類。',
        code: `for (int len = 2; len <= n; ++len) {
    for (int i = 1, j = len; j <= n; ++i, ++j) {
        f[i][j] = kInf;
        for (int k = i; k < j; ++k) {
            f[i][j] = min(f[i][j], f[i][k] + f[k + 1][j] + cost(i, j));
        }
    }
}`,
        complexity: 'O(n^3)'
      }
    ]
  }
];
