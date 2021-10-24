/**
 * 提供缓存功能
 */
 const NodeCache = require("node-cache");
 const customCache = new NodeCache({
   stdTTL: (7200 - 120), // 缓存过期时间
   checkperiod: 120 // 定期检查时间
 });
 
 // 设置缓存
 let setCache = function (key, value) {
   customCache.set(key, value);
 };
 
 // 获取缓存
 let getCache = function (key) {
   return customCache.get(key);
 };
 
 module.exports = {
   setCache,
   getCache
 }
 