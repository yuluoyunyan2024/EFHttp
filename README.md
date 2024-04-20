## EFHttp

一个肥肠简单的 Http 请求库！（使用Axios不想看文档，就自己尝试写一个，哈哈哈）

## 声明

- 仅支持 GET、POST、PUT、DELETE 请求，返回的是promise对象
- GET请求的方法没有请求体哦！
- 支持请求的默认配置
- 支持请求&响应拦截

## 安装

```
npm i efhttp
```

## 使用

```
// 仅url即可发送请求
EFHttp.get({url:"https://www.baidu.com"})


// get请求完整配置
EFHttp.get({
    url: "https://www.baidu.com",
    header:{}
})

// post请求完整配置，put、delete同理
EFHttp.post({
    url: "https://www.baidu.com",
    header:{},
    body:{}
})

// 默认配置属性
EFHttp.defaultConfig：{
    baseURL: "",        // 设置默认请求前缀
    header: {},         // 设置默认请求头
    isEncapsulationResponse: true,      // 是否使用默认配置封装响应信息（设置为false就得您老自己处理咯）
    interceptors: {
        request: [],    // 请求拦截器，这是数组嗷！执行顺序是数组头部到尾部的顺序
        response: []    // 响应拦截器，同上
    }
}


// 请求拦截器，拦截器函数会接收请求对象，包括mehtod、url、header、body
EFHttp.defaultConfig.interceptors.request.push(你的请求拦截器)

// 请求拦截器，拦截器函数会接收请求对象，包括mehtod、url、header、body
EFHttp.defaultConfig.interceptors.response.push(你的响应拦截器)
```

## 吐槽

喵的我真的服了，本来库名叫做 ESHttp，但是发布的时候发现被占了（第一次发布），被迫改名儿，嘤嘤嘤~