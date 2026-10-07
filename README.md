# 享佳智能坐席知识库管理台

独立的 Vue 3 + TypeScript + Vite 浏览器管理台，用于管理租户知识库、文档处理、OCR 校正、发布回滚、检索诊断和操作审计。

## 安全边界

- 登录由 Knowledge Service 代理 SSPX认证。
- 浏览器只持有 HttpOnly 会话 Cookie，不在 LocalStorage、SessionStorage 或 JavaScript 中保存访问令牌。
- 所有写请求先获取 CSRF Token，并携带独立 `X-Request-Id`。
- 系统管理员固定使用身份所属租户；超级管理员必须显式选择目标租户。

## 本地运行

Knowledge Service 默认运行于 `http://127.0.0.1:8084`：

```powershell
npm install --legacy-peer-deps
npm run dev
```

如后端地址不同，在 `.env.local` 中配置：

```properties
KNOWLEDGE_API_TARGET=http://127.0.0.1:8084
```

浏览器访问 `http://127.0.0.1:5174`。Vite 仅在开发期代理 `/api/**`；生产环境应由 Gateway 将管理台与 Knowledge Service 放在同源路径下。

## 质量检查

```powershell
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

首次运行 Playwright 时可执行：

```powershell
npx playwright install chromium
```
