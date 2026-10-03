---
title: "Gateway TraceId：从日志关联到跨服务上下文传播"
description: "区分日志中的 TraceId 与真正的链路传播，整理网关和下游服务的排查顺序。"
publishedAt: 2026-10-03
category: Spring
tags: ["Gateway", "TraceId", "Observability"]
draft: true
---

## 日志标识与链路上下文

Spring Boot 使用 Micrometer Tracing 时，可以从 MDC 的 traceId、spanId 生成日志关联标识。日志能显示标识并不等同于下一次网络调用已经传播上下文。

## 从入口走到下游

排查时先选定一次请求，依次记录网关入口、出站请求和下游日志，确认它们属于同一条链路。若标识在某个边界消失，应检查该边界的客户端构造方式与上下文传播配置。

官方文档要求通过自动配置的 WebClient.Builder 等构造客户端，才能获得相应的自动传播能力。Gateway 的具体集成仍需对照所用版本与配置验证。

## 异步边界需要单独验证

响应式流水线与线程切换不能只依赖当前线程上的 MDC 值。Spring Boot 的可观测性支持通过 Context Propagation 传递当前 observation；自定义异步代码也应验证上下文是否保留。

| 检查位置 | 观察目标 |
| --- | --- |
| 入口日志 | TraceId 是否存在 |
| 出站请求 | 上下文是否被传播 |
| 下游日志 | 是否能关联到入口请求 |

本文为技术摘要，尚未记录实际 Gateway 故障与修复结果。

参考：[Spring Boot Tracing](https://docs.spring.io/spring-boot/reference/actuator/tracing.html)、[Observability](https://docs.spring.io/spring-boot/reference/actuator/observability.html)。
