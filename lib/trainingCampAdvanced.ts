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
    block_size = max(1, static_cast<int>(sqrt(n)));
    for (int i = 1; i <= n; ++i) {
        block_id[i] = (i - 1) / block_size + 1;
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
            code: `// 跳躍表的結構體定義: 現代 C++ 範例，註解標出此段的核心意圖。
struct Node { int val; vector<Node*> forward; };`
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
            code: `// 基礎莫隊: 現代 C++ 範例，註解標出此段的核心意圖。
sort(qs, qs + q, [](auto& a, auto& b) {
    return block_id[a.l] != block_id[b.l] ? a.l < b.l : (block_id[a.l] & 1 ? a.r < b.r : a.r > b.r);
});
int l = 1, r = 0;
for (auto& q : qs) {
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
    ans[q.id] = cur;
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
            code: `// 處理多維偏序問題 (三維偏序): 現代 C++ 範例，註解標出此段的核心意圖。
// a[] is sorted by the first dimension x (deduplicated per group with counts)
// for [l, r]: recurse on both halves, then count cross-subarray contributions from left to right
void cdq(int l, int r) {
    if (l == r) {
        return;
    }
    int mid = (l + r) >> 1;
    cdq(l, mid);
    cdq(mid + 1, r);
    sort(a + l, a + mid + 1, compare_y);
    sort(a + mid + 1, a + r + 1, compare_y);
    int i = l;
    for (int j = mid + 1; j <= r; ++j) {
        while (i <= mid && a[i].y <= a[j].y) {
            bit.add(a[i].z, a[i].cnt);
            ++i;
        }
        a[j].ans += bit.query(a[j].z);
    }
    for (int k = l; k < i; ++k) {
        bit.clear(a[k].z);  // undo additions to keep amortized O(n log n) overall
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
            code: `// 創建字典樹: 現代 C++ 範例，註解標出此段的核心意圖。
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
}`
          },
          {
            title: '創建 AC 自動機',
            summary:
              'BFS 建 fail：fail[u] 指向「u 對應字串的最長真後綴」所在節點；不存在的轉移直接指向 fail 的對應轉移（路徑壓縮），使匹配時無需回跳。',
            code: `// 創建 AC 自動機: 現代 C++ 範例，註解標出此段的核心意圖。
queue<int> q;
for (int c = 0; c < 26; ++c) {
    if (ch[0][c]) {
        q.push(ch[0][c]);
    }
}
while (!q.empty()) {
    int u = q.front();
    q.pop();
    for (int c = 0; c < 26; ++c) {
        int& v = ch[u][c];
        if (v) {
            fail[v] = ch[fail[u]][c];
            q.push(v);
        } else {
            v = ch[fail[u]][c];   // fill missing transitions to avoid branching in queries
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
            code: `// 基數排序: 現代 C++ 範例，註解標出此段的核心意圖。
int n, m;               // n: string length; m: current value range size (initially the alphabet size)
int sa[kMaxN], rk[kMaxN], id[kMaxN], cnt[kMaxN];

// One doubling round: given ranks for length w, compute sa[] for length 2w
void radix_sort(int w) {
    int p = 0;
    // secondary key: rk[i + w]. Positions beyond n get the smallest secondary key, prepended first
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
        cnt[i] = 0;
    }
    for (int i = 1; i <= n; ++i) {
        cnt[rk[i]]++;
    }
    for (int i = 1; i <= m; ++i) {
        cnt[i] += cnt[i - 1];
    }
    for (int i = n; i >= 1; --i) {   // scan backwards to preserve stability
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
            code: `// 後綴數組的應用: 現代 C++ 範例，註解標出此段的核心意圖。
// linear height computation using rank[] / sa[]
for (int i = 1, k = 0; i <= n; ++i) {
    if (k) {
        --k;
    }
    int j = sa[rk[i] - 1];
    while (i + k <= n && j + k <= n && s[i + k] == s[j + k]) {
        ++k;
    }
    height[rk[i]] = k;
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
            code: `// 預處理: 現代 C++ 範例，註解標出此段的核心意圖。
int sz[kMaxN], depth[kMaxN], parent[kMaxN], heavy_child[kMaxN], top[kMaxN], discovery_time[kMaxN], timer;
void dfs1(int u, int f) {
    sz[u] = 1;
    for (int v : g[u]) {
        if (v != f) {
            parent[v] = f;
            depth[v] = depth[u] + 1;
            dfs1(v, u);
            sz[u] += sz[v];
            if (sz[v] > sz[heavy_child[u]]) {
                heavy_child[u] = v;
            }
        }
    }
}
void dfs2(int u, int t) {
    top[u] = t;
    discovery_time[u] = ++timer;
    if (heavy_child[u]) {
        dfs2(heavy_child[u], t);
    }
    for (int v : g[u]) {
        if (v != parent[u] && v != heavy_child[u]) {
            dfs2(v, v);
        }
    }
}`
          },
          {
            title: '求解最近公共祖先',
            summary: '兩點不斷把「鏈頂較深」的一方跳到其鏈頂的父節點，直到同鏈，較淺者即 LCA。O(log n)。',
            code: `// 求解最近公共祖先: 現代 C++ 範例，註解標出此段的核心意圖。
int lca(int u, int v) {
    while (top[u] != top[v]) {
        if (depth[top[u]] < depth[top[v]]) {
            swap(u, v);
        }
        u = parent[top[u]];
    }
    return depth[u] < depth[v] ? u : v;
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
            code: `// 樹的重心: 現代 C++ 範例，註解標出此段的核心意圖。
void find_centroid(int u, int parent, int total_nodes, int& c, int& best) {
    int mx = 0, s = 1;
    for (int v : g[u]) {
        if (v != parent && !del[v]) {
            find_centroid(v, u, total_nodes, c, best);
            s += sz[v];
            mx = max(mx, sz[v]);
        }
    }
    sz[u] = s;
    mx = max(mx, total_nodes - s);
    if (mx < best) {
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
            code: `// 創建 KD 樹: 現代 C++ 範例，註解標出此段的核心意圖。
struct Point {
    int x[kDimension];
};
Point p[kMaxN];
int lc[kMaxN], rc[kMaxN];
// return the root of the subtree built from [l, r), stored at array index mid
int build(int l, int r, int depth) {
    if (l >= r) {
        return 0;
    }
    int mid = (l + r) >> 1;
    int dim = depth % kDimension;
    nth_element(p + l, p + mid, p + r, [dim](const Point& a, const Point& b) {
        return a.x[dim] < b.x[dim];
    });
    lc[mid] = build(l, mid, depth + 1);
    rc[mid] = build(mid + 1, r, depth + 1);
    return mid;
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
            code: `// 基本操作: 現代 C++ 範例，註解標出此段的核心意圖。
int merge(int a, int b) {
    if (!a || !b) {
        return a | b;
    }
    if (val[b] < val[a]) {
        swap(a, b);     // min-heap
    }
    rc[a] = merge(rc[a], b);
    if (dist[lc[a]] < dist[rc[a]]) {
        swap(lc[a], rc[a]);
    }
    dist[a] = dist[rc[a]] + 1;
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
            code: `// LCT 的基本操作: 現代 C++ 範例，註解標出此段的核心意圖。
void access(int x) {
    for (int y = 0; x; y = x, x = parent[x]) {
        splay(x);
        rc[x] = y;
        push_up(x);
    }
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
            summary: '新版本沿修改路徑複製節點、其餘指標指向舊節點，故單次修改僅 O(log n) 新節點。節點池要開 n·log(值域) 級，開小會 RE。',
            code: `// 版本共享與新建路徑: 現代 C++ 範例，註解標出此段的核心意圖。
int update(int pre, int l, int r, int pos) {
    int cur = ++total_nodes;
    ls[cur] = ls[pre];
    rs[cur] = rs[pre];
    sum[cur] = sum[pre] + 1;
    if (l == r) {
        return cur;
    }
    int m = (l + r) >> 1;
    if (pos <= m) {
        ls[cur] = update(ls[pre], l, m, pos);
    } else {
        rs[cur] = update(rs[pre], m + 1, r, pos);
    }
    return cur;
}`,
            complexity: '每次 O(log n)'
          },
          {
            title: '區間第 k 小',
            summary:
              '對每個前綴建一棵權值線段樹（可持久化共享）。查詢 [l,r] 時用 root[r] 與 root[l−1] 的節點計數相減，在樹上二分定位第 k 小。值域大要先離散化。',
            code: `// 區間第 k 小: 現代 C++ 範例，註解標出此段的核心意圖。
int kth(int u, int v, int l, int r, int k) {   // v=root[r], u=root[l-1]
    if (l == r) {
        return l;
    }
    int m = (l + r) >> 1, cnt = sum[ls[v]] - sum[ls[u]];
    if (k <= cnt) {
        return kth(ls[u], ls[v], l, m, k);
    }
    return kth(rs[u], rs[v], m + 1, r, k - cnt);
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
            code: `// 最大異或和: 現代 C++ 範例，註解標出此段的核心意圖。
int ch[kMaxN * 24][2], cnt[kMaxN * 24], total_nodes;
// insert val based on version pre (from bit kMaxBit down to 0)
int insert(int pre, int val) {
    int cur = ++total_nodes, root = cur;
    for (int b = kMaxBit; b >= 0; --b) {
        int x = val >> b & 1;
        ch[cur][x ^ 1] = ch[pre][x ^ 1];
        ch[cur][x] = ++total_nodes;
        cur = ch[cur][x];
        pre = ch[pre][x];
        cnt[cur] = cnt[pre] + 1;
    }
    return root;
}
// query the maximum xor with val over version interval (l, r]
int query(int l, int r, int val) {
    int res = 0;
    for (int b = kMaxBit; b >= 0; --b) {
        int x = val >> b & 1;
        if (cnt[ch[r][x ^ 1]] - cnt[ch[l][x ^ 1]] > 0) {
            res |= 1 << b;
            l = ch[l][x ^ 1];
            r = ch[r][x ^ 1];
        } else {
            l = ch[l][x];
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
        code: `// Dinic 算法: 現代 C++ 範例，註解標出此段的核心意圖。
int level[kMaxN], cur[kMaxN];
bool bfs(int s, int t) {
    fill(level, level + n, -1);
    queue<int> q;
    q.push(s);
    level[s] = 0;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int id : g[u]) {
            auto& e = edges[id];
            if (e.cap > 0 && level[e.to] == -1) {
                level[e.to] = level[u] + 1;
                q.push(e.to);
            }
        }
    }
    return level[t] != -1;
}
int dfs(int u, int t, int f) {
    if (u == t) {
        return f;
    }
    int res = 0;
    for (int& i = cur[u]; i < (int)g[u].size(); ++i) {
        auto& e = edges[g[u][i]];
        if (e.cap > 0 && level[e.to] == level[u] + 1) {
            int d = dfs(e.to, t, min(f, e.cap));
            e.cap -= d;
            edges[g[u][i] ^ 1].cap += d;
            res += d;
            f -= d;
            if (!f) {
                break;
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
            summary: '核心是「增廣路」：一條交替未匹配/已匹配邊、兩端皆未匹配的路徑，翻轉它可使匹配數 +1。無增廣路時即最大匹配。'
          },
          {
            title: '匈牙利算法',
            summary:
              '對左部每點嘗試找增廣路：若對面點未匹配、或其現匹配能讓出，就完成匹配。實作短，複雜度 O(VE)。',
            code: `// 匈牙利算法: 現代 C++ 範例，註解標出此段的核心意圖。
bool find(int u) {
    for (int v : g[u]) {
        if (!visited[v]) {
            visited[v] = true;
            if (match[v] == -1 || find(match[v])) {
                match[v] = u;
                return true;
            }
        }
    }
    return false;
}
int res = 0;
for (int u = 0; u < nl; ++u) {
    fill(visited, visited + nr, false);
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
            summary:
              '最大權閉合子圖 / 最大收益問題：正收益連源、負收益連匯，答案 = 正收益總和 − 最小割。'
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
            code: `// 多重背包問題: 現代 C++ 範例，註解標出此段的核心意圖。
for (int k = 1; cnt > 0; k <<= 1) {
    int use = min(k, cnt);
    cnt -= use;
    for (int j = capacity; j >= use * w; --j) {
        f[j] = max(f[j], f[j - use * w] + use * v);
    }
}`,
            complexity: 'O(nW log k)'
          },
          {
            title: '分組背包問題',
            summary:
              '物品分組、每組至多選一件。迴圈順序必須「組在最外層、容量在中層、組內物品在最內層」，否則同組會被選多個。',
            code: `// 分組背包問題: 現代 C++ 範例，註解標出此段的核心意圖。
for (int g = 0; g < group_count; ++g) {
    for (int j = capacity; j >= 0; --j) {
        for (auto& it : group[g]) {
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
            code: `// 不定根樹形 DP: 現代 C++ 範例，註解標出此段的核心意圖。
void dfs2(int u, int parent) {
    for (int v : g[u]) {
        if (v != parent) {
            // reroot: remove child v's contribution from u, then attach u under v
            g_ans[v] = adjust(g_ans[u], u, v);
            dfs2(v, u);
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
        code: `// 數位 DP: 現代 C++ 範例，註解標出此段的核心意圖。
int dfs(int pos, int state, bool limit, bool lead) {
    if (pos < 0) {
        return /* count valid numbers */ 1;
    }
    if (!limit && !lead && f[pos][state] != -1) {
        return f[pos][state];
    }
    int up = limit ? digit[pos] : 9, res = 0;
    for (int d = 0; d <= up; ++d) {
        res += dfs(pos - 1, nxt(state, d), limit && d == up, lead && d == 0);
    }
    if (!limit && !lead) {
        f[pos][state] = res;
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
        code: `// 斜率優化: 現代 C++ 範例，註解標出此段的核心意圖。
// Example: f[i] = min(f[j] + cost(j, i)). After reformulating into slope form...
// use monotone deque q[] to maintain lower hull; x_value()/y_value() are decision-point coordinates
int q[kMaxN], head, tail;
double slope(int a, int b) {
    return static_cast<double>(y_value(b) - y_value(a)) / (x_value(b) - x_value(a));
}
void solve(int n) {
    head = tail = 0;
    q[tail++] = 0;
    for (int i = 1; i <= n; ++i) {
        while (head + 1 < tail && slope(q[head], q[head + 1]) <= k(i)) {
            ++head;
        }
        int j = q[head];
        f[i] = f[j] + cost(j, i);
        while (head + 1 < tail) {
            if (slope(q[tail - 2], q[tail - 1]) < slope(q[tail - 1], i)) {
                break;
            }
            --tail;
        }
        q[tail++] = i;
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
            summary:
              '積性函數（φ、μ、d、σ）在狄利克雷卷積下的關係是反演的基礎，如 μ*1=ε、φ*1=id。'
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
