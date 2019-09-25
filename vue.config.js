// 1. vue.config.js作用：默认vue脚手架配置项不满足我们的需求，我们创建vue.config.js在里面写配置，覆盖默认的配置项（自定义）
//我们有两个阶段：开发 上线 这二个阶段目标不一样 编译在内存当中
//两个阶段不共用同一个main.js主模块文件 main-prod.js main-dev.js
//vue脚手架默认把main.js当成是模块的入口文件
// configWebpack
// chainWebpack
//通过config拿到vue脚手架内部的各种配置项
module.exports = {
  chainWebpack: function(config) {
    //写代码阶段 development
    config.when(process.env.NODE_ENV == 'development', function(config) {
      //application 应用程序
      config
        .entry('app')
        .clear()
        .add('./src/main-dev.js')
    })
    //上线 production
    config.when(process.env.NODE_ENV == 'production', function(config) {
      //application 应用程序
      config
        .entry('app')
        .clear()
        .add('./src/main-prod.js')
    })
  },
}