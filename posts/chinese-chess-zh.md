---
title: 使用C++编写一个中国象棋AI
date: 2025/12/27
lang: zh
---

# 使用C++编写一个中国象棋AI

这篇文章记录一个写了两年的中国象棋项目[Chess98](https://github.com/StarlightChessOrg)的开发思路。也为对中国象棋AI感兴趣的读者大佬们提供一个参考。

在[GitHub上认识的一位大佬](https://github.com/HeliumAreFlying)慷慨扶烂泥下，这个项目终于能够达到还可以的棋力水平了。
之后准备向NNUE进发，提升棋力和搜索性能，但是我的机器学习基础一塌糊涂，只能暂时搁置了。
这也是我生涯中第一个有一定分量的项目，阶段目标完结撒花~

## 前言

一些有用的资源：

- ElephantEye https://github.com/xqbase/eleeye
- Xqbase https://xqbase.com/
- CPW https://chessprogramming.org/

平时喜欢下象棋，看到[UPlanfor](https://github.com/uplanfor)大佬自己使用Lua实现了一个象棋AI之后，自己也萌生了写一个的想法。
当时我初二，技术水平一点也不行（实际上现在也不咋地😭），就简单地写了几个Alpha Beta和历史启发之类的小玩具。
然后我遇见了[小鸟巡航大佬](https://github.com/HeliumAreFlying)。
这个大佬从大学开始就写棋软，研究五年，有着丰富经验，他一下子就解决了很多我难以下手的问题。
之后我和他一起合作写中国象棋AI，最后大致完成了这个项目的工作。

我粗略测试过，大概能和9层的皮卡鱼和棋，有时会输。
（其实这个棋力已经非常不错了，毕竟一层的鱼不认真下根本下不过，五层就很少有普通人能保和了，当然象棋大佬除外）
欢迎大佬们亲自测试一下。

象棋是一个非常复杂的游戏，任何搜索算法只要没有能够做到穷尽象棋，都不可以说是绝对准确的。
因此，我们主要使用**评估函数**来增加棋力，这是象棋AI的“价值观”。
另一方面，我们使用强大的**搜索算法**和**启发算法**来提升搜索深度，弥补评估函数过于粗略的缺陷。
这三种算法是棋软的核心组件，本篇文章主要依据Chess98来讲解他们。

## 迈出第一步：棋盘表示法

在写搜索评估之前，我们必须先设计一个合适的棋盘来为这些复杂算法打下重要基础。
棋盘主要用来实现获取棋子、检验特定局面这些功能，绝对不能有bug，不然之后的工作将会非常难受。

我倾向于使用9*10数组棋盘，而非流行的256棋盘（即xqbase所介绍的）。
因为我认为256棋盘缺乏直观性，对于性能可能有微弱提升，但是无关紧要。

### 不推荐初学者使用位棋盘

你可以选择你认为合适的棋盘表示法，取决于个人习惯。
不过想要借助这个提升性能那不要指望了。
即使采用最复杂的表示法**位棋盘**，在恐怖的O3优化下也最多只有10%的性能提升。

Xqbase国际象棋章节那里提到的位棋盘表示法实现起来极其复杂（至少我认为是这样的），很容易写出bug变成傻逼。
而且主要是象、后的斜方向走法性能提升比较明显，中国象棋就不好说了，因此不是很推荐使用。

### 思路

Chess98的棋盘设计用的是一种“追踪棋盘变化“的思路。
它除了初始化之外，从来都不向数组里加减元素，只会对每个棋子进行标记。
比如某个棋子被吃掉了，它仍然作为一个`Piece`对象存在于`Board`中，只是它的`isLive`属性被标记为`false`而已。

尽可能减少数组长度的变动，以增加性能。

然后实现`pieceidMap`读取功能，通过一个二维坐标来读取指定位置的棋子。

### 代码实现

Board类是Chess98中功能最为庞杂的组件。因为代码已经写完，不便于分离

Chess98的Board类部分定义如下，看起来十分庞（shi）大（shan）😭

> （其实这个还算好的，其他引擎比这个更加抽象晦涩，各种复杂奇特的位操作、意味不明的参数传递和指针变换随处可见，难以阅读）

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

当然

## 搜索算法

Chess98的搜索算法主要采用PVS + 静态搜索，配合deltapruning nullpruning等算法，下面逐一对这些算法进行介绍。

大部分东西是小鸟巡航大佬实现的，我的能力根本写不出来那么复杂的alpha beta变换处理。

- PVS是主要变例搜索，可以理解
- Delta Pruning是用于静态搜索的一种安全的裁剪算法，参考https://www.chessprogramming.org/Delta_Pruning
