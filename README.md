# Tank Battle Web Game

一个可直接在浏览器运行的经典坦克大战小游戏。

## 在线访问

启用 GitHub Pages 后，游戏会发布到：

`https://xin-123-tec.github.io/test-demo/`

> 首次部署通常需要 1-3 分钟，请稍后刷新页面。

## 本地运行

### 方式 1：直接打开

双击 `index.html` 即可运行。

### 方式 2：本地服务（推荐）

在项目目录执行：

```bash
python -m http.server 5500
```

然后打开：

`http://localhost:5500`

## 操作说明

- `W` `A` `S` `D`：移动
- `J`：发射炮弹
- `R`：重新开始

## 项目结构

- `index.html`：页面骨架和 HUD
- `style.css`：界面样式
- `game.js`：游戏循环、碰撞检测、敌方 AI

## 已实现功能

- 玩家坦克移动、射击、生命系统
- 敌方坦克随机巡逻与开火
- 墙体阻挡与子弹碰撞
- 胜利/失败结算与重开
- 实时 HUD（生命、击毁、剩余敌军）

## 部署说明（GitHub Pages）

仓库包含 `.github/workflows/deploy-pages.yml`，推送到 `main` 后会自动部署静态页面。
