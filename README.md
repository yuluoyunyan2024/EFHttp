## EFHttp

esay for http ( ^_^ )

- 在 fetch 的基础上做加法
- 简单易用且JSDoc充足
- 拦截器协助实现关注点分离
- 超轻量级利好低带宽环境
- 不支持进度条！
- 仅浏览器环境可用！

## 安装

```
npm i efhttp
```

## 基础使用

```javascript
// 最简请求
const res = await request("https://example.com");

// 若配置了baseUrl="https://example.com"
const res = await request("note");  // https://example.com/note

// 查询参数（用于构建查询参数，若url字符串中包含“?”则忽略此项。）
const res = await request("https://example.com/note",{ params: { page:5, pageSize:20}})  // https://example.com/note?page=5&pageSize=20

// 完整请求（参数在fetch的基础上扩展）
const res = await request(url, {
    attributionReporting,
    body,
    browsingTopics,
    cache,
    credentials,
    duplex,
    headers,
    integrity,
    keepalive,
    method,
    mode,
    priority,
    privateToken,
    redirect,
    referrer,
    referrerPolicy,
    signal,
    params  // 扩展参数
});
```

## 全局配置

```javascript
// 配置基础url
request.globalConfig.baseUrl = "http://demo.com";

// 配置请求头（调用时传递的同名key优先级更高）
request.globalConfig.headers.append("Authorization", "token");

// 配置超时取消发送（单位是毫秒）
request.globalConfig.timeout = 2000;

// 添加拦截器（先添加先调用）
request.globalConfig.requestInterceptor.add(interceptorName1,fulfilledHandler1, rejectedHandler1 )
    .add(interceptorName2,fulfilledHandler2, rejectedHandler2 )
    .add(interceptorName3,fulfilledHandler3);

// 移除拦截器
request.globalConfig.responseInterceptor.remove(interceptorName1).remove(interceptorName2);
```