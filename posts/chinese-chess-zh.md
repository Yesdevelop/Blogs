---
title: 使用C++编写一个中国象棋AI
date: 2026/1/1
lang: zh
description: "
本文记录了中国象棋AI项目Chess98的开发历程，同时为各位想编写象棋AI的大佬们提供一个参考。
Chess98是我在小鸟巡航大佬的帮助下完成的第一个项目，使用C++和传统搜索算法实现，棋力相当可以。
这篇文章用以记录此项目的开发历程和实现方法等内容。
"
tags: ["coding"]
---

这篇文章记录一个写了两年的中国象棋项目Chess98的开发思路。
也为对中国象棋AI感兴趣的读者大佬们提供一个参考。

在GitHub上认识的一位大佬的慷慨扶烂泥下，这个项目终于能够达到还可以的棋力水平了。
之后准备向NNUE进发，提升棋力和搜索性能，但是我的机器学习基础一塌糊涂，小鸟巡航大佬有工作要忙，只能暂时搁置了。
这也是我生涯中第一个有一定分量的项目，阶段目标完结撒花~

项目链接：https://github.com/StarlightChessOrg/Chess98

作者：HeliumAreFlying（小鸟巡航大佬）以及ForYes（我自己）

## 前言

平时喜欢下象棋，看到UPlanfor大佬自己使用Lua实现了一个象棋AI之后，自己也萌生了写一个的想法。

当时我初二，技术水平一点也不行（实际上现在也不咋地😭），就简单地写了几个Alpha Beta和历史启发之类的小玩具。
然后我遇见了小鸟巡航大佬。
这个大佬从大学开始就写棋软，研究五年，有着丰富经验，他一下子就解决了很多我难以下手的问题。
之后我和他一起合作写中国象棋AI，最后大致完成了这个项目的工作。

象棋是一个非常复杂的游戏，任何搜索算法只要没有能够做到穷尽象棋，都不可以说是绝对准确的。
因此，我们主要使用评估函数来增加棋力，这是象棋AI的“价值观”。
另一方面，我们使用强大的搜索算法和启发算法来提升搜索深度，弥补评估函数过于粗略的缺陷。
这三种算法是棋软的核心组件。

![Chess98置换表启发部分](./article-images/chinese-chess-1.png)

![Chess98的Board部分](./article-images/chinese-chess-2.png)

![Chess98大胜象棋小巫师，这个引擎棋力还可以，普通人完全下不过，推荐每个棋软研究者都尝试挑战它](./article-images/chinese-chess-3.png)

一些有用的资源：

- ElephantEye源代码 https://github.com/xqbase/eleeye
- Xqbase文档 https://xqbase.com/
- CPW文档 https://chessprogramming.org/

## 迈出第一步：棋盘编写和着法生成

在写搜索评估之前，我们必须先设计一个合适的棋盘来为这些复杂算法打下基础。

棋盘主要用来实现类似"获取某个位置的棋子、获取所有的xx类型的棋子、检验特定局面"这些功能，可以包装成一个类，把各种功能都封装起来，调用时方便一些。

在实现这部分的时候，我是这样搞的：

### 常量定义

定义一系列常量id，用于辨认棋子类型和队伍类型，类似这样，红黑取相反数便于转换：

```cpp
using PIECEID = int;
using TEAM = int;
const PIECEID EMPTY_PIECEID = 0;
const PIECEID R_KING = 1;
const PIECEID R_GUARD = 2;
const PIECEID R_BISHOP = 3;
const PIECEID R_KNIGHT = 4;
const PIECEID R_ROOK = 5;
const PIECEID R_CANNON = 6;
const PIECEID R_PAWN = 7;
const PIECEID B_KING = -1;
const PIECEID B_GUARD = -2;
const PIECEID B_BISHOP = -3;
const PIECEID B_KNIGHT = -4;
const PIECEID B_ROOK = -5;
const PIECEID B_CANNON = -6;
const PIECEID B_PAWN = -7;
const PIECEID OVERFLOW_PIECEID = 8;
const TEAM EMPTY_TEAM = 0;
const TEAM RED = 1;
const TEAM BLACK = -1;
const TEAM OVERFLOW_TEAM = 2;
```

当然，Chess98的定义远不止这些。写到后面，你会发现你需要很多很多东西。

### 棋盘的表示法

进行一个架构，目前主流引擎（指ElephantEye一类的）是采用256长度的一维数组作为棋盘的。
不过个人认为这种表示方法没什么特别大的好处，而且缺乏直观性，我这种蒟蒻很容易写成超级屎山

我倾向于使用9*10二维数组棋盘，256棋盘对于性能可能有微弱提升，但是无关紧要。

Xqbase国际象棋章节那里提到的位棋盘表示法实现起来极其复杂（至少我认为是这样的），很容易写出bug。
而且主要是象、后的斜方向走法性能提升比较明显，中国象棋就不好说了，因此不是很推荐使用。
即使采用位棋盘，在恐怖的O3优化下也最多只有10%的性能提升。
当然水平够高的大佬可以采用这种方法。

你可以选择你认为合适的棋盘表示法，取决于个人习惯。

### 加入其他功能

Chess98的棋盘设计用的是一种“追踪棋盘变化“的思路。
它除了初始化之外，从来都不向数组里加减元素，只会对每个棋子进行标记。
比如某个棋子被吃掉了，它仍然作为一个Piece对象存在于Board中，只是它的isLive属性被标记为false而已。
尽可能减少数组长度的变动，以增加性能。

你最好把Piece作为一个对象而非数字看待，不然后面搜索的启发实现会非常麻烦，也就是说，棋盘上的5个卒是不同的对象，只是PieceID相同而已。

我的实现里还有一个Piece Index特性，棋盘在初始化时，会把传入的Pieceid Map二维矩阵array中的所有棋子读取并存到一个vector中去。
这个vector以后就不更改了。
棋子对象在这个数组中的索引，就是它的Piece Index。
这个特性在后面获取指定棋子的时候非常好用。
当然，这个策略不一定最优，可能显得相对臃肿，其他引擎应该有更好的实现。

如果读者大佬要写一个棋盘，我推荐实现这些内容：

- pieceidOn, teamOn, getPiecesByType, historyMoves这些基本的容器，装数据使用。
- doMove, undoMove, isInPalace, inCheck, hasProtector这些方法，以后写搜索的时候会十分方便。
- 一个简单的bitboard，用于加速生成车、炮的着法，理论上比你一堆for循环快很多。
  不过实测似乎性能提升在debug下明显，release O3下基本没有。你其实也可以选择不写这个。
- 还有哈希值、评估分追踪、空着裁剪这些功能，它们与Board高度相关，即使与board实现分离也得把board对象传来传去，还不如写在board里边。
- isValidMoveInSituation, isRepeated等方法，后期杀手启发、静态搜索的时候有大用。

### 代码实现

Chess98的Board类部分定义如下，看起来十分庞（shi）大（shan）：

```cpp
class Board
{
public:
 Board() = default;
 Board(PIECEID_MAP pieceidMap, TEAM initTeam);

public:
 int distance = 0;
 int vlRed = 0;
 int vlBlack = 0;
    int32 hashKey = 0;
    int32 hashLock = 0;
 std::vector<int32> hashKeyList{};
 std::vector<int32> hashLockList{};

public:
    PIECEID_MAP pieceidMap{};
    MOVES historyMoves{};
    TEAM team{};
 std::unique_ptr<Bitboard> bitboard{};
    PIECES pieces{};
 std::vector<PIECE_INDEX> redPieces{};
 std::vector<PIECE_INDEX> blackPieces{};
 std::array<std::array<PIECE_INDEX, 10>, 9> pieceIndexMap{};
 std::map<PIECEID, std::vector<PIECE_INDEX>> pieceRegistry{};

public:
 bool isKingLive(TEAM team) const { return team == RED ? getPieceReg(R_KING).isLive : getPieceReg(B_KING).isLive; }
 int evaluate() const { return team == RED ? vlRed - vlBlack + vlAdvanced : vlBlack - vlRed + vlAdvanced; };
 void doNullMove() { team = -team; }
 void undoNullMove() { team = -team; }
 bool nullOkay() const { return team == RED ? vlRed : vlBlack > 10000 + 600; }
 bool nullSafe() const { return team == RED ? vlRed : vlBlack > 10000 + 1200; }
 UINT32 getBitLineX(int x) const { return bitboard->getBitlineX(x); }
 UINT32 getBitLineY(int y) const { return this->bitboard->getBitlineY(y); }

public:
 PIECEID pieceidOn(int x, int y) const;
 TEAM teamOn(int x, int y) const;
 Piece pieceIndex(int i) const;
 Piece piecePosition(int x, int y) const;
 PIECES getAllLivePieces() const;
 PIECES getPiecesByTeam(TEAM team) const;
 Piece getPieceReg(PIECEID pieceid) const;
 PIECES getPiecesReg(PIECEID pieceid) const;
 bool isRepeated() const;
 bool hasCrossedRiver(int x, int y) const;
 bool isInPalace(int x, int y) const;
 bool inCheck(TEAM judgeTeam) const;
 bool hasProtector(int x, int y) const;

public:
 void doMove(Move move);
 void undoMove();
 void doMoveSimple(Move move);
 void undoMoveSimple();
 void initEvaluate();
 void calculateVlOpen(int& vlOpen) const;
 void vlAttackCalculator(int& vlRedAttack, int& vlBlackAttack) const;
 void initHashInfo();
 bool isValidMoveInSituation(Move move);

    // 省略...
};
```

为什么这么屎山的原因是Board类里掺杂了很多东西。
完整代码实现难以全部拿到这里，因为Chess98的棋盘实现中掺杂了评估、哈希、简易位棋盘、空着裁剪等一系列tricks，是整个项目最为庞杂的组件，长度一千行左右，占据总代码量五分之一，很难去分离出来。

不过这其实还算好的，象眼作者水平很高，他的代码里各种神秘指针和奇特位操作随处可见，比这个复杂多了。

### 着法生成

着法生成就不用说了，程序连着法都不知道怎么生成，它该怎么知道象棋的规则呢？
这部分实现也很简单。
Chess98采用了一个简单的位棋盘加速了车炮的着法生成，避免使用一大堆for循环，不过实测性能提升不大

## 踏出第二步：搜索算法

搜索算法是棋软的生命，搜索深度决定了你的棋软看得够不够远。

主流引擎主要实现几个方法（剔除了多线程搜索以后）：

- searchMain 实现迭代加深
- searchRoot 根节点
- searchPV 主要变例搜索
- searchCut 截断节点搜索
- searchQ 静态搜索

### 迭代加深

实现搜索算法，最少应该支持迭代加深。

迭代加深就是限时搜索 + 一步步加深搜索层数，假如每步棋有30个着法，你直接depth=5搜索，可能要搜索30^5个节点。
用迭代加深，你需要搜索30^1 + 30^2 + ... + 30^5个节点。

听起来更慢了，但是配合历史启发、置换表启发等tricks，性能将会有飞跃提升，远比直接搜索depth=5快。

### 根节点搜索

根节点单独作为一个搜索函数，可以方便敲代码。

直接用纯alphabeta就行了，记得每次搜完对根节点进行历史启发排序，实测更加优秀一些。

### 主要变例搜索，一种增强的Alphabeta搜索

主要变例搜索（PVS）是一种增强版的alphabeta剪枝算法，核心思想是首先用完整窗口精确搜索一条最佳路径，然后假设其他招法都不如它，用极小的窗口快速验证这一假设。
这对于性能的提升比alphabeta搜索还要高，xqbase对这种算法有详细介绍。

Chess98的搜索算法采用主要变例搜索，不过这部分不是我实现的，是大佬帮我实现的。
我难以掌握窗口的变换和边界的闪烁，只会写alphabeta。提取主要变例、防止搜索的不确定性这些东西都是难题，
超过初中生的理解范围了属于是。还好有大佬扶烂泥 😭。

如果是初学者也可以用alphabeta，照样能写出相当优秀的棋软出来，因为PVS的性能提升没有你想象的那么显著，并不是说没有PVS搜索就废了。

关于alphabeta剪枝算法：https://oi-wiki.org/search/alpha-beta/ 。

### 静态搜索

静态搜索是一种解决水平线效应的关键技术。水平线效应是一种害人的东西。

当常规的深度优先搜索到达预定深度的时候，局面可能处于激烈的动态交换（如连续的吃子、将军）状态。
此时如果直接调用评估函数就会变成弱智，引擎棋力严重下滑。
静态搜索通过强制延伸搜索，直到局面进入“相对静止”状态，从而得到更准确的估值。

可以选择只搜索吃子着法。
Chess98的选择是实现了搜索吃子着法和将军延申，在关键局面可以把搜索续命到很深的深度。

静态搜索的着法必须排序，不然性能损失极其严重。
目前主流是SEE（就是一种简易的子力交换排序，兵吃车放最前面，车砍兵放最后面，以此类推），不过经过我实测，历史启发效果也不差。

静态搜索的实现不要损耗太多性能，不然反而会降低棋力。
我记得UPlanfor大佬就是因为静态搜索没有实现的很好，然后干脆放弃了静态搜索。
这个功能对于提升棋力很重要，任何引擎最好都实现一个。

### 各种奇技淫巧

这些奇技淫巧不胜枚举，涉及到奇特复杂的处理方法甚至是统计学方法。Chess98采用了这些，可以自己去Chess Programming Wiki上搜：

- futility pruning
- multi probcut
- delta pruning
- mate distance pruning
- null move pruning（空着裁剪，高风险高回报，下文将会介绍）

## 走出第三步：启发算法

搜索如果没有启发算法就相当于白写了，启发算法是提升搜索速度的重要部分，主要有以下几种：历史启发、置换表启发、杀手启发、吃子启发。
这些东西的实现比搜索算法稍微容易些，我将一一介绍这些东西。

以下部分内容可能来自xqbase，这部分教程相当优秀，质量很难被超越。

### 历史启发

alphabeta系算法中，截断能够省去指数级大量的节点，大幅提升效率，历史启发就是基于这个定理。

历史启发是一种在博弈树搜索中优化招法排序的方法，通过记录不同招法在过往搜索中的表现，引导搜索引擎优先尝试“历史上”更可能引发剪枝的“好招”。
以前发生了截断的着法，这次也很有可能发生截断。

实现一个历史启发很简单，我都能轻易实现。只需要：

- 维护一个历史表：
  大部分人采用二维数组 history[from][to]或 history[side][from][to]记录从棋盘from格走到to格的招法在搜索中获得的“奖励”。
  这里的“奖励”机制则各有各的理了，有的认为是depth的平方，越深越牛逼；有的认为是斐波那契数列才合适；还有的人觉得用2的depth次方好一点。
- 奖励机制：当一个招法在搜索中产生了截断（即score >= beta，引发了β剪枝），就认为它是一个“好招”，对其历史表项增加奖励。
  奖励值与搜索深度正相关（引发深层剪枝的招法价值更高）。
- 排序应用：在非PV节点、非战术招法（如吃子、将军）的“安静招法”阶段，按照历史表值从高到低对招法进行排序。
  值高的招法（即历史上表现好的招法）将被优先搜索。

![Chess98的历史启发实现](./article-images/chinese-chess-4.png)

### 杀手启发

杀手启发和历史启发形成互补，历史启发记录长期的、全局的优先度，杀手启发只记录短期的经验。

杀手启发是基于这样一个思想，搜索某个结点时首先尝试着法a1，由a1的后续着法b1产生截断，回到原来的结点时再搜索a1的兄弟结点a2时，
如果b1仍旧是a2的后续着法，那么b1很有可能也会产生截断。其实就是和历史启发思想差不多。

大多数程序会为每层分配2个杀手着法，并采用先进先出的方式管理（太多杀手着法会对性能造成反向优化）。

类似这样：

if (CutMove != KillerMoves[Ply][0]) {
　KillerMoves[Ply][1] = KillerMoves[Ply][0];
　KillerMoves[Ply][0] = CutMove;
}

实现同样非常简单，一点也没有搜索部分复杂。

![Chess98的杀手启发实现](./article-images/chinese-chess-5.png)

### 吃子启发

吃子启发更简单，就是优先搜索吃子着法。理论上来讲吃子着法比平常的着法更有可能引起截断，大幅提升性能。

不过Chess98把吃子启发删掉了，可能是我的吃子启发实现的并不很好，我删掉了性能反而提升了。你也可以对比一下试试，我直到现在都感觉奇怪。

### 置换表启发

置换表启发的实现有一定难度，分为置换表分数和置换表着法，优秀的置换表启发对于搜索性能有大幅提升，不过有bug的置换表启发就。。。
好吧，这个东西确实不是一般地很容易写出奇奇怪怪的bug。

在迭代加深搜索中，前一次浅度搜索的结果对于下一次深度搜索具有极高的参考价值。
置换表存储了之前搜索过的局面的信息（最佳招法、估值、深度等），这些信息可以直接用来提升当前搜索的效率。

置换结点可以引向以前搜索过的子树上，置换表可以用来检测这种情况，从而避免重复劳动。如果某个着法以后的局面已经搜索过了，那就没有必要再搜索它以后的局面了。

在Alpha-Beta搜索中，你很少能得到搜索结点的准确值。
Alpha和Beta的存在有助你裁剪掉没有用的子树，但是用Alpha-Beta有个小的缺点，你通常不会知道一个结点到底有多坏或者有多好，你只是知道它足够坏或足够好，从而不需要浪费更多的时间。
对此，Chess98用的是vlAlpha, vlBeta, vlExact这种记录方式~

这部分的实现也不是我写的，实在太难了，小鸟巡航大佬大学捣鼓了一段时间，也是改了好几次才没有神秘小bug的，
要是我来写我恐怕要疯掉，所以我也很难介绍太多，可以参考xqbase的基本搜索方法--置换这一章节，但是它讲的也像听天书。

![Chess98的置换表启发部分实现](./article-images/chinese-chess-6.png)

## 跨出第四步：评估算法

评估是棋软的超级超级核心代码，它决定了你的棋软究竟是智障还是脑瘫（不对...）。

### 经典矩阵评估

棋软通常采用的是是矩阵评估，配合对于局面形势的检测（开局、中局、残局）切换所用矩阵，然后针对特殊情况（中炮、沉底炮等）特殊减分之类的。

这部分内容如果是矩阵实现，那可以借鉴一下其他引擎怎么写的，自己重复造轮子太麻烦了。

### NNUE神经网络评估

另外一种实现是NNUE神经网络训练，用反复的训练来提升评估准确值。
这部分内容我还没有涉及，无法给出准确介绍。
而且这个东西对于模型设计等要求似乎不低。

我们之前其实是尝试写过NNUE的，我跑谱器（生成训练样本的工具）都写好了，跑了40个G的json文件，小鸟巡航大佬处理PyTorch。
但是最后因为模型架构困难，我又对这方面完全一摸黑，所以没有成功。

![Chess98的部分评估实现](./article-images/chinese-chess-7.png)

## 最后第五步：实现通信协议

实现一个通信协议（如UCCI协议）可以让大家通过界面来使用你的棋软，写完了通信协议就完结撒花啦~

### UCCI和手工界面

Chess98早期是采用了Node和Vue来做服务器和界面的（我是写前端出身的），后面项目大致完成后，我自己写了一个十分简易的UCCI协议，主打一个能用就行（滑稽）。

目前我们仍然同时保留这两种方式下棋，我懒得改那个依赖旧版界面的自动测试工具了。

### 自动测试工具

我还用selenium写了一个测试工具，基于xiangqi.com，可以自动让Chess98和里面的人机下棋，这样可以直接感知Chess98的棋力了。
现在和九级人机（基于皮卡鱼）打能做到赢得多输得少，我感觉已经很不错了。

## 留在最后

项目历时两年，主要是我要上学，小鸟巡航大佬要上班，于是我们都磕磕绊绊断断续续地写，写的很慢，不过最后总算写完了。

他从大学开始就在研究怎么写一个象棋AI了，技术很强，代码相当厉害，但是一个人没有毅力写下去，因为很多bug定位非常烦人（我深有体会哈哈），总是积重难返最后删项目，搞了五年也没搞成功；
我当时只是一个蒟蒻初中生（现在也才高一），数学基础代码经验都很弱，没有他的帮助，我最后应该也是烂尾。
还好我们遇见了，最后共同完成了这个项目Chess98。

满天繁星不负缘，由衷地庆幸能在coding道路上遇见一个志同道合的人。

今天是2026年1月1日，祝大家新的一年里万事顺利，新年快乐！
