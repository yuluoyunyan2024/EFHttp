/**
 * 全局配置，优先级小于使用时传递的同名参数
 * @type {{baseUrl: string, headers: Headers, requestInterceptor: InterceptorManager, responseInterceptor: InterceptorManager, timeout: number}}
 */
const globalConfig = {
    baseUrl: "",
    headers: new Headers(),
    requestInterceptor: new InterceptorManager(),
    responseInterceptor: new InterceptorManager(),
    timeout: 2000, // 毫秒
};

class InterceptorManager {
    /**
     *
     * @type {[]}
     */
    #interceptors = [];

    /**
     * 添加拦截器
     * @param {Function} fulfilledHandler - 成功回调，接收当前值，返回新值或 Promise
     * @param {Function|undefined} [rejectedHandler] - 失败回调，
     * @param {string} [name] - 拦截器唯一名称
     * @returns {Function} 移除该拦截器的函数
     */
    add(fulfilledHandler, rejectedHandler, name) {
        if (typeof fulfilledHandler !== 'function') {
            throw new Error('fulfilledHandler类型是Function');
        }
        if (rejectedHandler !== undefined && typeof rejectedHandler !== 'function') {
            throw new Error('rejectedHandler类型是Function|undefined');
        }
        if (name !== undefined && this.#interceptors.some(i => i.name === name)) {
            throw new Error(`拦截器名称已存在`);
        }

        /**
         *
         * @type {{name: string, fulfilledHandler: Function, rejectedHandler: Function}}
         */
        const interceptor = {name, fulfilledHandler, rejectedHandler};
        this.#interceptors.push(interceptor);
    }

    /**
     * 删除拦截器
     * @param {string} interceptorName 拦截器名称
     * @returns {InterceptorManager} 是否成功删除
     */
    remove(interceptorName) {
        let index = this.#interceptors.findIndex(i => i.name === interceptorName);
        if (index !== -1) {
            this.#interceptors.splice(index, 1);
        }
        return this;
    }

    /**
     * 清空所有拦截器
     */
    clear() {
        this.#interceptors = [];
    }

    /**
     * 执行拦截器链
     * @param {any} initialValue - 初始值
     * @returns {Promise<any>} 最终值
     */
    async run(initialValue) {
        let value = initialValue;
        for (const {fulfilledHandler, rejectedHandler} of this.#interceptors) {
            try {
                value = await fulfilledHandler(value);
            } catch (error) {
                if (rejectedHandler) {
                    value = await rejectedHandler(error);
                } else {
                    throw error;
                }
            }
        }
        return value;
    }

    /**
     * 调试：打印当前拦截器列表
     */
    log() {
        console.log(this.#interceptors);
    }
}

/**
 * 发送请求
 * @param {string|URL} url - 请求地址（绝对或相对）
 * @param {Object} options - fetch的参数及扩展参数，详见README
 * @returns {Promise<any>} 响应拦截器处理后的数据
 */
export default async function request(url, options) {
    // 防止被new
    if (new.target) {
        throw new Error('request is not a constructor');
    }

    // 配置合并
    const currentConfig = {
        url,
        ...options
    };

    // 应用默认配置baseUrl
    if (globalConfig.baseUrl) {
        if (!currentConfig.url.startsWith('http://') && !currentConfig.url.startsWith('https://')) {
            currentConfig.url = new URL(currentConfig.url, globalConfig.baseUrl).href;
        }
    }
    // 拼接查询参数
    if (!currentConfig.url.includes("?") && currentConfig.params) {
        let searchParams = new URLSearchParams(currentConfig.params);
        currentConfig.url = currentConfig.url.concat("?" + searchParams);
    }


    // 应用默认配置headers
    currentConfig.headers = new Headers(currentConfig.headers);
    globalConfig.headers.forEach((value, key) => {
        if (!currentConfig.headers.has(key)) {
            currentConfig.headers.set(key, value);
        }
    });

    // 执行请求拦截器链
    await globalConfig.requestInterceptor.run(currentConfig);

    // 超时取消
    const controller = new AbortController();
    currentConfig.signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), globalConfig.timeout);

    let response;
    try {
        response = await fetch(currentConfig.url, currentConfig);
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }

    // 执行响应拦截器链
    return await globalConfig.responseInterceptor.run(response);
}

// 挂载全局配置属性
request.globalConfig = globalConfig;
// 防止外部增减属性
Object.freeze(request);