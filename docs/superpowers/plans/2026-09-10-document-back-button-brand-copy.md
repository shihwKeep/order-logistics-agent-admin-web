# 文档返回按钮与品牌副标题 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 美化文档详情页返回按钮，并将侧边栏副标题改为“知识库管理台”。

**Architecture:** 保留现有 Vue Router 导航，只给详情页返回入口增加语义化内部结构和专用 CSS。品牌文案继续由 `AdminLayout.vue` 负责，不抽取新组件。

**Tech Stack:** Vue 3、Vue Router、TypeScript、Vitest、CSS

---

### Task 1: 锁定界面行为

**Files:**
- Modify: `src/layouts/AdminLayout.test.ts`
- Create: `src/views/DocumentDetailView.test.ts`

- [x] 编写测试，要求侧边栏渲染“知识库管理台”，并要求详情页返回链接指向文档列表且使用 `back-button` 类。
- [x] 运行 `npm test -- src/layouts/AdminLayout.test.ts src/views/DocumentDetailView.test.ts`，确认测试因旧文案和缺少新样式类而失败。

### Task 2: 实现文案和返回按钮

**Files:**
- Modify: `src/layouts/AdminLayout.vue`
- Modify: `src/views/DocumentDetailView.vue`
- Modify: `src/styles.css`

- [x] 将侧边栏副标题改为“知识库管理台”。
- [x] 将返回链接拆分为箭头图标和文字，并应用 `back-button` 类。
- [x] 添加紧凑圆角按钮、悬停及 `focus-visible` 样式。
- [x] 重跑定向测试并确认通过。

### Task 3: 完整验证与提交

**Files:**
- Verify: all frontend files

- [x] 运行 `npm test`。
- [x] 运行 `npm run build`。
- [x] 检查当前开发服务仍运行在 5174 端口。
- [x] 提交并推送到 GitHub `main`。
