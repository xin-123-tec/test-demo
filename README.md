# GitHub Blog Homepage

这是一个可直接部署到 GitHub Pages 的个人博客主页模板，包含：

- 个人简介卡片
- 独立“项目栏目”
- 每个项目的访问链接
- 响应式布局（支持手机和电脑）

## 本地预览

双击 `index.html` 可以直接打开，或使用本地服务：

```bash
python -m http.server 5500
```

浏览器访问：`http://localhost:5500`

## 同步到 GitHub（首次）

在 `d:/cursor_workspace` 目录执行：

```bash
git init
git add .
git commit -m "feat: create personal GitHub blog homepage"
git branch -M main
git remote add origin https://github.com/H3a21/H3a21.github.io.git
git push -u origin main
```

## 启用 GitHub Pages

1. 进入仓库 `Settings` -> `Pages`
2. `Build and deployment` 选择 `Deploy from a branch`
3. `Branch` 选择 `main / (root)` 并保存
4. 等待 1-3 分钟后访问：`https://h3a21.github.io/`

## 后续更新

每次修改后执行：

```bash
git add .
git commit -m "update blog content"
git push
```
