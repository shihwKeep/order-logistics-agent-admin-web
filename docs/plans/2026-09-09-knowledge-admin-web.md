# 知识库管理台实施计划

## 目标

交付独立的 Vue 3 + TypeScript + Vite 浏览器管理台，并补齐管理台依赖的 Knowledge Service 查询接口。管理台复用 SSPX“快快外卖”账号体系，通过 Knowledge Service 的 HttpOnly Cookie 会话登录；浏览器不保存 bearer token 或任何 Client Secret。

## 边界与验收

- 系统管理员只能管理登录身份所属租户；超级管理员必须显式选择目标租户。
- 所有写请求携带 CSRF Header 和 `X-Request-Id`。
- 支持知识库 CRUD/启停、文档上传、版本与任务、解析/OCR 预览、人工校正、发布/回滚/停用、检索诊断和审计查询。
- 组件测试覆盖关键状态，Playwright 覆盖登录、租户选择、上传、校正、发布和检索诊断主流程。
- `npm test`、`npm run typecheck`、`npm run lint`、`npm run build` 全部通过。

## Task 1：补齐管理台后端只读接口

修改 `D:\GitCode\order-logistics-knowledge-service`：

- 增加分页审计查询 DTO、Mapper、Service、Controller，并强制复用 `TenantAccessGuard`。
- 增加文档版本 Chunk 查询，返回 Chunk 正文、标题路径、Token 数和来源位置。
- 增加受登录会话保护的源文件/解析产物预览接口，响应使用 attachment/inline 安全头，禁止公开 MinIO URL。
- 为新接口补充跨租户、普通管理员、超级管理员和分页边界测试。
- 全量 Maven 测试后提交并推送 Knowledge Service。

## Task 2：搭建管理台工程与安全 HTTP 层

在本仓库创建 Vue 3、TypeScript、Vite、Vue Router、Pinia、Vitest、Vue Test Utils、ESLint、Prettier 和 Playwright 基础工程。

- `credentials: include` 统一由 HTTP 客户端处理。
- 启动时获取 `/api/v1/admin/auth/csrf`，写请求自动携带服务端返回的 CSRF Header。
- 每次写操作生成独立 `X-Request-Id`；401 清理内存态并跳转登录，403 保留明确错误。
- 不使用 `localStorage`、`sessionStorage`、IndexedDB 或前端 Cookie 保存令牌。

## Task 3：登录、应用壳与租户上下文

- 实现快快外卖风格登录页、当前身份查询和退出登录。
- 实现顶部身份区、左侧导航、面包屑、全局消息和加载状态。
- 系统管理员固定使用自身 tenantId；超级管理员进入管理功能前必须输入并确认目标 tenantId。
- 路由守卫禁止未登录访问，普通用户禁止进入管理台。

## Task 4：知识库与文档管理

- 知识库列表、创建、编辑、启用、停用和删除确认。
- 文档列表、拖放上传、格式/大小提示、版本列表、当前草稿/发布状态。
- 处理任务阶段、重试次数、错误码、自动轮询和手动重试。

## Task 5：预览、OCR 校正与 Chunk 检查

- 左侧源文件预览；右侧解析单元和 Chunk 切换。
- 低置信度 OCR 单元醒目标记和快速筛选。
- 人工校正使用原文/有效正文对照，提交后刷新版本与任务状态。
- PDF、图片可内嵌预览；其他格式提供受权下载和解析正文定位。

## Task 6：发布、回滚、停用与检索诊断

- READY 草稿允许发布；历史可回滚版本显示二次确认；已发布文档可停用。
- 检索诊断支持 PUBLISHED/DRAFT、知识库范围、answerable、降级模式、策略版本、证据得分与召回来源。
- 操作按钮严格按后端状态显示，但后端鉴权仍是最终边界。

## Task 7：审计、可用性与浏览器验收

- 审计页按动作、资源、请求号和时间分页查询，不展示知识正文和敏感凭据。
- 补齐空态、错误态、键盘操作、移动到桌面宽度的响应式布局。
- 使用 Mock API 做稳定的 Playwright 主流程；使用真实开发代理写运行说明。
- 完整验证、代码复核、提交并推送独立 GitHub 仓库。
