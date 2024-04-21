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

export default class EFHttp {
  constructor() {
    throw new Error(`ESHttp为静态类！`);
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
   * @property {Array} requestInterceptors 请求拦截器数组
   * @property {Array} responseInterceptors 响应拦截器数组
   */
  static #defaultConf = {
    baseUrl: "",
    header: {},
    isEncapsulationResponse: true,
    requestInterceptors: [],
    responseInterceptors: [],
  };
  /**
   * 默认配置代理
   * @param {Object} config 配置对象
   */
  static defaultConfig = new Proxy(EFHttp.#defaultConf, {
    // 拦截设置属性操作
    set(target, prop, value) {
      console.log("asdasd");
      let defaultConfigTypeMap = {
        baseUrl: "String",
        header: "Object",
        isEncapsulationResponse: "Boolean",
        requestInterceptors: "Array",
        responseInterceptors: "Array",
      };
      // 限制修改defaultConfig的子属性
      if (prop in target) {
        if (
          Object.prototype.toString.call(value).slice(8, -1) !==
          defaultConfigTypeMap[prop]
        ) {
          throw new Error(
            `\n\n\t${prop}是${defaultConfigTypeMap[prop]}类型的哦~\n`
          );
        }
        target[prop] = value;
        return true;
        // return Reflect.set(target, prop, value);
      } else {
        throw new Error(`\n\n您仅可对EFHttp.defaultConfig已有的子属性进行操作： \n\n${Object.keys(
          EFHttp.#defaultConf
        )
          .map((key) => {
            return "- " + key;
          })
          .join("\n")}
        `);
      }
    },
  });

  /**
   * 启动请求拦截器前，读取默认配置
   * @param {Object} options 请求参数
   */
  static #readDefaultConfig(options) {
    if (EFHttp.#defaultConf.baseUrl.length !== 0) {
      options.url = `${EFHttp.#defaultConf.baseUrl}${options.url}`;
    }
    if (Object.keys(EFHttp.#defaultConf.header).length !== 0) {
      options.header = {
        ...EFHttp.#defaultConf.header,
        ...options.header,
      };
    }
  }
  /**
   * 执行请求/响应拦截器
   * @param {String} interceptorsType 拦截器类型
   * @param {Object} options 请求参数
   */
  static #executeInterceptors(interceptorsType, options) {
    let InterceptorArr = EFHttp.#defaultConf[interceptorsType];
    if (InterceptorArr.length !== 0) {
      for (let key in InterceptorArr) {
        if (typeof InterceptorArr[key] === "function") {
          InterceptorArr[key](options);
        }
      }
    }
  }
  /**
   * 发送HTTP请求
   * @param {Object} options 请求参数
   * @returns promise
   */
  static #doHttp(options) {
    EFHttp.#readDefaultConfig(options);

    EFHttp.#executeInterceptors("requestInterceptors", options);

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

          if (EFHttp.#defaultConf.isEncapsulationResponse) {
            response = new Response({
              status: xhr.status,
              header: xhr.getAllResponseHeaders(),
              data: xhr.response,
            });
          }

          EFHttp.#executeInterceptors("responseInterceptors", response);

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

// 冻结EFHttp静态类
Object.freeze(EFHttp);
// 密封EFHttp.defaultConfig属性
Object.seal(EFHttp.defaultConfig);
