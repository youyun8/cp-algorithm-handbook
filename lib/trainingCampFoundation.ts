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
        code: `// 常用的數據類型: 依「數值可能達到的範圍」挑型別，而不是憑習慣都用 int。
int count = 1;                 // ~ ±2.1e9：一般計數、迴圈變數足夠使用
long long total = 1;           // ~ ±9.2e18：只要總和/乘積可能超過 2e9 就必須用它，否則會悄悄溢位而不報錯
double ratio = 1.5;            // 浮點數，約 15 位有效數字；注意不能用 == 直接比較兩個 double 是否相等
char letter = 'a';             // 單一字元，佔 1 byte
bool ok = true;                // true / false，佔 1 byte`,
        complexity: 'int 4 bytes、long long 8 bytes'
      },
      {
        title: '玩轉輸入和輸出',
        summary:
          'cin/cout 好寫但預設與 C 的 stdio 同步而較慢。在 main 開頭關閉同步、解除綁定，讀入 10^6 級資料時能快數倍；關閉後不要再混用 scanf/printf。',
        code: `// 玩轉輸入和輸出: 關閉同步後就不要混用 scanf/printf。
int main() {
    ios::sync_with_stdio(false);  // 不用維持與 C stdio 的緩衝區同步，讀寫大量資料時能明顯加速
    cin.tie(nullptr);             // 解除 cin 與 cout 的自動 flush 綁定，避免每次輸入前都強制清空輸出緩衝
    int n;
    cin >> n;                  // standard input
    cout << n << '\\n';    // use '\\n' instead of endl because endl flushes the buffer
    return 0;
}`,
        complexity: '輸入 O(n)，常數大幅下降'
      },
      {
        title: '常用的運算符',
        summary:
          '算術（+ - * / %）、關係（< > == !=）、邏輯（&& || !）、位元（& | ^ ~ << >>）四大類。特別注意整數除法會捨去小數、% 對負數的結果符號跟隨被除數。',
        code: `// 常用的運算符: 整數除法與 % 的行為容易和數學直覺不一致，先弄懂再用。
int q = 7 / 2;     // 3：整數除法無條件捨去小數（truncate toward zero），不是四捨五入或向下取整
int r = 7 % 2;     // 1：餘數
int neg = -7 % 2;  // -1：C++ 的 % 結果符號跟隨被除數（不是除數），與數學上的「模」不同，寫同餘題要特別注意
int p = 1 << 20;   // 2^20 = 1048576：左移一位等於乘 2，比呼叫 pow() 更快也不會有浮點誤差`
      },
      {
        title: '選擇結構語句',
        summary: '讓程式「依條件走不同分支」。競程裡最常用的是 if-else 鏈與 switch 多路分支。',
        children: [
          {
            title: 'if 條件語句',
            summary:
              '條件為真才執行區塊。多分支用 else if 串接，順序由上而下第一個成立者生效，因此範圍窄的條件要寫在前面。',
            code: `// if 條件語句: else if 由上而下逐一判斷，第一個成立的分支執行後就跳過其餘分支。
if (x > 0) {
    cout << "positive";
} else if (x == 0) {   // 只有 x <= 0 才會檢查這裡，因此不必再寫 x <= 0 && x == 0
    cout << "zero";
} else {                // 前面兩個條件都不成立時的兜底分支，等同「其餘所有情況」
    cout << "negative";
}`
          },
          {
            title: 'switch 條件語句',
            summary:
              '對「單一整數/字元等於某些定值」的分派比 if 鏈清楚。每個 case 結尾要 break，否則會貫穿（fall-through）到下一個 case。',
            code: `// switch 條件語句: 每個 case 結尾務必寫 break，否則會「貫穿」執行到下一個 case。
switch (op) {
    case '+': ans = a + b; break;  // break 讓程式跳出 switch，不會誤跑進 case '-'
    case '-': ans = a - b; break;
    default:  ans = 0;             // 沒有任何 case 命中時的兜底分支，習慣放在最後
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
            code: `// for 語句: 三段式把「初始化、終止條件、更新」集中寫在同一行，迴圈變數 i 的作用域也只在迴圈內。
for (int i = 0; i < n; ++i) {  // 用前置 ++i 而非 i++ 是好習慣，避免多一次不必要的臨時複製
    sum += a[i];
}`
          },
          {
            title: 'while 語句',
            summary: '先判斷後執行，適合「不知道要跑幾次、直到某條件成立」的場景，例如二分、雙指標。',
            code: `// while 語句: 二分時用不溢位的 mid 寫法。
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    // ...update lo or hi depending on the comparison result
}`
          },
          {
            title: 'do while 語句',
            summary: '至少執行一次再判斷，適合「先做一輪再檢查」的流程，例如產生下一個排列後檢查。',
            code: `// do while 語句: 先執行迴圈本體一次，再檢查條件，適合「至少要跑一輪才能判斷」的場景。
int x;
do {
    x = next();          // 第一次一定會呼叫 next()，即使一開始就等於 target 也要先跑過這一輪
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
            code: `// 一維數組: 固定上限用 constexpr，動態長度優先用 vector。
constexpr int kMaxN = 1'000'000 + 5;   // 多留 5 個緩衝，避免 i+1、i+2 這類下標算式不小心越界
array<int, kMaxN> a{};     // {} 觸發值初始化、全部歸零；大小是編譯期常數，配置在靜態記憶體不會讓函式呼叫堆疊爆掉
vector<int> b(n, 0);       // 大小由執行期輸入 n 決定，適合「上限差異很大或未知」的情境`
          },
          {
            title: '二維數組',
            summary:
              '以列優先（row-major）連續存放，a[i][j] 的位址是 i*列寬+j。遍歷時外層走 i、內層走 j 才符合快取局部性，速度較快。',
            code: `// 二維數組: vector 讓大小跟輸入 n,m 一致。
vector<vector<int>> g(n, vector<int>(m));  // n 個 vector<int>，每個長度 m，大小恰好對齊輸入規模
for (int i = 0; i < n; ++i) {          // 外層走列（row）
    for (int j = 0; j < m; ++j) {      // 內層走欄（column），符合記憶體的列優先佈局，快取命中率較高
        cin >> g[i][j];
    }
}`
          }
        ]
      },
      {
        title: '玩轉字符串',
        summary:
          '競程處理字串有兩套：C 風格字元陣列與 C++ 的 string。多數情況用 string，需要極致常數才回退 char[]。',
        children: [
          {
            title: 'C 風格的字符串',
            summary:
              '以 \\0 結尾的 char 陣列，長度靠 strlen 掃描得知（O(n)）。搭配 scanf("%s")、strcmp、strcpy 使用，優點是常數小、缺點是易越界。',
            code: `// C 風格的字符串: 若必須用 char buffer，至少用 array 管理容量。
array<char, 105> s{};       // 用 array 包裝，至少能用 .size() 得知容量，比裸的 char[105] 安全
cin >> s.data();          // reads until whitespace and appends '\\0'
int len = strlen(s.data());   // O(n)：strlen 要逐字元掃到 '\\0' 才知道長度，長字串應改用 string`
          },
          {
            title: 'C++ string 類型的字符串',
            summary:
              '自動管理長度與記憶體，支援 +、比較、substr、find 等。size() 為 O(1)。大量拼接請用 += 或 reserve，避免反覆重配。',
            code: `// C++ string 類型的字符串: string 自帶長度與記憶體管理。
string s;
cin >> s;                   // 讀到空白字元（空格、換行）就停止，且會自動略過前導空白
getline(cin >> ws, s);      // cin >> ws 先丟掉殘留的換行/空白，再讀「整行」直到 '\\n'（cin >> 之後接 getline 的常見地雷）
s += 'x';                   // 均攤 O(1)：string 內部有容量預留機制，不是每次追加都重新配置記憶體
if (s.starts_with("abc")) { /* C++20 prefix check */ }`
          }
        ]
      },
      {
        title: '結構體的應用',
        summary:
          '把相關欄位打包成一個型別，讓資料有語意。競程常用於「一批帶多個屬性的物件」，再配合 sort 自訂比較排序。',
        code: `// 結構體的應用: 用 vector + lambda 讓資料數量跟輸入同步。
struct Point { int x, y; };            // 把「一個點的兩個座標」打包成一個有語意的型別，勝過維護兩個平行陣列
vector<Point> points(n);
ranges::sort(points, [](const Point& a, const Point& b) {
    return pair{a.x, a.y} < pair{b.x, b.y};   // 借用 pair 內建的字典序比較，等同「先比 x，x 相同再比 y」
});`
      },
      {
        title: '指針的應用',
        summary:
          '指標存的是「記憶體位址」。競程主要用於手寫鏈表/樹節點、以及理解陣列與函式參數的傳遞本質。& 取位址、* 解參考。',
        code: `// 指針的應用: 競程節點常用裸指標，空指標一律用 nullptr。
int x = 10;
int* p = &x;      // & 取出 x 的記憶體位址，存進指標 p
*p = 20;          // * 解參考：透過位址回頭存取（並修改）它指向的變數，x 現在變成 20
struct Node { int v; Node* next = nullptr; };   // 指標成員預設初始化成 nullptr，避免宣告後忘記賦值變成「野指標」`
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
              '以基本運算次數對 n 的成長階數表示。粗估時常以每秒 10^7～10^8 次簡單操作作量級參考，但實際速度會受語言、常數、記憶體存取與硬體影響；必須搭配時限判斷。常見反推：n≤20 可考慮 2^n；n≤5000 可考慮 O(n^2)；n≤10^5 通常需要 O(n log n)；n≤10^7 多半接近 O(n)。',
            code: `// 時間複雜度: 巢狀迴圈的執行次數是「各層迴圈次數的乘積」，這是估算複雜度最直接的方法。
// O(n^2): nested loops
for (int i = 0; i < n; ++i) {          // 外層跑 n 次
    for (int j = 0; j < n; ++j) {      // 對每個外層迭代，內層都再跑 n 次
        work();                         // 故 work() 總共被呼叫 n*n 次，是 O(n^2)
    }
}`,
            complexity: '先估成長量級，再以約 10^7～10^8 簡單操作／秒作粗略校準'
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
            code: `// 標準函數: 優先使用標準庫名稱，避免非標準擴充。
int m = max(a, b);          // <algorithm>，比自己寫 a > b ? a : b 更不容易打錯比較方向
int g = gcd(a, b);          // <numeric>, replaces non-standard __gcd
ranges::sort(v);            // C++20 range-based sort`
          },
          {
            title: '傳值參數',
            summary: '把實參「複製」一份進函式，函式內修改不影響外部。複製大物件（如 vector）成本高。',
            code: `// 傳值參數: 呼叫時會把實參「複製」一份給形參 x，函式內修改的是副本。
void f(int x) { x = 100; }  // 只改到複製品，離開函式後外部原本的變數完全不受影響`
          },
          {
            title: '引用參數',
            summary:
              '用 & 讓形參成為實參的別名，函式內修改會反映到外部；傳大物件時加 const& 可避免複製又防止誤改。',
            code: `// 引用參數: & 讓形參成為實參的別名，兩者是同一塊記憶體，不會額外複製。
void f(int& x) { x = 100; }         // 修改 x 等同修改外部變數本身
void g(const vector<int>& v) { /* 加 const 表示唯讀，既避免複製整個 vector，又防止函式內誤改呼叫端資料 */ }`
          },
          {
            title: '數組參數',
            summary:
              '陣列傳入時退化成指標，函式內拿不到長度，必須另外傳 n。因為傳的是位址，函式內對元素的修改會作用到原陣列。',
            code: `// 數組參數: span 保留長度資訊，比裸陣列參數安全。
void f(span<int> a) {       // span 只是「指標 + 長度」的輕量視圖，不複製資料，函式內用 a.size() 就能知道長度
    a[0] = 42;              // mutates the original contiguous range
}`
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
            code: `// 遞歸函數: 每次呼叫都要讓問題「變小」並朝終止條件前進，否則會無限遞迴。
long long fib(int n) {
    if (n <= 1) {
        return n;          // 終止條件：n 已經小到能直接回答，遞迴到這裡就停止往下展開
    }
    return fib(n - 1) + fib(n - 2); // 把 f(n) 拆成兩個更小的同型子問題 f(n-1)、f(n-2) 再合併
}`,
            complexity: '樸素 O(2^n)，記憶化後 O(n)'
          },
          {
            title: '遞歸的原理',
            summary:
              '每次呼叫在系統堆疊壓入一層「活動記錄」，返回時彈出。深度過大（如 10^6 層）會堆疊溢位；樸素遞迴常重複計算相同子問題，看到重疊子問題就該想記憶化或改迭代。',
            code: `// 遞歸的原理: 記憶化把指數重算壓成線性。
array<long long, 100> memo{};
array<bool, 100> seen{};        // 另開陣列標記「算過了沒」：因為 fib(n) 的合法回傳值也可能是 0，不能只靠 memo[n] != 0 判斷
long long fib(int n) {
    if (n <= 1) {
        return n;
    }
    if (seen[n]) {
        return memo[n];         // 這個子問題以前算過，直接回傳快取結果，避免重複展開整棵遞迴樹
    }
    seen[n] = true;
    return memo[n] = fib(n - 1) + fib(n - 2);   // 先存進 memo 再回傳，下次遇到同樣的 n 就能 O(1) 命中
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
            code: `// 插入: vector::insert 直接表達「在 pos 前插入」。
void insert(vector<int>& a, int pos, int x) {
    a.insert(a.begin() + pos, x);   // 內部會把 pos 之後的元素往後搬一格，本身是 O(n)，但語意比手寫搬移迴圈清楚
}`,
            complexity: 'O(n)'
          },
          {
            title: '刪除',
            summary: '刪掉位置 pos，需把之後元素往前搬一格覆蓋。',
            code: `// 刪除: vector::erase 會自動搬移後續元素。
void erase(vector<int>& a, int pos) {
    a.erase(a.begin() + pos);   // 把 pos 之後的元素往前搬一格覆蓋掉它，容器長度隨之減一
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
            code: `// 單鏈表: 改接 next 即可 O(1) 插入或刪除後繼。
struct Node { int val; Node* next = nullptr; };
// insert x after node p
void insert_after(Node* p, int x) {
    p->next = new Node{x, p->next};   // 新節點的 next 先接上 p 原本的後繼，再讓 p 指向新節點，順序不能顛倒
}
// erase successor of p
void erase_after(Node* p) {
    Node* q = p->next;      // 先記住要刪除的節點，否則改完指標後就再也找不到它
    if (q) {
        p->next = q->next;  // 讓 p 跨過 q，直接接到 q 的下一個節點
        delete q;            // 手動 new 出來的節點要手動 delete，否則會記憶體洩漏（比賽可忽略，實務要注意）
    }
}`,
            complexity: '插入/刪除 O(1)'
          },
          {
            title: '雙向鏈表',
            summary:
              '節點多一個 prev 指標，可 O(1) 前後移動與雙向刪除，代價是多維護一組指標。對應 STL 的 std::list。',
            code: `// 雙向鏈表: prev/next 都初始化為 nullptr，避免野指標。
struct Node {
    int val{};
    Node* prev = nullptr;   // 多這一個指標讓「從任一節點往回走」變成 O(1)，代價是插入/刪除要多維護一組指標
    Node* next = nullptr;
};`
          },
          {
            title: '循環鏈表',
            summary: '尾節點的 next 指回頭節點，形成環，適合輪轉排程（如約瑟夫問題），可從任一點出發繞回。'
          },
          {
            title: '靜態鏈表',
            summary:
              '用陣列下標當「指標」模擬鏈表：val[i] 存值、nxt[i] 存下一個下標。省去動態配置、常數小，是競程常用寫法。',
            code: `// 靜態鏈表: 用陣列下標模擬指標，適合競程節點池。
vector<int> val(kMaxN), nxt(kMaxN);   // val[i]/nxt[i] 分別代表「節點 i」的值與下一個節點的下標
int head = -1, cnt = 0;               // head 是鏈表起點（-1 代表空表），cnt 是目前已配置的節點數，取代 new/delete`
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
            code: `// 入棧: push 只在棧頂新增元素，底層預設用 deque 實作，均攤 O(1)。
stack<int> st; st.push(1);  // 1 現在是棧頂，之後每個 push 的元素都會疊在它上面`
          },
          {
            title: '出棧',
            summary: 'pop() 移除棧頂但不回傳值，需先用 top() 取值。',
            code: `// 出棧: pop() 只負責移除、不回傳值，想要值就得先呼叫 top()。
if (!st.empty()) {         // 對空棧呼叫 top()/pop() 是未定義行為，務必先檢查
    int t = st.top();      // 先讀出棧頂的值
    st.pop();               // 再移除它，兩步缺一不可
}`
          },
          {
            title: '取棧頂元素',
            summary: 'top() 讀取棧頂而不移除，O(1)。',
            code: `// 取棧頂元素: top() 只窺視不移除，可重複呼叫都拿到同一個值。
int t = st.top();  // O(1)，呼叫前同樣要確保 st 不是空的`
          }
        ]
      },
      {
        title: '隊列',
        summary: '先進先出（FIFO）。是 BFS 的核心容器；C++ 用 std::queue，兩端都要操作時用 std::deque。',
        children: [
          {
            title: '順序隊列',
            summary:
              '用陣列 + 頭尾指標（front/rear）實作，入隊移動 rear、出隊移動 front。純線性陣列會「假溢位」浪費前段空間。',
            code: `// 順序隊列: vector 當底層儲存，head/tail 是半開區間 [head, tail)。
vector<int> q(kMaxN);
int head = 0, tail = 0;   // [head, tail) 內是目前隊列的有效元素，head == tail 代表空
q[tail++] = x;        // enqueue：寫入尾端後把 tail 往後移一格
int y = q[head++];    // dequeue：讀出頭端的值後，把 head 往後移一格捨棄它（元素還留在陣列裡，只是不再算數）`
          },
          {
            title: '循環隊列',
            summary: '把陣列首尾相接，下標對容量取模，解決假溢位。判空與判滿要留一格或另存 size 來區分。',
            code: `// 循環隊列: 取模讓尾端回到陣列開頭。
array<int, kMaxN> q{};
int head = 0, tail = 0;
q[tail] = x; tail = (tail + 1) % kMaxN;   // enqueue：對 kMaxN 取模，讓下標超過陣列尾端時自動繞回開頭，解決順序隊列的「假溢位」
int y = q[head]; head = (head + 1) % kMaxN; // dequeue：同樣取模前進；實務上還需另存 size 或留一格來區分「空」與「滿」`
          }
        ]
      },
      {
        title: 'STL 中的常用函數和容器',
        summary: '賽場上優先用 STL，省下手寫結構的除錯時間。以下是最高頻的幾個。',
        children: [
          {
            title: 'sort()',
            summary:
              'C++ 標準保證 std::sort 最壞 O(n log n) 次比較；常見實作是 introsort。第三參數傳比較器，回傳 true 表示「前者應排在前」，且必須滿足嚴格弱序。',
            code: `// sort(): ranges::sort 可直接接容器，少寫 begin/end。
ranges::sort(v);                         // ascending，預設用 operator< 比較
ranges::sort(v, greater<>{});             // 傳入比較器 greater<>{} 反轉比較方向，變成降序
struct Item { int w; };
vector<Item> items;
ranges::sort(items, {}, &Item::w);         // 第三個參數是「投影」，等同先取出 .w 再比較，不必自己寫 lambda`,
            complexity: 'O(n log n)'
          },
          {
            title: 'vector（向量）',
            summary: '動態陣列，尾端增刪均攤 O(1)、隨機存取 O(1)。競程最泛用的容器。',
            code: `// vector（向量）: 動態陣列，尾端增刪均攤 O(1)。
vector<int> v;
v.push_back(3);   // 容量不足時會整批重新配置更大的記憶體並搬移舊資料，但因容量是倍增成長，均攤下來仍是 O(1)
v.pop_back();      // O(1)：只需縮小邏輯長度，不必搬移任何元素
for (int x : v) {  // 範圍 for 逐一取出元素，此處用值拷貝只讀不改；大型物件建議改用 const auto&
    cout << x;
}`
          },
          {
            title: 'stack（棧）',
            summary: 'LIFO 介面封裝，底層預設用 deque。只有 push/pop/top/empty/size。',
            code: `// stack（棧）: STL 的介面配接器，只暴露 push/pop/top/empty/size，刻意不給隨機存取以強制 LIFO 語意。
stack<int> st; st.push(1); st.pop();  // push 進、pop 出都只作用在棧頂`
          },
          {
            title: 'queue（隊列）',
            summary: 'FIFO 介面，push 進尾、pop 出頭、front 讀頭。BFS 標配。',
            code: `// queue（隊列）: 強制 FIFO 語意的介面配接器，push 進尾端、pop 移除頭端。
queue<int> q; q.push(1); q.front(); q.pop();  // front() 讀頭部的值，pop() 才真正移除它`
          },
          {
            title: 'list（雙向鏈表）',
            summary: '雙向鏈表，任意位置 O(1) 增刪但不支援隨機存取。需要迭代器穩定或頻繁中間增刪時用。',
            code: `// list（雙向鏈表）: 任意位置插入/刪除都是 O(1)（前提是已握有指向該處的迭代器），代價是沒有 operator[]。
list<int> lst; lst.push_front(1); lst.push_back(2);  // 頭尾都能 O(1) 插入，中間插入需先取得迭代器`
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
      'lc-1214',
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
        summary:
          '樹是無環連通圖，n 個節點 n-1 條邊。它是遞迴結構的典型，許多問題都能「在子樹上遞迴、回到父節點合併」。',
        children: [
          {
            title: '樹的存儲',
            summary:
              '一般樹用「孩子表示法」：每個節點存一個子節點清單（vector）。有根樹另存父節點便於向上跳。',
            code: `// 樹的存儲: 每個節點保留自己的孩子清單。
vector<vector<int>> child(n + 1);   // 開 n+1 是因為節點編號習慣從 1 開始，留出下標 0 不使用
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
            code: `// 二叉樹的存儲結構: 指標版適合遞迴，陣列版適合節點池。
struct Node {
    int val{};
    Node* left = nullptr;
    Node* right = nullptr;
};
vector<int> lc(kMaxN), rc(kMaxN), val(kMaxN); // 用下標取代指標：lc[i]/rc[i] 存左右孩子的下標，0 代表空，省去動態配置`
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
            code: `// 先序遍歷: 根 -> 左 -> 右，「先處理自己再遞迴子樹」，複製整棵樹時父節點會比子節點先建立。
void pre(Node* r) {
    if (!r) {
        return;         // 空節點是遞迴終止條件，避免對 nullptr 解參
    }
    visit(r);           // 先訪問根，這一行的位置就是「先序」的定義
    pre(r->left);
    pre(r->right);
}`,
            complexity: 'O(n)'
          },
          {
            title: '中序遍歷',
            summary: '左 → 根 → 右。對二叉搜索樹而言，中序輸出恰為遞增序列，可用來驗證 BST 合法性。',
            code: `// 中序遍歷: 左 -> 根 -> 右。對二叉搜索樹而言，這個順序恰好輸出遞增序列。
void in(Node* r) {
    if (!r) {
        return;
    }
    in(r->left);        // 先把左子樹（較小的值）處理完
    visit(r);            // 訪問夾在左右之間，這正是「中序」的由來
    in(r->right);
}`,
            complexity: 'O(n)'
          },
          {
            title: '後序遍歷',
            summary: '左 → 右 → 根。先處理完子樹再處理根，適合「釋放樹」「自底向上計算子樹資訊」。',
            code: `// 後序遍歷: 左 -> 右 -> 根，子樹一定比父節點先處理完，適合「先算完子樹資訊再彙總」或「先刪子節點再刪自己」。
void post(Node* r) {
    if (!r) {
        return;
    }
    post(r->left);
    post(r->right);
    visit(r);           // 最後才訪問根，此時左右子樹的結果都已就緒，可以安全地合併
}`,
            complexity: 'O(n)'
          },
          {
            title: '層次遍歷',
            summary: '逐層由左到右，用佇列做 BFS：出隊一個就把它的左右孩子入隊。',
            code: `// 層次遍歷: 用佇列的 FIFO 特性保證「先進隊的節點先被處理」，天然對應「由上而下、由左到右」。
queue<Node*> q; q.push(root);
while (!q.empty()) {
    Node* u = q.front(); q.pop();   // 取出目前最早入隊、也就是層數最淺的節點
    visit(u);
    if (u->left) {                  // 把下一層的節點依序推入隊尾，維持層序
        q.push(u->left);
    }
    if (u->right) {
        q.push(u->right);
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
        code: `// 哈夫曼樹: 用小根堆代替「每次線性掃描找最小兩個值」，把單步取最小值降到 O(log n)。
priority_queue<long long, vector<long long>, greater<>> pq;   // greater<> 讓堆頂是最小值（小根堆）
for (auto w : weights) {
    pq.push(w);
}
long long cost = 0;
while (pq.size() > 1) {           // 只剩一個節點時代表樹已合併完成
    long long a = pq.top(); pq.pop();   // 貪心：每次都合併「目前最小的兩個」權值
    long long b = pq.top(); pq.pop();
    cost += a + b; pq.push(a + b);      // 合併後的權值要放回堆中，繼續參與後續合併
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
            code: `// 查找: 利用 BST「左小右大」的性質每步排除一半子樹，改寫成迴圈可省去遞迴呼叫的開銷。
Node* find(Node* r, int x) {
    while (r && r->val != x) {          // 走到空節點（沒找到）或值相等（找到了）才停止
        r = x < r->val ? r->left : r->right;  // 比根小往左找、比根大往右找
    }
    return r;   // 回傳命中的節點，或 nullptr 代表不存在
}`,
            complexity: '平均 O(log n)，最壞 O(n)'
          },
          {
            title: '插入',
            summary: '按查找路徑走到空位置，掛上新節點。',
            code: `// 插入: 沿著「查找失敗的路徑」走到底，該處原本是空指標，換成新節點即可。
Node* insert(Node* r, int x) {
    if (!r) {
        return new Node{x, nullptr, nullptr};  // 走到空位置：這裡就是新節點該掛的地方
    }
    if (x < r->val) {
        r->left = insert(r->left, x);   // 把遞迴回傳的（可能是新建的）子樹接回父節點
    } else {
        r->right = insert(r->right, x);
    }
    return r;  // 回傳自己，讓上一層的父節點能重新接上這棵（可能已改變的）子樹
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
            code: `// 刪除: 三種情況分開處理——最多一個孩子的直接接上去頂替，兩個孩子的則「借用」中序後繼的值再刪掉它。
Node* del(Node* r, int x) {
    if (!r) {
        return r;                       // 沒找到要刪的值，直接回傳空
    }
    if (x < r->val) {
        r->left = del(r->left, x);      // 目標在左子樹，遞迴處理後把結果接回來
    } else if (x > r->val) {
        r->right = del(r->right, x);
    } else {                            // 找到目標節點 r，開始真正刪除
        if (!r->left) {
            return r->right;            // 只有右孩子（或沒孩子）：直接讓右孩子頂替 r 的位置
        }
        if (!r->right) {
            return r->left;             // 只有左孩子：讓左孩子頂替
        }
        Node* s = r->right;
        while (s->left) {  // inorder successor
            s = s->left;                 // 兩個孩子都在：一路往左找到右子樹的最小值（中序後繼）
        }
        r->val = s->val;                // 用後繼的值覆蓋當前節點，問題轉成「刪除右子樹裡的 s」
        r->right = del(r->right, s->val);
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
        summary:
          '圖的第一件事是「怎麼存」。選型看稠密度：稀疏圖用鄰接表 O(n+m)，稠密圖或需 O(1) 查邊用鄰接矩陣。',
        children: [
          {
            title: '鄰接矩陣',
            summary:
              'g[u][v] 記錄 u→v 的邊或權。查任一邊 O(1)，但空間 O(n^2)，n 上千就 MLE。適合稠密圖與 Floyd。',
            code: `// 鄰接矩陣: vector 依節點數配置，初值代表沒有邊。
vector<vector<int>> g(n + 1, vector<int>(n + 1, kInf));   // 初值設成 kInf（一個夠大的數），代表 u、v 之間預設「不連通」
g[u][v] = w;   // 查詢任兩點是否有邊、邊權多少都是 O(1)，代價是 O(n^2) 空間`,
            complexity: '空間 O(n^2)'
          },
          {
            title: '邊集數組',
            summary:
              '直接存所有邊 (u, v, w)。本身不利於查鄰居，但 Kruskal、Bellman-Ford 這類「遍歷所有邊」的算法很合用。',
            code: `// 邊集數組: Kruskal/Bellman-Ford 會直接掃所有邊。
struct Edge { int u, v, w; };
vector<Edge> edges;   // 只存邊本身、不記錄「某點的所有鄰居」，正適合這兩種對全體邊逐一排序/鬆弛的算法`
          },
          {
            title: '鄰接表',
            summary: '每個點存一串出邊，空間 O(n+m)，遍歷鄰居高效。競程最泛用，直接用 vector 最直觀。',
            code: `// 鄰接表: 稀疏圖首選，空間 O(n+m)。
vector<vector<pair<int, int>>> g(n + 1);  // {neighbor, weight}
g[u].push_back({v, w});
g[v].push_back({u, w});      // 無向圖的「一條邊」要在兩端都加一次，忘記這行是最常見的圖論 bug`,
            complexity: '空間 O(n+m)'
          },
          {
            title: '鏈式前向星',
            summary:
              '用陣列模擬鄰接表：head[u] 指向 u 的第一條邊，每條邊存 to 與 next。常數比 vector 小、無動態配置，卡常時使用。',
            code: `// 鏈式前向星: 用陣列模擬鄰接表，靠 head/next 兩個陣列串起每個點的出邊，避免 vector 動態配置的額外開銷。
vector<int> head(n + 1, -1), to(kMaxM), nxt(kMaxM);   // head[u] == -1 代表 u 目前沒有任何出邊
int edge_count = 0;
void add_edge(int u, int v) {
    to[edge_count] = v;          // 這條邊指向 v
    nxt[edge_count] = head[u];   // 把新邊接到 u 原本的邊串前面（頭插法，O(1)）
    head[u] = edge_count++;      // u 的第一條邊現在變成這條新邊
}
// 用顯式的 e != -1 取代常見的 ~e 位元技巧（~e 在 e == -1 時等於 0/false），可讀性更好、意圖更明確
for (int e = head[u]; e != -1; e = nxt[e]) {
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
            code: `// 廣度優先遍歷: 入隊時標記距離，避免同一點重複入隊。
queue<int> q;
q.push(s);
dist[s] = 0;              // dist 初始值全設 -1（未訪問），起點到自己的距離是 0
while (!q.empty()) {
    int u = q.front();
    q.pop();
    for (auto [v, w] : g[u]) {
        if (dist[v] == -1) {          // 還沒訪問過：因為 BFS 逐層擴展，第一次到達 v 的路徑必然是最短的
            dist[v] = dist[u] + 1;    // 在「入隊當下」就標記距離，避免同一個點被多條路徑重複塞進隊列
            q.push(v);
        }
    }
}`,
            complexity: 'O(n+m)'
          },
          {
            title: '深度優先遍歷',
            summary: '沿一條路走到底再回溯，天然遞迴。用於連通塊計數、拓撲、找環、樹形 DP 的骨架。',
            code: `// 深度優先遍歷: 一路往下走到底才回溯，天然對應遞迴呼叫堆疊，寫法比 BFS 更精簡。
void dfs(int u) {
    visited[u] = true;              // 一進入函式就先標記，避免同一點被重複遞迴造成無窮迴圈
    for (auto [v, w] : g[u]) {
        if (!visited[v]) {
            dfs(v);                 // 遞迴深入未訪問的鄰居，這條路徑會先走到底才回頭嘗試下一個鄰居
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
      'lc-912',
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
            code: `// 貪心算法秘籍: 區間排程問題按「結束時間」排序，每次選能接上的區間——越早結束，留給後面的空間越多。
// interval scheduling: sort by end time and greedily pick compatible intervals
ranges::sort(a, {}, &Interval::end);   // 關鍵字選「結束時間」而非開始時間，這是貪心正確性的核心
int cnt = 0, last = -kInf;             // last 記錄目前已選區間中最晚的結束時間
for (const auto& it : a) {
    if (it.start >= last) {   // 與已選區間不重疊，才能選它
        ++cnt; last = it.end; // 選了之後，「已佔用到」的時間點更新為這個區間的結束時間
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
            code: `// 合併排序: 對半遞迴排序左右兩段後，再線性合併兩個「已排序」的段，保證整體有序。
void merge_sort(int l, int r) {
    if (l >= r) {
        return;                          // 區間長度 <= 1，本身已經有序，無需再拆
    }
    int m = l + (r - l) / 2;             // 這種寫法取中點，避免 l+r 兩個大數相加時溢位
    merge_sort(l, m);
    merge_sort(m + 1, r);
    int i = l, j = m + 1, k = 0;         // i, j 分別是左、右兩段目前比較到的位置
    while (i <= m && j <= r) {
        tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];   // 兩段都還有剩，取較小者放進暫存陣列（<= 保證穩定排序）
    }
    while (i <= m) {                     // 左段還有剩（右段已先取完），依序搬完
        tmp[k++] = a[i++];
    }
    while (j <= r) {                     // 右段還有剩，依序搬完
        tmp[k++] = a[j++];
    }
    for (int t = 0; t < k; ++t) {        // 把排序好的暫存結果寫回原陣列對應區間
        a[l + t] = tmp[t];
    }
}`,
            complexity: 'O(n log n)'
          },
          {
            title: '快速排序',
            summary:
              '選 pivot，將小於的丟左、大於的丟右，遞迴兩側。平均 O(n log n)，但對有序輸入不隨機化會退化 O(n^2)。其 partition 可延伸出 O(n) 平均的 QuickSelect 求第 k 小。',
            code: `// 快速排序: 隨機選 pivot 避免對「已排序輸入」退化成 O(n^2)，這是比賽提交前務必檢查的細節。
void quick_sort(int l, int r) {
    if (l >= r) {
        return;
    }
    static mt19937 rng(random_device{}());       // static：整個排序過程只建立一次亂數引擎，避免重複初始化的開銷
    uniform_int_distribution<int> pick(l, r);
    int i = l, j = r, p = a[pick(rng)];           // p 是隨機挑出的基準值（pivot），不直接用 a[l] 是為了防止被刻意構造的資料卡效能
    while (i <= j) {
        while (a[i] < p) {                        // 從左找到第一個「不小於 p」的元素
            ++i;
        }
        while (a[j] > p) {                        // 從右找到第一個「不大於 p」的元素
            --j;
        }
        if (i <= j) {
            swap(a[i++], a[j--]);                 // 交換後兩邊都朝中間前進一步，確保迴圈一定會終止
        }
    }
    quick_sort(l, j);   // 此時 [l, j] 內元素都 <= p，[i, r] 內元素都 >= p
    quick_sort(i, r);
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
            code: `// 前綴和與二維前綴和: 把「重複查詢區間和」的成本從每次 O(n) 攤成預處理一次 O(n)、之後每次查詢 O(1)。
// 1D prefix sum
for (int i = 1; i <= n; ++i) {
    s[i] = s[i - 1] + a[i];   // s[i] 累積 a[1..i] 的總和，下標從 1 開始讓 s[0]=0 能自然代表「空區間」
}
int sum = s[r] - s[l - 1];   // 扣掉 [1, l-1] 的部分，剩下的就是 [l, r] 的和
// 2D submatrix sum
// 容斥原理：整個大矩形扣掉上方與左方多算的部分，再把左上角被重複扣掉的補回來
int submatrix_sum = p[x2][y2] - p[x1 - 1][y2] - p[x2][y1 - 1] + p[x1 - 1][y1 - 1];`,
            complexity: '預處理 O(n)，查詢 O(1)'
          },
          {
            title: '差分與二維差分',
            summary:
              '前綴和的逆運算：對區間 [l,r] 同加 v，只需 d[l]+=v、d[r+1]−=v，最後求前綴和還原。把「多次區間加、最後查值」變 O(n)。',
            code: `// 差分與二維差分: 前綴和的逆運算——把「整個區間加值」壓成兩個端點的 O(1) 更新，最後一次性還原。
d[l] += v; d[r + 1] -= v;   // 在 l 處 +v 代表「從這裡開始都多 v」，在 r+1 處 -v 代表「從這裡開始抵消掉」，恰好只影響 [l, r]
for (int i = 1; i <= n; ++i) {  // 對差分陣列取前綴和，就會把每個位置「累積加了多少次」還原出來
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
            code: `// 雙指針算法 (同向與對向): 兩指標從陣列兩端向中間逼近，靠陣列已排序的單調性決定該移動哪一根。
// two-sum on a sorted array
int i = 0, j = n - 1;
while (i < j) {
    int s = a[i] + a[j];
    if (s == target) {
        break;
    }
    s < target ? ++i : --j;   // 和太小就需要更大的數，右移左指標；和太大就需要更小的數，左移右指標
}`,
            complexity: 'O(n)'
          },
          {
            title: '滑動窗口基礎',
            summary:
              '右指標擴張納入新元素、左指標在條件被破壞時收縮，維持一個合法區間。適用「最長/最短滿足某條件的連續子段」。',
            code: `// 滑動窗口基礎: 右指標只進不退地擴張視窗，左指標只在條件被破壞時才收縮，兩者合計最多各移動 n 次，故整體 O(n)。
int l = 0; long long sum = 0, best = 0;
for (int r = 0; r < n; ++r) {
    sum += a[r];                  // 把新元素納入視窗
    while (sum > limit) {  // shrink window until it satisfies the constraint
        sum -= a[l++];
    }
    best = max(best, static_cast<long long>(r - l + 1));  // 此時 [l, r] 一定合法，更新最長長度
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
            code: `// 常用位運算操作與奇偶判斷: 位運算直接對硬體暫存器操作，比除法/取模快很多，常數幾乎可忽略。
bool odd = x & 1;                // 只看最低位：奇數的最低位是 1、偶數是 0，比 x % 2 少一次除法
int kth = (x >> k) & 1;   // k-th bit：先把第 k 位移到最低位，再用 &1 取出它
x |= (1 << k);            // set the k-th bit to 1：用「或」把第 k 位強制設成 1，其餘位元因為 | 0 而不受影響
x &= ~(1 << k);           // clear the k-th bit to 0：~(1<<k) 是「除了第 k 位都是 1」的遮罩，& 上它會清成 0、其餘保留
x ^= (1 << k);            // flip the k-th bit：異或 1 會翻轉該位，異或 0 不變，故只翻轉第 k 位`
          },
          {
            title: 'x & (x-1) 的巧妙應用',
            summary:
              'x−1 會把最低位的 1 變 0、其後的 0 變 1，故 x&(x−1) 恰好抹掉最低位的 1。反覆執行可 O(popcount) 數「1 的個數」；判 2 的冪則是 x>0 且 x&(x−1)==0。',
            code: `// x & (x-1) 的巧妙應用: C++20 <bit> 有現成工具。
int ones = popcount(static_cast<unsigned>(x));
bool is_power_of_two = x > 0 && has_single_bit(static_cast<unsigned>(x));`,
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
            code: `// 質數判定與分解: 若 n 有大於 √n 的因子，必然還有一個小於 √n 的因子與它配對，故只需試除到 √n。
bool is_prime(long long n) {
    if (n < 2) {
        return false;               // 0、1 及負數依定義都不是質數
    }
    for (long long i = 2; i <= n / i; ++i) {  // 寫成 i <= n/i 而非 i*i <= n，避免 i*i 在 i 很大時溢位
        if (n % i == 0) {
            return false;           // 找到一個因子，n 一定是合數
        }
    }
    return true;                    // 試到 √n 都沒有因子，n 是質數
}`,
            complexity: 'O(√n)'
          },
          {
            title: '埃氏篩與歐拉線性篩',
            summary:
              '埃氏篩：從每個質數起把其倍數標記為合數，O(n log log n)。歐拉篩讓每個合數只被其「最小質因子」篩一次，達到嚴格 O(n)。',
            code: `// 埃氏篩與歐拉線性篩: 讓每個合數只被它「最小的質因子」篩掉一次，避免埃氏篩中一個合數被多個質數重複標記。
// Euler linear sieve
vector<int> primes;
vector<bool> comp(kMaxN);
for (int i = 2; i < kMaxN; ++i) {
    if (!comp[i]) {              // 沒被任何更小的數篩掉過，代表 i 本身是質數
        primes.push_back(i);
    }
    for (int p : primes) {                              // 用目前已知的質數（由小到大）去篩 i 的倍數
        if (static_cast<long long>(i) * p >= kMaxN) {    // 用 long long 相乘再比較，避免 int 乘法先溢位
            break;
        }
        comp[i * p] = true;      // i*p 的最小質因子一定是 p（p 是遍歷到的第一個能整除 i 的質數）
        if (i % p == 0) {  // break when the smallest prime factor divides i
            break;                // 一旦成立就必須停止，否則後面更大的質數會讓同一個合數被重複標記，失去線性保證
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
            summary: '基於 gcd(a,b)=gcd(b, a mod b)，輾轉取餘直到 0。lcm(a,b)=a/gcd*b（先除再乘防溢位）。',
            code: `// 歐幾里得算法 (輾轉相除法): 基於 gcd(a,b) = gcd(b, a mod b)，輾轉取餘直到餘數為 0 即得解。
long long gcd(long long a, long long b) {
    return std::gcd(a, b);    // C++17 <numeric> 已內建，不必自己手寫遞迴版本
}
long long lcm(long long a, long long b) {
    return a / gcd(a, b) * b;  // 先除後乘：若寫成 a * b / gcd(a, b)，a*b 可能先溢位
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
            code: `// 整數快速冪算法: 把指數 b 拆成二進位，a^b = a^(2^0) * a^(2^1) * ...，只在對應位是 1 時才乘進答案，共 log(b) 步。
long long mod_pow(long long a, long long b, long long mod) {
    long long r = 1;
    a %= mod;               // 先取模避免 a 本身過大
    while (b) {
        if (b & 1) {         // 檢查目前最低位是不是 1
            r = r * a % mod; // 是的話把當前的 a（也就是 a^(2^k)）乘進答案
        }
        a = a * a % mod;     // a 每輪平方一次，對應 a^(2^0) -> a^(2^1) -> a^(2^2) -> ...
        b >>= 1;             // 處理完最低位，移到下一位
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
            summary: '把輸入字串逆序存進 int 陣列，s 的最後一個字元（個位）放到 a[0]，方便對齊與進位。',
            code: `// 接收和存儲數據: reverse iterator 直接由低位到高位掃描。
vector<int> to_num(const string& s) {
    vector<int> a;
    a.reserve(s.size());   // 先預留容量，避免逐次 push_back 時反覆重新配置記憶體
    for (char ch : views::reverse(s)) {   // 字串是「高位在前」寫的，反著掃就是從個位開始
        a.push_back(ch - '0');  // lowest digit first：這樣 a[0] 就是個位，之後逐位相加時進位自然往陣列後面（高位）傳播
    }
    return a;
}`
          },
          {
            title: '處理進制',
            summary: '低位對齊逐位相加，carry = 和 /10 進位、和 %10 留下；任一位或進位還在就繼續。',
            code: `// 處理進制: 以 const reference 避免複製兩個大數。
vector<int> add(const vector<int>& a, const vector<int>& b) {
    vector<int> c;
    int carry = 0;
    // 只要 a、b 任一還有位數，或還有進位沒處理完，就要繼續往高位跑（例如 999+1 最後會多出一位）
    for (size_t i = 0; i < a.size() || i < b.size() || carry; ++i) {
        if (i < a.size()) {
            carry += a[i];
        }
        if (i < b.size()) {
            carry += b[i];
        }
        c.push_back(carry % 10);   // 這一位真正的數字：本位相加結果的個位
        carry /= 10;                // 剩下的十位（0 或 1）留給下一輪當作進位
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
            code: `// 比較大小: 先比位數，再從最高位往回比。
bool geq(const vector<int>& a, const vector<int>& b) {
    if (a.size() != b.size()) {
        return a.size() > b.size();   // 位數（去除前導零後）較多的數一定較大，不用逐位比
    }
    for (int i = static_cast<int>(a.size()) - 1; i >= 0; --i) {   // 陣列是低位在前，所以從最後一個下標（最高位）開始比
        if (a[i] != b[i]) {
            return a[i] > b[i];       // 找到第一個不同的位，這一位較大者代表整個數較大
        }
    }
    return true;   // 每一位都相同，兩數相等，視為 a >= b 成立
}`
          },
          {
            title: '接收和存儲數據',
            summary: '同加法：逆序存放個位在前，方便從低位開始借位。'
          },
          {
            title: '處理借位',
            summary: '逐位相減，不夠減就向高位借 10；算完去掉多餘前導零（但保留單個 0）。',
            code: `// 處理借位: 要先保證 a >= b，最後移除多餘前導零。
vector<int> sub(const vector<int>& a, const vector<int>& b) {
    vector<int> c;
    int borrow = 0;
    for (size_t i = 0; i < a.size(); ++i) {   // 只需跑到 a 的長度，因為呼叫前已保證 a >= b（b 不會比 a 長）
        int t = a[i] - borrow - (i < b.size() ? b[i] : 0);   // 扣掉上一輪借的位，再扣掉 b 的對應位（超出 b 長度視為 0）
        borrow = t < 0;                // 不夠減，標記這一位要向高位借 1
        c.push_back((t + 10) % 10);    // t 為負時 +10 修正回 0-9 的範圍，非負時 +10 再 %10 等於原值不變
    }
    while (c.size() > 1 && c.back() == 0) {   // 陣列高位在後，尾端的 0 就是多餘的前導零
        c.pop_back();                          // 保留至少一位，避免把「0」這個數削成空陣列
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
            code: `// 處理進制: carry 可能很大，用 long long 保存中間值。
vector<int> mul(const vector<int>& a, int b) {
    vector<int> c;
    long long carry = 0;   // 單位乘上整個 b 可能遠超過 9，用 long long 避免中間值溢位
    for (size_t i = 0; i < a.size() || carry; ++i) {   // carry 還沒清完也要繼續，讓進位一路傳到最高位
        if (i < a.size()) {
            carry += static_cast<long long>(a[i]) * b;   // 這一位乘上 b，加上前面傳來的進位
        }
        c.push_back(carry % 10); carry /= 10;   // 留下個位當這一位的結果，其餘往下一輪進位
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
            code: `// 按位相除: a 以高位在前存放，餘數一路往低位傳。
vector<int> div(const vector<int>& a, int b, int& rem) {
    vector<int> c;
    rem = 0;   // 目前累積、還沒除盡的餘數
    for (int digit : a) {                 // 從最高位開始，模擬手算長除法
        int cur = rem * 10 + digit;       // 把上一位的餘數乘 10 後併入這一位的數字，湊出這一步真正要除的數
        c.push_back(cur / b);             // 這一位的商
        rem = cur % b;                    // 剩下的餘數繼續往下一位（更低位）傳
    }
    size_t k = 0;
    while (k + 1 < c.size() && c[k] == 0) {   // 這裡陣列是高位在前，所以前導零出現在開頭
        ++k;
    }
    return vector<int>(c.begin() + k, c.end());   // 跳過前導零，但至少保留一位（k+1 < size 的條件確保不會刪光）
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
        summary:
          '在「單調性」上折半縮小範圍，每次砍一半，O(log n)。最易錯的是邊界與更新方式，選定一種寫法並固定。',
        children: [
          {
            title: '二分查找',
            summary:
              '在有序陣列找目標或其邊界。用左閉右開或閉區間都行，重點是 mid 取法與 lo/hi 更新要配套，避免 mid==lo 不前進而死循環。',
            code: `// 二分查找: span 讓函式同時接受 vector/array 的連續區間。
int lower(span<const int> a, int x) {   // first position with value >= x
    int lo = 0, hi = static_cast<int>(a.size());   // 用左閉右開區間 [lo, hi)，hi 從「陣列長度」開始代表「還沒找到就是插在最後」
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;   // 這種寫法取中點，避免 lo+hi 溢位
        if (a[mid] < x) {
            lo = mid + 1;   // a[mid] 太小，答案一定在 mid 右邊，且 mid 本身可以排除
        } else {
            hi = mid;       // a[mid] >= x，答案可能是 mid，故收縮到 [lo, mid)，不排除 mid
        }
    }
    return lo;   // 迴圈結束時 lo == hi，就是第一個 >= x 的位置
}`,
            complexity: 'O(log n)'
          },
          {
            title: '二分答案',
            summary:
              '當「答案越大越容易/越難滿足」具單調性時，二分答案值、用 check() 驗證，把最優化問題轉成判定問題。check 常是「複製後改幾行」。',
            code: `// 二分答案: 把「求最優值」轉成「判斷某個值是否可行」，只要可行性對答案單調，就能二分找邊界。
int lo = 0, hi = kMax;         // [lo, hi] 是答案可能落在的範圍
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;  // 這種寫法取中點，防止 lo+hi 溢位
    if (check(mid)) {
        hi = mid;               // mid 可行，答案可能就是 mid 或更小，因為不能排除 mid 本身，所以是 hi = mid（而非 mid - 1）
    } else {
        lo = mid + 1;            // mid 不可行，答案一定比 mid 大
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
            code: `// 回溯法模板: 「選擇 -> 遞迴 -> 撤銷」三段式，撤銷是關鍵，否則狀態會污染同一層的下一個分支。
void dfs(int step) {
    if (step == n) {        // 已經做完 n 個決策，一組完整的解產生了
        record();
        return;
    }
    for (int c : choices) {
        make_choice(c);       // 嘗試一種選擇，把它加進目前的部分解
        dfs(step + 1);        // 遞迴決定下一步，這條分支結束後會自動回到這裡
        undo_choice(c);          // backtrack: undo the choice so the next branch starts clean
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
        summary:
          'DP 的本質是「重疊子問題 + 最優子結構」。把大問題拆成有序可解的子問題，記錄子問題答案避免重算。',
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
            code: `// 01 背包問題: 一維滾動陣列省去物品這一維，但必須「從大到小」遍歷容量，否則同一件物品會被重複計入。
for (int i = 0; i < n; ++i) {
    for (int j = capacity; j >= w[i]; --j) {   // 逆序：此時 f[j - w[i]] 還是「尚未放入第 i 件」的舊值
        f[j] = max(f[j], f[j - w[i]] + v[i]);  // 決策：第 i 件放或不放，取較優者
    }
}`,
            complexity: 'O(nW)'
          },
          {
            title: '完全背包問題',
            summary: '每件物品可取無限次。與 01 背包唯一差別是容量「從小到大」遍歷，讓同件能被重複計入。',
            code: `// 完全背包問題: 與 01 背包唯一差異是容量「正序」遍歷，讓 f[j - w[i]] 可能已包含本輪放過的第 i 件，達到「可重複取」的效果。
for (int i = 0; i < n; ++i) {
    for (int j = w[i]; j <= capacity; ++j) {   // 正序：允許同一件物品在本輪被多次疊加
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
        code: `// 線性動態規劃: 狀態沿一維序列遞推，f[i] 只依賴 i 之前已算好的狀態，符合「無後效性」。
// O(n^2) LIS: f[i] = length of longest increasing subsequence ending at i
for (int i = 0; i < n; ++i) {
    f[i] = 1;                     // 邊界：只有自己一個元素也算長度 1 的遞增子序列
    for (int j = 0; j < i; ++j) {
        if (a[j] < a[i]) {         // a[j] 能接在 a[i] 前面組成遞增序列
            f[i] = max(f[i], f[j] + 1);  // 嘗試接在每個合法的前驅之後，取最長者
        }
    }
}
// maximum subarray sum (Kadane algorithm)
long long cur = 0, best = numeric_limits<long long>::min();
for (int i = 0; i < n; ++i) {
    // 到 i 為止的最佳子段和：要嘛延續前面的子段（cur + a[i]），要嘛從 a[i] 重新開始（放棄收益為負的前綴）
    cur = max(static_cast<long long>(a[i]), cur + a[i]);
    best = max(best, cur);         // 全域答案取所有位置中「以該位置結尾」的最佳值
}`,
        complexity: 'LIS O(n^2)（可二分優化到 O(n log n)）'
      },
      {
        title: '區間動態規劃',
        summary:
          'f[i][j] 表示區間 [i,j] 的最優解，按「區間長度由小到大」枚舉，內層枚舉分割點 k，確保計算大區間時子區間已就緒。石子合併、括號匹配、迴文皆屬此類。',
        code: `// 區間動態規劃: 按「區間長度由小到大」枚舉，確保計算 [i,j] 時，所有比它短的子區間 f 值都已經算好。
for (int len = 2; len <= n; ++len) {          // 長度 1 的區間通常在初始化時就設好邊界值，這裡從 2 開始遞推
    for (int i = 1, j = len; j <= n; ++i, ++j) {  // i, j 同步移動，維持 j - i + 1 == len
        f[i][j] = kInf;
        for (int k = i; k < j; ++k) {             // 枚舉把 [i,j] 切成 [i,k] 與 [k+1,j] 的分割點
            f[i][j] = min(f[i][j], f[i][k] + f[k + 1][j] + cost(i, j));
        }
    }
}`,
        complexity: 'O(n^3)'
      }
    ]
  }
];
