---
title: "重新理解 Feign 动态代理：从接口方法到 HTTP 调用"
description: "沿着 ReflectiveFeign 的代理创建与方法分发表，梳理声明式接口背后的调用入口。"
publishedAt: 2026-10-03
category: Spring
tags: ["Java", "Feign", "动态代理"]
draft: true
---

## 接口为何能够被调用

Feign 的接口没有业务实现类，运行时调用入口由代理提供。ReflectiveFeign 创建接口对应的方法处理器映射，再通过 InvocationHandlerFactory 创建调用处理器，最终使用 JDK 的 Proxy.newProxyInstance 返回代理对象。

## 代理只负责分发

FeignInvocationHandler 对 equals、hashCode、toString 做特殊处理，其余方法根据 Method 查找处理器并调用。理解这张分发表，有助于将“接口代理创建”和“请求执行”两个阶段分开定位。

```text
接口方法 → InvocationHandler → MethodHandler → 请求执行
```

默认接口方法另有处理逻辑，不能简单当作远程请求。阅读项目时，应对照实际依赖版本跟踪处理器实现，再确认编码、客户端和解码环节。

## 阅读范围

这是一篇官方源码阅读摘要，尚未包含具体项目的调试过程或性能结论。下一步可在实际项目记录代理对象、目标方法和处理器类型。

参考：[OpenFeign ReflectiveFeign 源码](https://github.com/OpenFeign/feign/blob/master/core/src/main/java/feign/ReflectiveFeign.java)。
