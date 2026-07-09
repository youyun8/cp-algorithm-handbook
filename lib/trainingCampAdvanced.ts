import type { TrainingCampModule } from './trainingCamp';

// 進階營：進階資料結構、字串算法、樹上操作、複雜樹、可持久化、網路流與複雜 DP 優化。
// 進階主題著重「思想與適用時機」，程式碼給關鍵骨架，完整模板建議另行對照專章。

export const advancedModules: TrainingCampModule[] = [
  {
    id: 'advanced-data-structures',
    sourceChapter: 1,
    title: '數據結構進階',
    leetcodeProblemIds: [
      'mono-002',
      'seg-005',
      'mono-004',
      'seg-004',
      'lc-1206',
      'lc-715',
      'lc-729',
      'lc-731',
      'seg-001',
      'lc-308',
      'lc-3515',
      'lc-1409',
      'lc-lcr-170'
    ],
    topics: [
      {
        title: '分塊算法',
        summary:
          '「大段維護、小段暴力」的萬用思想：把序列切成約 √n 塊，整塊打標記、散塊暴力，各種操作平衡在 O(√n)。當線段樹難以維護某種資訊時，分塊往往能硬上。',
        children: [
          {
            title: '預處理',
            summary: '決定塊大小（約 √n）、算出每個下標所屬塊、預處理每塊的彙總資訊（和、最值等）。',
            code: `// 預處理: 塊長取 sqrt(n)，再計算每個位置所屬塊。
int block_size, block_id[kMaxN], left_bound[kMaxM], right_bound[kMaxM];
void build() {
    block_size = max(1, static_cast<int>(sqrt(n)));   // 取 max(1, ...) 避免 n 很小時 sqrt(n) 捨去成 0 導致除以零
    for (int i = 1; i <= n; ++i) {
        block_id[i] = (i - 1) / block_size + 1;   // 用整數除法把下標依序分進大小相同（最後一塊可能較短）的塊
    }
    // left_bound[b], right_bound[b] store the left/right boundaries of each block
}`
          },
          {
            title: '區間更新',
            summary: '整塊覆蓋用懶標記 O(1)；兩端散塊逐點更新前，先把該塊的標記下推，避免讀到過期值。',
            complexity: 'O(√n)'
          },
          {
            title: '區間查詢',
            summary: '中間整塊讀彙總值、兩端散塊暴力累加，合併即答案。',
            complexity: 'O(√n)'
          }
        ]
      },
      {
        title: '跳躍表',
        summary:
          '用多層隨機索引加速有序鏈表，期望 O(log n) 增刪查，是平衡樹的機率化替代（Redis 有序集合即用它）。實戰少手寫，但「多層索引」思想值得理解。',
        children: [
          {
            title: '跳躍表的結構體定義',
            summary: '每個節點有隨機層數，第 k 層的 forward 指標跳過約 2^k 個元素。',
            code: `// 跳躍表的結構體定義: 每個節點的 forward 長度就是它的層數，forward[k] 指向「同一層」的下一個節點。
struct Node { int val; vector<Node*> forward; };   // forward.size() 是隨機決定的層數，越高層的指標平均跳過越多節點`
          },
          {
            title: '查找',
            summary: '從最高層開始，能往前就往前、否則下降一層，逐步逼近目標。',
            complexity: '期望 O(log n)'
          },
          {
            title: '插入',
            summary: '先查到位置，隨機決定新節點層數，在每一層接上指標。',
            complexity: '期望 O(log n)'
          },
          {
            title: '刪除',
            summary: '在每一層把待刪節點的前驅指標接到其後繼，跳過該節點。',
            complexity: '期望 O(log n)'
          }
        ]
      },
      {
        title: "莫隊算法 (Mo's Algorithm)",
        summary:
          '離線處理大量區間查詢：把查詢按「左端點所在塊、右端點」排序，用兩個指標增量地移動區間端點，總移動量 O((n+q)√n)。前提是「增刪一個元素能 O(1) 更新答案」。',
        children: [
          {
            title: '基礎莫隊',
            summary: '查詢按 (bel[l], r) 排序後，move 指標 add/del 元素維護當前答案。',
            code: `// 基礎莫隊: 按左端點所在塊排序後，右指標在同一塊內只會單調前進；奇偶塊交替反轉右端點排序方向可省去右指標的來回抖動。
sort(qs, qs + q, [](auto& a, auto& b) {
    // 左端點所在塊不同就按塊排序；塊相同則依「塊的奇偶」決定右端點升冪或降冪，這是常數優化（避免每個新塊都要讓 r 大幅跳動）
    return block_id[a.l] != block_id[b.l] ? a.l < b.l : (block_id[a.l] & 1 ? a.r < b.r : a.r > b.r);
});
int l = 1, r = 0;                 // 目前維護的區間是 (l, r]/[l, r]，視 add/del 的定義而定，這裡先從「空區間」開始
for (auto& q : qs) {
    // 四個方向的移動順序沒有強制規定，但都要先擴張（add）才收縮（del），確保視窗內元素數量與答案 cur 的定義隨時一致
    while (r < q.r) {
        add(++r);
    }
    while (l > q.l) {
        add(--l);
    }
    while (r > q.r) {
        del(r--);
    }
    while (l < q.l) {
        del(l++);
    }
    ans[q.id] = cur;   // 排序打亂了查詢的原始順序，用 q.id 記錄它原本的編號，才能把答案填回正確位置
}`,
            complexity: 'O((n+q)√n)'
          },
          {
            title: '帶修莫隊',
            summary:
              '加入「時間」維度處理帶單點修改的查詢：排序鍵變成 (左塊, 右塊, 時間)，多一個時間指標回滾/前進修改。複雜度 O(n^(5/3))。'
          },
          {
            title: '回滾莫隊',
            summary:
              '當「刪除難以 O(1) 但插入容易」（如維護區間最大值）時使用：只增不減，右指標正常擴、左指標每塊重置並用可撤銷方式處理。'
          }
        ]
      },
      {
        title: 'CDQ 分治',
        summary:
          '對「操作序列/點集」分治：先遞迴左半、右半，再計算「左半對右半的跨區間貢獻」。常把一維用分治消掉，把 k 維偏序降成 (k−1) 維問題。',
        children: [
          {
            title: '處理多維偏序問題 (三維偏序)',
            summary:
              '第一維排序、第二維在 CDQ 分治中用「左半按第二維、右半按第二維歸併」處理、第三維用樹狀陣列統計。總複雜度 O(n log^2 n)。',
            code: `// 處理多維偏序問題 (三維偏序): 第一維排序後用分治消掉，第二維在合併時用雙指標（歸併排序的技巧），第三維交給樹狀陣列統計。
// a[] is sorted by the first dimension x (deduplicated per group with counts)
// for [l, r]: recurse on both halves, then count cross-subarray contributions from left to right
void cdq(int l, int r) {
    if (l == r) {
        return;               // 只剩一個元素，沒有「跨越左右半」的貢獻需要統計
    }
    int mid = (l + r) >> 1;
    cdq(l, mid);               // 先遞迴處理左半內部的偏序關係
    cdq(mid + 1, r);           // 再遞迴處理右半內部的偏序關係
    sort(a + l, a + mid + 1, compare_y);      // 左右兩半各自按第二維 y 排序，準備用雙指標歸併
    sort(a + mid + 1, a + r + 1, compare_y);
    int i = l;
    for (int j = mid + 1; j <= r; ++j) {      // 走訪右半（按 y 遞增），用它們去查詢左半的貢獻
        while (i <= mid && a[i].y <= a[j].y) {
            // 因為第一維已保證左半 x <= 右半 x，這裡再滿足 y <= y，代表左半這個點對右半 a[j] 有貢獻，計入樹狀陣列
            bit.add(a[i].z, a[i].cnt);
            ++i;
        }
        a[j].ans += bit.query(a[j].z);        // 樹狀陣列統計「第三維 z 也滿足關係」的個數，即三維偏序的答案
    }
    for (int k = l; k < i; ++k) {
        bit.clear(a[k].z);  // undo additions to keep amortized O(n log n) overall：清空本輪加進去的紀錄，避免汙染其他遞迴分支
    }
}`,
            complexity: 'O(n log^2 n)'
          }
        ]
      }
    ]
  },
  {
    id: 'advanced-string-algorithms',
    sourceChapter: 2,
    title: '字符串算法進階',
    leetcodeProblemIds: [
      'lc0x3f-1803',
      'lc-1948',
      'lc-3045',
      'lc-3093',
      'lc-212',
      'lc-1032',
      'lc-2223',
      'str-lc-1044',
      'lc-30',
      'lc-1707',
      'lc-1392'
    ],
    topics: [
      {
        title: 'AC 自動機',
        summary:
          '多模式匹配的利器 =「Trie + KMP 失配指標」。把所有模式串建成 Trie，再建 fail 指標，即可在主串上一次線性掃描找出所有模式的出現。',
        children: [
          {
            title: '創建字典樹',
            summary: '把所有模式串插入 Trie，終點記錄該串資訊（如編號或計數）。',
            code: `// 創建字典樹: 與一般 Trie 的插入完全相同，AC 自動機是在這棵樹的基礎上再多建一層 fail 指標。
int ch[kMaxN][26], cnt[kMaxN], total_nodes;
void insert(const string& s) {
    int u = 0;
    for (char c : s) {
        int x = c - 'a';
        if (!ch[u][x]) {
            ch[u][x] = ++total_nodes;   // 這條路徑第一次出現，新開節點
        }
        u = ch[u][x];
    }
    cnt[u]++;   // 標記這裡是某個模式串的結尾，之後匹配時用來判斷「命中了哪個模式」
}`
          },
          {
            title: '創建 AC 自動機',
            summary:
              'BFS 建 fail：fail[u] 指向「u 對應字串的最長真後綴」所在節點；不存在的轉移直接指向 fail 的對應轉移（路徑壓縮），使匹配時無需回跳。',
            code: `// 創建 AC 自動機: 用 BFS 按深度由淺到深建 fail，保證計算 fail[v] 時，它父節點的 fail 已經處理完成。
queue<int> q;
for (int c = 0; c < 26; ++c) {
    if (ch[0][c]) {
        q.push(ch[0][c]);   // 深度 1 的節點 fail 一定指向根（沒有比它更短的真後綴），直接入隊當 BFS 起點
    }
}
while (!q.empty()) {
    int u = q.front();
    q.pop();
    for (int c = 0; c < 26; ++c) {
        int& v = ch[u][c];   // 用引用直接改寫 ch[u][c]，讓「補齊缺失轉移」與「往下建樹」共用同一段程式碼
        if (v) {
            fail[v] = ch[fail[u]][c];   // v 存在：它的 fail 是「u 的 fail 沿同一字元 c 轉移」到的節點
            q.push(v);
        } else {
            v = ch[fail[u]][c];   // fill missing transitions to avoid branching in queries：直接把不存在的邊「借用」fail 指向節點的對應邊，查詢時就不必再手動沿 fail 跳
        }
    }
}`,
            complexity: 'O(節點數 · 字元集)'
          },
          {
            title: '模式匹配',
            summary:
              '主串沿 Trie 轉移前進，每到一點沿 fail 鏈累加命中的模式數。統計出現次數時要沿 fail 樹累加（可 topo/BFS 逆序一次算完），否則會漏掉被包含的模式。',
            complexity: 'O(|主串| + 命中數)'
          }
        ]
      },
      {
        title: '後綴數組 (SA)',
        summary:
          '把所有後綴排序後的起點陣列 sa[]，配合 height[]（排名相鄰後綴的最長公共前綴 LCP）幾乎能解決所有子串問題。是離線子串處理的主力。',
        children: [
          {
            title: '基數排序',
            summary:
              '倍增建 SA 時，每一輪都要把後綴依 `(rk[i], rk[i + w])` 這組「雙關鍵字」重新排序。若用 `std::sort` 比較排序，每輪是 O(n log n)，總計 O(n log² n)。改用兩趟穩定計數排序（先按次關鍵字 `rk[i + w]`，再按主關鍵字 `rk[i]`），因為關鍵字值域只有 O(n)，每輪可壓到 O(n)，總體變成 O(n log n)。關鍵在於第二趟必須「穩定」——次關鍵字相同的順序要保留，所以逆序掃描已按次關鍵字排好的 `id[]`。',
            code: `// 基數排序: 用兩趟穩定計數排序取代 std::sort，把每輪倍增的排序成本從 O(n log n) 壓到 O(n)，這是標準 C++ 寫法（無任何非標準擴充），只是排序演算法本身選得比較講究。
int n, m;               // n: string length; m: current value range size (initially the alphabet size)
int sa[kMaxN], rk[kMaxN], id[kMaxN], cnt[kMaxN];

// One doubling round: given ranks for length w, compute sa[] for length 2w
void radix_sort(int w) {
    int p = 0;
    // secondary key: rk[i + w]. Positions beyond n get the smallest secondary key, prepended first
    // 越界（i + w > n）的位置視為「次關鍵字最小」，依規定要排在最前面，所以優先把它們填進 id[]
    for (int i = n; i > n - w; --i) {
        id[++p] = i;
    }
    for (int i = 1; i <= n; ++i) {
        if (sa[i] > w) {
            id[++p] = sa[i] - w;   // reuse previous sa[] to obtain the ordered secondary-key sequence
        }
    }
    // primary key: stable counting sort on id[] by rank[]
    for (int i = 0; i <= m; ++i) {
        cnt[i] = 0;   // 每輪重新清空桶計數
    }
    for (int i = 1; i <= n; ++i) {
        cnt[rk[i]]++;   // 統計每個排名值出現幾次
    }
    for (int i = 1; i <= m; ++i) {
        cnt[i] += cnt[i - 1];   // 前綴和後，cnt[i] 就是「排名 <= i」的元素應該放到的最終區段右界
    }
    for (int i = n; i >= 1; --i) {   // scan backwards to preserve stability
        // 從後往前掃描已按次關鍵字排好的 id[]，才能保證次關鍵字相同的元素彼此相對順序不變（穩定排序的關鍵）
        sa[cnt[rk[id[i]]]--] = id[i];
    }
}`,
            complexity: '每輪 O(n + m)，總計 O(n log n)'
          },
          {
            title: '後綴數組詳解',
            summary:
              '倍增法：先按長度 1 的字元排序，再用長度 2^k 的排名合出長度 2^(k+1) 的排名，log n 輪後得到全序。整體 O(n log n)。'
          },
          {
            title: '後綴數組的應用',
            summary:
              'height 用 h[i]≥h[i−1]−1 的性質 O(n) 求得。之後：不同子串個數 = n(n+1)/2 − Σheight；兩後綴 LCP = height 區間最小值（RMQ）；可求最長重複子串等。',
            code: `// 後綴數組的應用: 利用 h[i] >= h[i-1] - 1 的性質，讓 k 不必每次歸零重新比對，均攤下來整體只需 O(n)。
// linear height computation using rank[] / sa[]
for (int i = 1, k = 0; i <= n; ++i) {
    if (k) {
        --k;    // 這一步是關鍵：上一個後綴算出的公共前綴長度減一，就是這個後綴的公共前綴長度下界，不用從 0 開始比對
    }
    int j = sa[rk[i] - 1];   // 找到排名恰好在「後綴 i」前一名的後綴起點 j，height 定義在相鄰排名之間
    while (i + k <= n && j + k <= n && s[i + k] == s[j + k]) {
        ++k;                 // 從下界繼續往後暴力擴展，找出真正最長公共前綴
    }
    height[rk[i]] = k;        // 存到「排名」對應的位置，而不是原始下標 i
}`,
            complexity: '建構 O(n log n)'
          }
        ]
      },
      {
        title: '後綴自動機 (SAM)',
        summary:
          '接受一個字串所有後綴的最小 DFA，狀態數線性。線上構建，能高效處理「不同子串計數、子串出現次數、最長公共子串」等，適合在線場合。',
        children: [
          {
            title: 'SAM的狀態與轉移',
            summary:
              '每個狀態對應一組 endpos 相同的子串（一段連續長度區間）；link（後綴連結）指向較短的等價類，形成一棵 parent 樹。'
          },
          {
            title: 'SAM的構建與應用',
            summary:
              '增量加入字元，維護 last 與 clone 分裂狀態，均攤 O(|s|·字元集)。不同子串數 = Σ(len[u]−len[link[u]])；出現次數用 parent 樹上子樹和。',
            complexity: '構建 O(n·Σ)'
          }
        ]
      },
      {
        title: '回文樹 / 回文自動機 (PAM)',
        summary:
          '專門存一個字串所有「本質不同回文子串」的結構，狀態數不超過 n。可線上求回文子串個數、每個回文出現次數。',
        children: [
          {
            title: 'PAM的結構與構建算法',
            summary:
              '有兩個根（長度 −1 與 0）。逐字元加入，沿 fail 找到能左右擴展成回文的最長狀態，必要時新建節點並設 fail。均攤線性。',
            complexity: 'O(n·Σ)'
          }
        ]
      }
    ]
  },
  {
    id: 'advanced-tree-operations',
    sourceChapter: 3,
    title: '樹上操作',
    leetcodeProblemIds: [
      'lift-lc-2458',
      'lc0x3f-1617',
      'lift-lc-2846',
      'lc0x3f-2003',
      'lc-235',
      'lc-236',
      'lc-2277',
      'treedp-lc-834',
      'lc-3515-2',
      'lc-1123',
      'lc-1483'
    ],
    topics: [
      {
        title: '樹鏈剖分',
        summary:
          '把樹拆成若干「重鏈」並映射到連續的 dfs 序，於是「路徑」與「子樹」都變成線段樹上的區間操作。任意路徑至多經過 O(log n) 條重鏈。',
        children: [
          {
            title: '預處理',
            summary:
              '兩次 DFS：第一次求子樹大小、深度、父、重兒子（子樹最大者）；第二次按「優先走重兒子」給每點連續的 dfs 序與所在鏈頂 top。',
            code: `// 預處理: 第一次 DFS 找出每個點子樹最大的孩子（重兒子），第二次 DFS 讓「重鏈」共用同一個 top 並取得連續的 dfs 序。
int sz[kMaxN], depth[kMaxN], parent[kMaxN], heavy_child[kMaxN], top[kMaxN], discovery_time[kMaxN], timer;
void dfs1(int u, int f) {
    sz[u] = 1;                     // 自己算一個節點
    for (int v : g[u]) {
        if (v != f) {               // 避免往回走到父節點
            parent[v] = f;
            depth[v] = depth[u] + 1;
            dfs1(v, u);
            sz[u] += sz[v];         // 回溯時把子樹大小累加回父節點
            if (sz[v] > sz[heavy_child[u]]) {
                heavy_child[u] = v;   // 子樹最大的孩子稱為「重兒子」，重鏈剖分保證從任一點到根，重鏈數不超過 O(log n) 條
            }
        }
    }
}
void dfs2(int u, int t) {
    top[u] = t;                     // t 是 u 所在重鏈最頂端的節點，同一條重鏈上所有點的 top 都相同
    discovery_time[u] = ++timer;    // 分配連續遞增的 dfs 序，供線段樹按區間操作使用
    if (heavy_child[u]) {
        dfs2(heavy_child[u], t);    // 優先走重兒子，讓整條重鏈在 dfs 序上是連續的一段
    }
    for (int v : g[u]) {
        if (v != parent[u] && v != heavy_child[u]) {
            dfs2(v, v);              // 輕兒子各自另開一條新的重鏈，自己就是鏈頂
        }
    }
}`
          },
          {
            title: '求解最近公共祖先',
            summary: '兩點不斷把「鏈頂較深」的一方跳到其鏈頂的父節點，直到同鏈，較淺者即 LCA。O(log n)。',
            code: `// 求解最近公共祖先: 兩點不同鏈時，把「鏈頂較深」的一方跳到其鏈頂的父節點，一次至少跳過一整條重鏈，故只需 O(log n) 次跳躍。
int lca(int u, int v) {
    while (top[u] != top[v]) {         // 不在同一條重鏈上，就繼續往上跳
        if (depth[top[u]] < depth[top[v]]) {
            swap(u, v);                  // 保證每次都跳「鏈頂較深」的那一方，才不會跳過頭錯過真正的 LCA
        }
        u = parent[top[u]];             // 跳到鏈頂的父節點，等於一次跨過整條重鏈
    }
    return depth[u] < depth[v] ? u : v;   // 同一條鏈上，深度較淺的那個就是 LCA
}`,
            complexity: 'O(log n)'
          },
          {
            title: '樹鏈剖分與線段樹',
            summary:
              '路徑操作沿重鏈逐段轉成 [dfn[top], dfn[u]] 的區間，交給線段樹；子樹操作是單一區間 [dfn[u], dfn[u]+sz[u]−1]。單次 O(log^2 n)。',
            complexity: '路徑操作 O(log^2 n)'
          }
        ]
      },
      {
        title: '點分治',
        summary:
          '統計樹上「所有路徑」的分治法：每層取重心為分治中心，計算經過它的路徑，再刪除重心遞迴各子樹。以重心保證只有 O(log n) 層。',
        children: [
          {
            title: '樹的重心',
            summary: '刪去後最大子樹最小的點。以它為根，每棵子樹大小 ≤ n/2，保證分治層數 O(log n)。',
            code: `// 樹的重心: 對每個候選點，比較「刪去它之後，最大那塊子樹有多大」，取這個值最小的點就是重心。
void find_centroid(int u, int parent, int total_nodes, int& c, int& best) {
    int mx = 0, s = 1;    // mx: 目前看過最大的子樹大小；s: 以 u 為根的子樹目前累積大小（含自己）
    for (int v : g[u]) {
        if (v != parent && !del[v]) {   // del 標記點分治中已經處理過、要當作不存在的節點
            find_centroid(v, u, total_nodes, c, best);
            s += sz[v];
            mx = max(mx, sz[v]);         // 每個子節點的子樹都是刪去 u 後的一塊
        }
    }
    sz[u] = s;
    mx = max(mx, total_nodes - s);   // 別忘了「u 上方」也是一塊（整體減去 u 子樹），這塊常被新手漏算
    if (mx < best) {                  // 最大子塊越小，代表刪去這個點後越「均衡」，是更好的分治中心候選
        best = mx;
        c = u;
    }
}`
          },
          {
            title: '重心分解',
            summary:
              '對當前連通塊找重心 c，統計「經過 c」的合法路徑（先算整塊，再對每棵子樹容斥減去同子樹內的重複貢獻），標記刪除 c 後遞迴每棵子樹。',
            complexity: 'O(n log n) 級'
          }
        ]
      },
      {
        title: '邊分治',
        summary:
          '以「中心邊」而非中心點分治。需先把樹重建成二叉（多叉點拆成虛點），保證能找到把樹分得夠均勻的邊。出題較少，但對某些帶邊權路徑統計更順手。',
        children: [
          {
            title: '重建樹',
            summary: '把度數大的節點用虛節點（邊權 0）拆成鏈，使每個原節點度數 ≤ 3，才能保證存在好的中心邊。'
          },
          {
            title: '求解中心邊',
            summary: '選一條邊，使刪去後兩側點數盡量均衡（較大側最小），保證分治層數 O(log n)。'
          },
          {
            title: '中心邊分解',
            summary: '沿中心邊把樹一分為二，統計跨該邊的路徑貢獻，再遞迴兩側。'
          }
        ]
      }
    ]
  },
  {
    id: 'advanced-complex-trees',
    sourceChapter: 4,
    title: '複雜樹',
    leetcodeProblemIds: [
      'seg-lc-2286',
      'heap-lc-1675',
      'lc-2250',
      'dsu-lc-1697',
      'lc-973',
      'lc0x3f-373',
      'lc-703',
      'lc-715',
      'lc-731',
      'lc-3515',
      'lc-1206'
    ],
    topics: [
      {
        title: 'KD 樹',
        summary:
          '把 k 維點集按維度輪流切分建成的二叉樹，支援多維最近鄰、範圍查詢。查詢靠「估價剪枝」跳過不可能更優的子樹，否則會退化 O(n)。',
        children: [
          {
            title: '創建 KD 樹',
            summary: '每層按一個維度（輪流或方差最大者）取中位數切分，左右遞迴建子樹。',
            code: `// 創建 KD 樹: 每層輪流依不同維度切中位數，讓樹自動維持平衡（類似不需旋轉的平衡 BST）。
struct Point {
    int x[kDimension];
};
Point p[kMaxN];
int lc[kMaxN], rc[kMaxN];
// return the root of the subtree built from [l, r), stored at array index mid
int build(int l, int r, int depth) {
    if (l >= r) {
        return 0;              // 空區間，回傳 0 代表「沒有這個節點」
    }
    int mid = (l + r) >> 1;
    int dim = depth % kDimension;   // 深度對維度數取模，逐層輪流切不同的座標軸
    nth_element(p + l, p + mid, p + r, [dim](const Point& a, const Point& b) {
        return a.x[dim] < b.x[dim];   // 只依當前這一維排序，把中位數移到 mid，不必整段完全排序
    });
    lc[mid] = build(l, mid, depth + 1);       // 中位數左邊的點都在這一維較小，遞迴建成左子樹
    rc[mid] = build(mid + 1, r, depth + 1);   // 右邊同理，深度 +1 讓下一層切換到下一個維度
    return mid;   // 直接把陣列下標當節點編號，省去額外配置節點的開銷
}`,
            complexity: '建樹 O(n log n)'
          },
          {
            title: '搜索 m 近鄰',
            summary:
              'DFS 先進「目標所在」的一側，回溯時用「到分割超平面的距離」估價，只有可能藏更近點時才進另一側，用大根堆維護當前最近 m 個。',
            complexity: '期望次線性，最壞 O(n)'
          }
        ]
      },
      {
        title: '左偏樹',
        summary:
          '可並堆的一種：合併兩個堆只需 O(log n)，遠快於逐一插入。維護「左子距離 ≥ 右子距離」的左偏性質。',
        children: [
          {
            title: '左偏樹的性質',
            summary: '節點的 dist 定義為到最近外節點的距離；左偏性質保證右鏈長度 O(log n)，合併沿右鏈進行。'
          },
          {
            title: '基本操作',
            summary:
              '合併：取兩根中較優者為新根，遞迴合併其右子與另一堆，再依左偏性質必要時交換左右並更新 dist。插入=與單點堆合併；刪頂=合併左右子。',
            code: `// 基本操作: 合併永遠沿著「右鏈」遞迴下去，左偏性質保證右鏈長度是 O(log n)，因此合併是 O(log n) 而非 O(n)。
int merge(int a, int b) {
    if (!a || !b) {
        // 其中一堆是空的（下標 0 代表空節點），回傳非空的那一個；因為兩者恰有一個是 0，用 | 取代 if-else 只是簡潔寫法
        return a | b;
    }
    if (val[b] < val[a]) {
        swap(a, b);     // min-heap：保證 a 是值較小（優先權較高）的根，讓 a 留在新樹的根
    }
    rc[a] = merge(rc[a], b);   // 把 a 的右子樹跟另一堆 b 遞迴合併，結果掛回 a 的右邊
    if (dist[lc[a]] < dist[rc[a]]) {
        swap(lc[a], rc[a]);    // 左偏樹要求左子的 dist 不小於右子，不滿足就交換，維持右鏈永遠是較短的一側
    }
    dist[a] = dist[rc[a]] + 1;   // dist 定義成「到最近外節點（缺孩子的節點）的距離」，靠右子遞推
    return a;
}`,
            complexity: 'O(log n)'
          }
        ]
      },
      {
        title: '動態樹 (LCT)',
        summary:
          '用一堆 Splay 維護動態森林的「實鏈」，支援 link/cut、路徑查詢/修改、換根，均攤 O(log n)。實作難度高，賽場上能用樹剖就別上 LCT。',
        children: [
          {
            title: 'LCT 的性質',
            summary: '每條實鏈是一棵按深度為序的 Splay；不同鏈間用「虛邊」（子指父、父不認子）連接。'
          },
          {
            title: 'LCT 的基本操作',
            summary:
              'access(x) 把根到 x 打通成一條實鏈，是一切操作的基礎；makeroot 靠翻轉標記換根；link/cut 改虛實邊。每步 splay 前後的 pushup/pushdown 極易漏。',
            code: `// LCT 的基本操作: access(x) 沿著虛實邊一路往根走，每一步都把「原本連到 y 的實邊」換成新的一段，最終串成根到 x 的一條實鏈。
void access(int x) {
    for (int y = 0; x; y = x, x = parent[x]) {   // y 記錄上一步處理過的節點（一開始是虛節點 0，代表「沒有右子」）
        splay(x);           // 先把 x 伸展到它所在 Splay 的根，方便直接修改右子指標
        rc[x] = y;           // 把 x 原本的右子換成 y：捨棄舊的實鏈延伸，改連到剛剛處理過的那一段
        push_up(x);          // 子樹結構變了，需要重新彙總 x 的維護資訊
    }   // 迴圈結束時 x 變成 0（走到了真正的根之上），代表整條路徑都已經串成一條實鏈
}`,
            complexity: '均攤 O(log n)'
          }
        ]
      },
      {
        title: '樹套樹',
        summary:
          '外層一種樹、每個節點內再套一種樹，處理帶修改的二維查詢（如「區間第 k 小」帶單點改）。空間常數大，n 較小時優先考慮 CDQ 分治或整體二分。',
        children: [
          {
            title: '線段樹套平衡樹',
            summary:
              '外層線段樹按下標分區間，每個節點內用平衡樹（或替罪羊/Treap）維護該區間的值集合，支援插入/刪除與排名查詢。單次約 O(log^2 n)。',
            complexity: 'O(log^2 n)'
          },
          {
            title: '線段樹套線段樹',
            summary:
              '外層按一維、內層按另一維的權值線段樹，處理二維數點/矩形第 k 大等。常配合可持久化壓空間。'
          }
        ]
      }
    ]
  },
  {
    id: 'advanced-persistent-data-structures',
    sourceChapter: 5,
    title: '可持久化數據結構',
    leetcodeProblemIds: [
      'lc-3027-2',
      'lc-3072',
      'lc-3624',
      'lc-3187',
      'lc0x3f-421',
      'lc-1707',
      'lc-2479',
      'seg-001',
      'lc-715',
      'lc-729',
      'lc-lcr-170'
    ],
    topics: [
      {
        title: '可持久化線段樹 (主席樹)',
        summary:
          '保留每次修改後的歷史版本：每次只新建「修改路徑」上的 O(log n) 個節點，其餘與舊版本共享。經典用途是靜態區間第 k 小。',
        children: [
          {
            title: '版本共享與新建路徑',
            summary:
              '新版本沿修改路徑複製節點、其餘指標指向舊節點，故單次修改僅 O(log n) 新節點。節點池要開 n·log(值域) 級，開小會 RE。',
            code: `// 版本共享與新建路徑: 只複製「本次修改會經過」的節點，沒被動到的子樹直接沿用舊版本的指標，達到節省空間的目的。
int update(int pre, int l, int r, int pos) {
    int cur = ++total_nodes;   // 為這個節點在這個新版本開一個全新的位置，舊版本 pre 完全不受影響
    ls[cur] = ls[pre];          // 先假設左右子都沿用舊版本
    rs[cur] = rs[pre];
    sum[cur] = sum[pre] + 1;    // 這條路徑上的計數都要加一
    if (l == r) {
        return cur;              // 到達葉節點，這裡就是 pos 對應的位置，不用再往下修改
    }
    int m = (l + r) >> 1;
    if (pos <= m) {
        ls[cur] = update(ls[pre], l, m, pos);   // 只有真正需要修改的那一側才遞迴新建節點，另一側維持指向舊節點
    } else {
        rs[cur] = update(rs[pre], m + 1, r, pos);
    }
    return cur;   // 回傳這個版本新建的（子）樹根，供上一層或呼叫端記錄
}`,
            complexity: '每次 O(log n)'
          },
          {
            title: '區間第 k 小',
            summary:
              '對每個前綴建一棵權值線段樹（可持久化共享）。查詢 [l,r] 時用 root[r] 與 root[l−1] 的節點計數相減，在樹上二分定位第 k 小。值域大要先離散化。',
            code: `// 區間第 k 小: 兩個版本的權值線段樹相減，恰好還原出「只屬於 [l, r] 這個區間」的資料分布，再在上面做值域二分。
int kth(int u, int v, int l, int r, int k) {   // v=root[r], u=root[l-1]
    if (l == r) {
        return l;              // 值域區間縮到單一個值，這個值就是答案
    }
    int m = (l + r) >> 1, cnt = sum[ls[v]] - sum[ls[u]];   // 用兩個版本前綴的差，得到「值落在左半值域」且下標在 [l,r] 內的個數
    if (k <= cnt) {
        return kth(ls[u], ls[v], l, m, k);    // 第 k 小落在左半值域，帶著相同的 k 往左遞迴
    }
    return kth(rs[u], rs[v], m + 1, r, k - cnt);   // 否則要找的是右半值域中的第 (k - cnt) 小
}`,
            complexity: '每次查詢 O(log n)'
          }
        ]
      },
      {
        title: '可持久化字典樹',
        summary:
          '把 01-Trie 可持久化，對每個前綴保留一個版本，即可在線查詢「與某數異或最大、且下標在 [l,r] 內」等問題，思路與主席樹的前綴差分一致。',
        children: [
          {
            title: '最大異或和',
            summary:
              '建可持久化 01-Trie（每位存子樹計數），查詢時貪心地優先往「與目標當前位相反」的分支走，並用版本差分限制下標範圍。',
            code: `// 最大異或和: 可持久化 01-Trie，按位元從高到低建樹，每個版本只新建自己那條路徑，其餘與前一版本共享。
int ch[kMaxN * 24][2], cnt[kMaxN * 24], total_nodes;
// insert val based on version pre (from bit kMaxBit down to 0)
int insert(int pre, int val) {
    int cur = ++total_nodes, root = cur;
    for (int b = kMaxBit; b >= 0; --b) {
        int x = (val >> b) & 1;              // 取出 val 第 b 位的值（0 或 1），決定這一層往哪個孩子走
        ch[cur][x ^ 1] = ch[pre][x ^ 1];      // 另一個分支（沒被走到的那個）直接沿用舊版本，不需複製
        ch[cur][x] = ++total_nodes;           // 這一步真正走到的分支要新建節點，屬於本次插入的新路徑
        cur = ch[cur][x];
        pre = ch[pre][x];
        cnt[cur] = cnt[pre] + 1;              // 沿路徑的計數加一，之後查詢時用「兩個版本計數相減」限制下標範圍
    }
    return root;
}
// query the maximum xor with val over version interval (l, r]
int query(int l, int r, int val) {
    int res = 0;
    for (int b = kMaxBit; b >= 0; --b) {
        int x = (val >> b) & 1;
        // 貪心：優先走與 val 這一位「相反」的分支，這樣異或後這一位是 1，對高位優先的異或值最有利
        if (cnt[ch[r][x ^ 1]] - cnt[ch[l][x ^ 1]] > 0) {   // 版本差分確認這個分支在 (l, r] 範圍內真的存在
            res |= (1 << b);   // 這一位能異或出 1，累加進最終答案
            l = ch[l][x ^ 1];
            r = ch[r][x ^ 1];
        } else {
            l = ch[l][x];   // 相反分支不存在，只好走相同分支（這一位異或後是 0）
            r = ch[r][x];
        }
    }
    return res;
}`,
            complexity: '每次 O(log 值域)'
          }
        ]
      }
    ]
  },
  {
    id: 'advanced-graph-algorithms',
    sourceChapter: 6,
    title: '圖論算法進階',
    leetcodeProblemIds: [
      'lc0x3f-1782',
      'sp-lc-2699',
      'lc0x3f-2127',
      'lc0x3f-882',
      'lc-1820',
      'lc-2123',
      'lc-3385',
      'lc-lcp-04',
      'lc-1947',
      'lc-785',
      'lc-886',
      'lc-2403'
    ],
    topics: [
      {
        title: 'EK 算法',
        summary:
          '最大流的基礎：反覆用 BFS 找一條增廣路、取路徑最小殘量增廣，直到無增廣路。實作簡單，複雜度 O(VE^2)，適合小圖或入門理解。',
        complexity: 'O(VE^2)'
      },
      {
        title: 'Dinic 算法',
        summary:
          '主流最大流：先 BFS 分層建層次圖，再 DFS 沿「層次遞增」的邊多路增廣，反覆直到無法分層。配當前弧優化避免重掃滿邊。二分圖匹配上跑得極快。',
        code: `// Dinic 算法: BFS 先分層（只允許沿層數遞增的邊走），DFS 再用「當前弧優化」一次找出多條增廣路，減少重複掃描。
int level[kMaxN], cur[kMaxN];
bool bfs(int s, int t) {
    fill(level, level + n, -1);   // -1 代表還沒分到層
    queue<int> q;
    q.push(s);
    level[s] = 0;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int id : g[u]) {
            auto& e = edges[id];
            if (e.cap > 0 && level[e.to] == -1) {   // 還有剩餘容量，且還沒被分層
                level[e.to] = level[u] + 1;
                q.push(e.to);
            }
        }
    }
    return level[t] != -1;   // 分層後 t 有沒有被標到層數，決定是否還存在增廣路
}
int dfs(int u, int t, int f) {   // f 是這條路徑目前允許通過的最大流量（由沿途最窄的邊決定）
    if (u == t) {
        return f;   // 走到匯點，這條路徑能貢獻 f 這麼多流量
    }
    int res = 0;
    // 用引用 cur[u]，讓下一次從這個點出發時直接接著上次掃到的地方繼續，跳過已經榨乾（或不合法）的邊，避免重複掃描
    for (int& i = cur[u]; i < (int)g[u].size(); ++i) {
        auto& e = edges[g[u][i]];
        if (e.cap > 0 && level[e.to] == level[u] + 1) {   // 只沿「層數剛好加一」的邊走，這是 Dinic 限制搜索範圍的關鍵
            int d = dfs(e.to, t, min(f, e.cap));
            e.cap -= d;                                    // 正向邊扣掉用掉的流量
            edges[g[u][i] ^ 1].cap += d;                    // 反向邊加回同樣的量，之後可以「反悔」走回頭路調整流量分配
            res += d;
            f -= d;
            if (!f) {
                break;   // 這條路徑能承載的流量已經用完，不用再嘗試其他出邊
            }
        }
    }
    return res;
}`,
        complexity: '一般 O(V^2 E)，二分圖 O(E√V)'
      },
      {
        title: 'ISAP 算法',
        summary:
          '單次 BFS 建高度標號後不斷 DFS 增廣並就地維護高度（gap 優化提前結束），常數優於 Dinic，是卡常時的選擇。',
        complexity: 'O(V^2 E)'
      },
      {
        title: '二分圖匹配 (最大匹配、匈牙利算法)',
        summary: '在二分圖中選最多的邊使無公共端點。可用匈牙利增廣，或建源匯後用 Dinic。',
        children: [
          {
            title: '最大匹配算法',
            summary:
              '核心是「增廣路」：一條交替未匹配/已匹配邊、兩端皆未匹配的路徑，翻轉它可使匹配數 +1。無增廣路時即最大匹配。'
          },
          {
            title: '匈牙利算法',
            summary:
              '對左部每點嘗試找增廣路：若對面點未匹配、或其現匹配能讓出，就完成匹配。實作短，複雜度 O(VE)。',
            code: `// 匈牙利算法: 對左部每個點嘗試找「增廣路」——若對面點空著就直接配對，否則讓對面點原本的配偶「讓賢」去找別的對象。
bool find(int u) {
    for (int v : g[u]) {
        if (!visited[v]) {           // 本輪還沒試過 v，避免同一輪內在多個遞迴分支間重複嘗試同一個點形成死循環
            visited[v] = true;
            if (match[v] == -1 || find(match[v])) {
                // v 目前沒配對，或者 v 原本配對的 match[v] 能改去找到別的對象讓出 v：兩種情況都能把 v 讓給 u
                match[v] = u;
                return true;
            }
        }
    }
    return false;   // 嘗試過所有鄰居都無法讓 u 配對成功，這條增廣路不存在
}
int res = 0;
for (int u = 0; u < nl; ++u) {
    fill(visited, visited + nr, false);   // 每個左部點都要重新開始一輪嘗試，visited 只在「單次尋找增廣路」的過程中有效
    res += find(u);
}`,
            complexity: 'O(VE)'
          }
        ]
      },
      {
        title: '最大流最小割',
        summary:
          '最大流最小割定理：最大流量 = 最小割容量。許多「二選一的最小代價/最大收益」問題可建模成最小割求解，難點在建模而非模板。',
        children: [
          {
            title: '最小邊割集',
            summary: '把某些邊移除使源匯不連通、且移除容量最小——即最小割，直接跑最大流。'
          },
          {
            title: '最小點割集',
            summary: '透過「拆點」（點拆成入點→出點、容量為點權）把點割轉成邊割再求最大流。'
          },
          {
            title: '最大收益',
            summary: '最大權閉合子圖 / 最大收益問題：正收益連源、負收益連匯，答案 = 正收益總和 − 最小割。'
          }
        ]
      },
      {
        title: '最小費用最大流',
        summary:
          '在流量最大的前提下使總費用最小。把 Dinic/EK 的「找增廣路」換成「找最短（費用）增廣路」（SPFA 或帶勢的 Dijkstra），沿最短路增廣。',
        children: [
          {
            title: '農場之旅類建模',
            summary:
              '「往返不重複走同一條邊」「限量運輸最小成本」等，都可把容量設為可用次數、費用設為單位代價，跑 MCMF 求解。'
          }
        ]
      },
      {
        title: '二分圖最大權匹配',
        summary: '每條邊帶權，求權和最大的完美匹配。',
        children: [
          {
            title: 'KM 算法 (Kuhn-Munkres 算法)',
            summary:
              '維護頂標（可行頂標滿足 lx[u]+ly[v] ≥ w(u,v)），沿相等子圖找增廣路，找不到就調整頂標擴大相等子圖。O(n^3)。也可用費用流求解。',
            complexity: 'O(n^3)'
          }
        ]
      },
      {
        title: '有向圖的最小生成樹',
        summary: '有向版 MST（最小樹形圖）：給定根，選 n−1 條邊使根能到達所有點且權和最小。',
        children: [
          {
            title: '朱劉算法 (Chu-Liu / Edmonds 算法)',
            summary:
              '每點選最小入邊；若形成環就把環縮成一點、調整環外入邊權，反覆直到無環。樸素 O(VE)，Tarjan 優化可到 O(E + V log V)。',
            complexity: 'O(VE)'
          }
        ]
      }
    ]
  },
  {
    id: 'advanced-dp',
    sourceChapter: 7,
    title: '動態規劃進階',
    leetcodeProblemIds: [
      'dp-004',
      'lc-3562',
      'dp-lc-1312',
      'lc-2246',
      'dp-003',
      'lc-474',
      'lc-494',
      'dp-lc-322',
      'lc-879',
      'treedp-lc-337',
      'treedp-lc-834',
      'lc-2463',
      'lc-337'
    ],
    topics: [
      {
        title: '背包問題進階 (多重、分組、混合)',
        summary: '01/完全背包的變形。抓住「每組物品的取用限制」即可套對迴圈結構。',
        children: [
          {
            title: '多重背包問題',
            summary:
              '每種物品有限量 k 件。二進位拆分成 1,2,4,…,剩餘 的若干「捆」，每捆當一件做 01 背包，把 O(nWk) 降到 O(nW log k)；更進一步可用單調隊列 O(nW)。',
            code: `// 多重背包問題: 二進位拆分——任何 0..cnt 之間的數量都能用 1,2,4,...這些「捆」湊出來，於是把件數為 cnt 的物品變成 O(log cnt) 個 01 背包物品。
for (int k = 1; cnt > 0; k <<= 1) {         // k 依序是 1, 2, 4, 8, ...
    int use = min(k, cnt);                   // 最後一捆可能湊不滿 2 的冪，剩多少就拿多少
    cnt -= use;
    for (int j = capacity; j >= use * w; --j) {   // 把「use 件」打包成一件重量 use*w、價值 use*v 的物品，照 01 背包逆序處理
        f[j] = max(f[j], f[j - use * w] + use * v);
    }
}`,
            complexity: 'O(nW log k)'
          },
          {
            title: '分組背包問題',
            summary:
              '物品分組、每組至多選一件。迴圈順序必須「組在最外層、容量在中層、組內物品在最內層」，否則同組會被選多個。',
            code: `// 分組背包問題: 「組」必須在最外層，確保同一組的物品在更新容量 j 時互相看不到彼此本輪的更新，才不會一組選超過一件。
for (int g = 0; g < group_count; ++g) {          // 外層：一次只決定「這一組」要不要選、選哪件
    for (int j = capacity; j >= 0; --j) {         // 中層：容量逆序，讓同一組的物品共用「上一組」算好的 f 值
        for (auto& it : group[g]) {               // 內層：組內物品互斥，逐一嘗試但都基於同一份尚未更新的 f[j - it.w]
            if (j >= it.w) {
                f[j] = max(f[j], f[j - it.w] + it.v);
            }
        }
    }
}`,
            complexity: 'O(W · 物品總數)'
          },
          {
            title: '混合背包問題',
            summary:
              '同一題同時出現 01（限一件）、完全（無限）、多重（限量）物品。按每件的類型分別採用對應寫法：01 逆序、完全正序、多重先二進位拆分。'
          }
        ]
      },
      {
        title: '樹形 DP 進階 (背包類、不定根)',
        summary: '把背包或換根技巧搬到樹上。',
        children: [
          {
            title: '背包類樹形 DP',
            summary:
              '在樹上做「選課/依賴背包」：f[u][j] 為 u 子樹用容量 j 的最優解，合併子樹時做一次分組背包。用「子樹大小」限制枚舉上界可把複雜度做到 O(n·W)（而非看似的 O(n·W^2)）。',
            complexity: 'O(n·W)'
          },
          {
            title: '不定根樹形 DP',
            summary:
              '即換根 DP：先一次 DFS 求「以固定根」的答案，再一次 DFS 從父到子 O(1) 調整，得到「以每個點為根」的答案。',
            code: `// 不定根樹形 DP: 第一次 DFS 已經算出「以某個固定點為根」的答案，這裡第二次 DFS 利用父子關係 O(1) 遞推出換根後的答案。
void dfs2(int u, int parent) {
    for (int v : g[u]) {
        if (v != parent) {
            // reroot: remove child v's contribution from u, then attach u under v
            // 概念上：把 g_ans[u] 減去「v 對 u 的貢獻」，再加上「u 對 v 的貢獻」，就得到把根從 u 換到 v 的答案
            g_ans[v] = adjust(g_ans[u], u, v);
            dfs2(v, u);   // 以 v 為新的已知答案，繼續往它的子節點遞推
        }
    }
}`,
            complexity: 'O(n)'
          }
        ]
      }
    ]
  },
  {
    id: 'advanced-complex-dp',
    sourceChapter: 8,
    title: '複雜動態規劃及其優化',
    leetcodeProblemIds: [
      'lift-005',
      'dp-005',
      'bm-lc-1799',
      'dp-lc-2707',
      'lc-3677',
      'lc-3448',
      'lc-2184',
      'lc-1931',
      'lc-1659',
      'lc-3500',
      'lc-3826',
      'lc-1547',
      'lc-1039'
    ],
    topics: [
      {
        title: '數位 DP',
        summary:
          '統計 [0, N] 中滿足某數位性質的數量。按位從高到低 DFS，帶「是否貼上界 limit」與「是否前導零 lead」兩旗標；非 limit 且非 lead 的狀態可記憶化重用。',
        code: `// 數位 DP: limit 記錄「目前是否還貼著上界」，決定這一位能填到多大；只有非 limit、非前導零的狀態才有「與具體上界無關」的通用性，可以放心快取。
int dfs(int pos, int state, bool limit, bool lead) {
    if (pos < 0) {
        return /* count valid numbers */ 1;   // 所有位都填完了，這是一個合法方案
    }
    if (!limit && !lead && f[pos][state] != -1) {
        return f[pos][state];    // 只有「不貼上界、不是前導零」的狀態才與具體數字無關，能安全複用快取結果
    }
    int up = limit ? digit[pos] : 9, res = 0;   // 貼上界時這一位最多只能填到原數字對應位，否則會超過 N；不貼上界則任填 0-9
    for (int d = 0; d <= up; ++d) {
        // 下一層是否仍貼上界，取決於這一位是否也填到了上界值 up；前導零的傳遞同理，只要目前是前導零且這位仍填 0 就延續
        res += dfs(pos - 1, nxt(state, d), limit && d == up, lead && d == 0);
    }
    if (!limit && !lead) {
        f[pos][state] = res;   // 同樣只快取「通用」狀態，貼上界或前導零的結果只對這一次呼叫有意義，快取了也沒用還會出錯
    }
    return res;
}`,
        complexity: 'O(位數 · 狀態數 · 10)'
      },
      {
        title: '插頭 DP',
        summary:
          '基於「輪廓線」的狀態壓縮 DP，處理棋盤上的連通性/鋪磚/迴路計數。用括號序列或最小表示法編碼輪廓上的插頭連通狀態，逐格轉移。是狀壓 DP 中最硬的一類。',
        complexity: '約 O(nm · 狀態數)'
      },
      {
        title: '斜率優化',
        summary:
          '把轉移式整理成 y=kx+b 的直線形式（把只含 j 的項當座標點、含 i 的項當斜率），用單調隊列維護下凸/上凸殼，均攤 O(1) 取最優決策，把 O(n^2) 降到 O(n)。橫座標與斜率不單調時改用二分或李超線段樹。',
        code: `// 斜率優化: 把每個決策點看成平面上一個點，隊列維護的是下凸殼；查詢時的「詢問斜率」若單調，隊頭彈出的邊即最優決策，均攤 O(1)。
// Example: f[i] = min(f[j] + cost(j, i)). After reformulating into slope form...
// use monotone deque q[] to maintain lower hull; x_value()/y_value() are decision-point coordinates
int q[kMaxN], head, tail;
double slope(int a, int b) {
    return static_cast<double>(y_value(b) - y_value(a)) / (x_value(b) - x_value(a));   // 兩個決策點連線的斜率
}
void solve(int n) {
    head = tail = 0;
    q[tail++] = 0;   // 決策點 0（邊界）先放進隊列
    for (int i = 1; i <= n; ++i) {
        // 查詢的「目標斜率」k(i) 若單調遞增，隊頭到下一個點的斜率一旦已經 <= k(i)，代表隊頭不會再是最優，永久彈出
        while (head + 1 < tail && slope(q[head], q[head + 1]) <= k(i)) {
            ++head;
        }
        int j = q[head];             // 隊頭就是當前查詢下最優的決策點
        f[i] = f[j] + cost(j, i);
        while (head + 1 < tail) {
            // 加入 i 之前，先把「使凸殼不再是凸的」隊尾點彈掉：新加的點若讓最後兩段斜率不再遞增，中間那個點就不可能是最優
            if (slope(q[tail - 2], q[tail - 1]) < slope(q[tail - 1], i)) {
                break;
            }
            --tail;
        }
        q[tail++] = i;   // i 自己也是未來查詢的候選決策點，加入隊尾
    }
}`,
        complexity: 'O(n)'
      },
      {
        title: '四邊形不等式優化',
        summary:
          '對區間 DP，若代價滿足四邊形不等式（w(a,c)+w(b,d) ≤ w(a,d)+w(b,c)）則決策點單調，最優分割點 opt[i][j] 落在 [opt[i][j−1], opt[i+1][j]]，把 O(n^3) 降到 O(n^2)。務必先驗證決策單調性再套用。',
        complexity: 'O(n^2)'
      }
    ]
  },
  {
    id: 'advanced-math',
    sourceChapter: 9,
    title: '高級數論與多項式算法',
    topics: [
      {
        title: '多項式運算',
        summary: '把多項式乘法（卷積）從 O(n^2) 加速到 O(n log n)，是高階計數與字串問題的底層工具。',
        children: [
          {
            title: '快速傅里葉變換 (FFT)',
            summary:
              '在複數單位根上求值（DFT）→ 點值相乘 → 插值（IDFT），利用分治把 DFT 做到 O(n log n)。用於大整數乘法、卷積。要注意浮點誤差，係數大時需謹慎。',
            complexity: 'O(n log n)'
          },
          {
            title: '快速數論變換 (NTT)',
            summary:
              'FFT 的模意義版本：在特定質數（如 998244353）的原根上做變換，避免浮點誤差，適合「答案對質數取模」的卷積。',
            complexity: 'O(n log n)'
          }
        ]
      },
      {
        title: '莫比烏斯反演 (Möbius Inversion)',
        summary: '數論計數的反演工具，常把「恰好」轉「倍數/約數」求和後化簡。',
        children: [
          {
            title: '數論函數與狄利克雷卷積',
            summary: '積性函數（φ、μ、d、σ）在狄利克雷卷積下的關係是反演的基礎，如 μ*1=ε、φ*1=id。'
          },
          {
            title: '反演公式與應用',
            summary:
              '若 F(n)=Σ_{d|n} f(d)，則 f(n)=Σ_{d|n} μ(n/d)F(d)。常用於求 Σgcd、互質對計數等，配合整除分塊加速求和。'
          }
        ]
      },
      {
        title: '亞線性篩法',
        summary: '在低於線性時間內求積性函數前綴和。',
        children: [
          {
            title: '杜教篩',
            summary:
              '透過構造 g 使 (f*g) 與 g 的前綴和易算，得遞迴式 g(1)S(n)=Σ(f*g)(i) − Σ_{d≥2} g(d)S(n/d)，配整除分塊與記憶化，複雜度 O(n^(2/3))。',
            complexity: 'O(n^(2/3))'
          }
        ]
      }
    ]
  }
];
