# Fixed Default Tenant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 登录后固定进入租户 1“享佳健康”，不再出现租户选择流程。

**Architecture:** 将固定租户配置集中在 Pinia 租户 Store 中，布局只消费该状态并直接渲染业务路由。现有 API 通过 `useTenantId()` 自动继承租户 1。

**Tech Stack:** Vue 3、TypeScript、Pinia、Vitest、Vue Test Utils

---

### Task 1: 固定租户上下文

**Files:**
- Modify: `src/stores/tenant.test.ts`
- Modify: `src/stores/tenant.ts`

- [ ] **Step 1: Write the failing test**

将超级管理员和普通管理员的断言统一为租户 ID `1`、名称“享佳健康”、无需选择。

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/stores/tenant.test.ts`
Expected: FAIL，因为当前普通管理员使用身份租户，超级管理员要求选择租户。

- [ ] **Step 3: Write minimal implementation**

租户 Store 固定暴露 `targetTenantId = 1`、`targetTenantName = '享佳健康'`、`requiresSelection = false`。

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/stores/tenant.test.ts`
Expected: PASS

### Task 2: 移除选择页并展示租户名称

**Files:**
- Create: `src/layouts/AdminLayout.test.ts`
- Modify: `src/layouts/AdminLayout.vue`

- [ ] **Step 1: Write the failing test**

挂载布局并断言展示“享佳健康”，不展示“请选择目标租户”和“切换”。

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/layouts/AdminLayout.test.ts`
Expected: FAIL，因为当前布局展示“租户 1 切换”。

- [ ] **Step 3: Write minimal implementation**

移除 `TenantGate` 包裹与切换按钮，直接渲染 `RouterView`，将租户标识改为不可点击文字。

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/layouts/AdminLayout.test.ts`
Expected: PASS

### Task 3: 全量验证

**Files:**
- Verify: all frontend sources

- [ ] **Step 1: Run all tests**

Run: `npm test -- --run`
Expected: PASS

- [ ] **Step 2: Run lint and build**

Run: `npm run lint`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

提交测试、实现及设计文档，并推送到当前 GitHub 远端。

