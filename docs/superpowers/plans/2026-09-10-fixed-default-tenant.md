# Default Tenant Switching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 登录后直接进入业务页面，并根据账号的最高权限决定是否允许切换租户。

**Architecture:** Pinia 租户 Store 根据完整角色集合计算租户上下文：超级管理员默认租户 1并可切换，系统管理员固定所属租户。现有 API 通过 `useTenantId()` 自动继承当前租户。

**Tech Stack:** Vue 3、TypeScript、Pinia、Vitest、Vue Test Utils

---

### Task 1: 按最高权限生成租户上下文

**Files:**
- Modify: `src/stores/tenant.test.ts`
- Modify: `src/stores/tenant.ts`

- [ ] **Step 1: Write the failing test**

断言多角色账号只要包含超级管理员角色即可从默认租户 1切换；系统管理员固定身份租户。

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/stores/tenant.test.ts`
Expected: FAIL，因为当前 Store 对所有角色都固定使用租户 1且没有切换能力。

- [ ] **Step 3: Write minimal implementation**

租户 Store 根据 `auth.isSuperAdmin` 决定使用可切换租户或身份租户，并保留登录后无需选择的行为。

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/stores/tenant.test.ts`
Expected: PASS

### Task 2: 在顶部提供超级管理员租户切换

**Files:**
- Create: `src/layouts/AdminLayout.test.ts`
- Modify: `src/layouts/AdminLayout.vue`

- [ ] **Step 1: Write the failing test**

使用同时拥有系统管理员和超级管理员角色的身份挂载布局，断言默认显示“享佳健康”，点击切换后展示只含一个租户的下拉菜单。

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/layouts/AdminLayout.test.ts`
Expected: FAIL，因为当前布局使用居中弹窗和手工租户 ID 输入框。

- [ ] **Step 3: Write minimal implementation**

超级管理员点击租户标识后在按钮下方展开租户菜单；系统管理员保持只读标识，不恢复登录后的租户选择页。

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
