export default class EFHttp {
  constructor() {
    throw new Error(`
        ESHttp不能实例化！
        请使用get()、post()、put()、delete()静态方法发送请求；
        以及使用ESHttp.defaultConfig属性修改默认配置。
        `);
  }
  /**
   * 发送GET请求
   * @param {*} options
   * @param {String} options.url 请求地址
   * @param {Object} options.header 请求头
   * @returns promise
   */
  static get(options) {
    return EFHttp.#doHttp({
      method: "get",
      url: options.url,
      header: options.header,
    });
  }
  /**
   * 发送POST请求
   * @param {*} options
   * @param {String} options.url 请求地址
   * @param {Object} options.header 请求头
   * @param {Object} options.body 请求体
   * @returns promise
   */
  static post(options) {
    return EFHttp.#doHttp({
      method: "post",
      url: options.url,
      header: options.header,
      body: options.body,
    });
  }
  /**
   * 发送PUT请求
   * @param {*} options
   * @param {String} options.url 请求地址
   * @param {Object} options.header 请求头
   * @param {Object} options.body 请求体
   * @returns promise
   */
  static put(options) {
    return EFHttp.#doHttp({
      method: "put",
      url: options.url,
      header: options.header,
      body: options.body,
    });
  }
  /**
   * 发送DELETE请求
   * @param {*} options
   * @param {String} options.url 请求地址
   * @param {Object} options.header 请求头
   * @param {Object} options.body 请求体
   * @returns promise
   */
  static delete(options) {
    return EFHttp.#doHttp({
      method: "delete",
      url: options.url,
      header: options.header,
      body: options.body,
    });
  }
  /**
   * 默认配置
   * @type {Object}
   * @property {String} baseUrl 基础URL
   * @property {Object} header 请求头
   * @property {Boolean} isEncapsulationResponse 是否对响应数据进行封装
   * @property {Object} interceptors 请求拦截器和响应拦截器
   * @property {Array} interceptors.request 请求拦截器数组
   * @property {Array} interceptors.response 响应拦截器数组
   */
  static defaultConfig = {
    baseUrl: "",
    header: {},
    isEncapsulationResponse: true,
    interceptors: {
      request: [],
      response: [],
    },
  };
  static #readDefaultConfig(options) {
    if (EFHttp.defaultConfig.baseUrl.length !== 0) {
      options.url = `${EFHttp.defaultConfig.baseUrl}${options.url}`;
    }
    if (Object.keys(EFHttp.defaultConfig.header).length !== 0) {
      options.header = {
        ...EFHttp.defaultConfig.header,
        ...options.header,
      };
    }
  }
  static #executeInterceptor(type, options) {
    let InterceptorArr = EFHttp.defaultConfig.interceptors[type];
    if (InterceptorArr.length !== 0) {
      for (let key in InterceptorArr) {
        if (typeof InterceptorArr[key] === "function") {
          InterceptorArr[key](options);
        }
      }
    }
  }
  static #doHttp(options) {
    EFHttp.#readDefaultConfig(options);

    EFHttp.#executeInterceptor("request", options);

    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();

      let { method, url, header, body } = options;

      xhr.open(method, url, true);

      if (header) {
        for (let key in header) {
          xhr.setRequestHeader(key, header[key]);
        }
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          let response;

          if(EFHttp.defaultConfig.isEncapsulationResponse){
            response = new Response({
              status: xhr.status,
              header: xhr.getAllResponseHeaders(),
              data: xhr.response,
            });
          }

          EFHttp.#executeInterceptor("response", response);

          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response);
          } else {
            reject(response);
          }
        }
      };

      if (method === "get") {
        xhr.send();
      } else {
        xhr.send(body);
      }
    });
  }
}
/**
 * 用于生成固定格式的响应对象
 * @class Response
 * @param {Object} options
 * @param {Number} options.status 响应状态码
 * @param {String} options.header 响应头
 * @param {Object|String} options.data 响应数据
 */
class Response {
  constructor(options) {
    this.status = options.status;

    let headerPairs = options.header.trim().split("\n");
    let headerObj = {};
    for (let i = 0; i < headerPairs.length; i++) {
      let headerPair = headerPairs[i].replace(/\r/g, "").split(": ");
      let headerName = headerPair[0];
      let headerValue = headerPair[1];
      headerObj[headerName] = headerValue;
    }
    this.header = headerObj;

    this.data = JSON.parse(options.data);
  }
}