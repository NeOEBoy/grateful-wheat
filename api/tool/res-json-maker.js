
// // 与前端约定的响应数据格式
// interface ResponseStructure {
//     success: boolean; // if request is success
//     data?: any; // response data
//     errorCode?: number; // code for errorType
//     errorMessage?: string; // message display to user
//     showType?: number; // error display type： 0 silent; 1 message.warn; 2 message.error; 4 notification; 9 page
//     traceId?: string; // Convenient for back-end Troubleshooting: unique request ID
//     host?: string; // onvenient for backend Troubleshooting: host of current access server
// }

// // 错误处理方案： 方案1，方案2
// enum ErrorShowType {
//     SILENT = 0,
//     WARN_MESSAGE = 1,
//     ERROR_MESSAGE = 2,
//     NOTIFICATION = 3,
//     REDIRECT = 9,
// }

// // 1xx	消息
// // 2xx	成功
// // 3xx	重定向
// // 4xx	前端原因引起的错误
// // 5xx	服务器原因引起的错误
// // 错误类型：类型1，类型2...
// // 4xx代表前端发生了错误，5xx代表后端发生了错误
// enum ErrorType {
//     // 表示其他错误，就是4xx都无法描述的前端发生的错误
//     BadRequest = 400,
//     // 表示认证类型的错误
//     Authentication = 401,
//     // 表示授权的错误（认证和授权的区别在于：认证表示“识别前来访问的是谁”，而授权则是“赋予特定用户执行特定操作的权限”） 
//     Authorization = 403,
//     // 表示访问的数据不存在
//     NotFound = 404,
//     // 表示可以访问接口，但是使用的HTTP方法不允许
//     MethodNotAllowd = 405,
//     // 表示API不支持前端指定的数据格式
//     NotAcceptable = 406,
//     // 表示前端发送的请求到服务器所需的时间太长
//     RequestTimeout = 408,
//     // 表示资源发生了冲突，比如使用已被注册邮箱地址注册时，就引起冲突
//     Confilct = 409,
//     // 表示访问的资源不存在。不单表示资源不存在，还进一步告知该资源该资源曾经存在但目前已消失
//     Gone = 410,
//     // 表示请求的消息体过长而引发的错误
//     RequestEntityTooLarge = 413,
//     // 表示请求的首部过长而引发的错误
//     RequestURITooLarge = 414,
//     // 表示服务器端不支持客户端请求首部Content-Type里指定的数据格式
//     UnsupportedMediaType = 415,
//     // 表示无法提供Range请求中的指定的那段包体
//     RangeNotSatisfiable = 416,
//     // 表示对于Expect请求头部期待的情况无法满足时的响应码
//     ExpectationFailed = 417,
//     // 表示服务器认为这个请求不该发给它，因为它没能力处理
//     MisdirectedRequest = 421,
//     // 表示服务器拒绝基于当前HTTP协议提供服务，通过Upgrade头部告知客户端必须升级协议才能继续处理
//     UpgradeRequired = 426,
//     // 表示用户请求中缺失了条件类头部，例如If-Match
//     PreconditionRequired = 428,
//     // 表示客户端发送请求的速率过快
//     TooManyRequests = 429,
//     // 表示请求的HEADER头部大小超出限制
//     RequestHeaderFieldsTooLarge = 431,
//     // 表示由于法律原因不可访问
//     UnavailableForLegalReasons = 451,
//     // 表示服务器内部错误，且不属于以下错误类型
//     InternalServerError = 500,
//     // 表示服务器不支持实现请求所需要的功能
//     NotImplemented = 501,
//     // 代理服务器无法获取到合法资源
//     BadGateway = 502,
//     // 服务器资源尚未准备好处理当前请求
//     ServiceUnavailable = 503,
//     // 表示代理服务器无法及时的从上游获得响应
//     GatewayTimeout = 504,
//     // 表示请求使用的HTTP协议版本不支持
//     HTTPVersonNotSupported = 505,
//     // 表示服务器没有足够的空间处理请求
//     InsufficientStorage = 507,
//     // 表示访问资源时检测到循环
//     LoopDetected = 508,
//     // 表示代理服务器发现客户端需要进行身份验证才能获得网络访问权限
//     NetworkAuthenticationRequired = 511,
// }

const makeSuccessResJson = (
    data,
    total,
    errorCode,
    errorMessage,
    showType,
    traceId,
    host) => {
    let resJson = {
        success: true,
        data: data,
        total: total,
        errorCode: errorCode,
        errorMessage,
        showType: showType,
        traceId: traceId,
        host: host
    }
    return resJson;
}

// const makeFailResJson = (
//     errorCode?: number,
//     errorMessage?: string,
//     showType?: ErrorShowType,
//     traceId?: string,
//     host?: string): ResponseStructure => {
//     let resJson = {
//         success: false,
//         errorCode: errorCode,
//         errorMessage: errorMessage,
//         showType: showType,
//         traceId: traceId,
//         host: host
//     }
//     return resJson;
// }

module.exports = { makeSuccessResJson };
