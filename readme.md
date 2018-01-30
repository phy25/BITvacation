# BITvacation 理工放假啦

北京理工大学非官方假期服务安排聚合查询。采用 [Webpack](https://webpack.js.org) 技术构建，时间线用的 [vis 库](http://visjs.org)，通过 [offline-plugin](https://github.com/NekR/offline-plugin) 插件支持 Service Worker 离线操作，支持 Chrome 保存到主屏幕，Travis CI 自动进行基本测试与部署。

Deployed at https://seethediff.cn/BITvacation/

测试状态：Master [![Master Build Status](https://travis-ci.org/phy25/BITvacation.svg?branch=master)](https://travis-ci.org/phy25/BITvacation) Develop [![Develop Build Status](https://travis-ci.org/phy25/BITvacation.svg?branch=develop)](https://travis-ci.org/phy25/BITvacation)

## 如何玩耍

请先确保本地安装了 `nodejs`。通过 Git 拉取仓库或者解压代码压缩包后，

```bash
$ npm install
$ npm run start
```

安装好依赖（`npm install`）之后就可以玩了。webpack.conf.js 中配置了两组参数，建议本地开发。`npm run start` 会启动 webpack 中自带的调试服务器，非常方便，自动测试也是基于调试参数编译的结果进行的。

配置也集成了 production 的生成参数（`npm run build`），文件生成到 dist 文件夹下，会被自动分到两台服务器的路径下，并对应配置好 publicPath。`npm run deploy` 可以部署，然而需要提前设置账号密码的环境变量，这些只有 Owner 和 CI 才有。正常不建议本地执行 deploy 命令。

所有的开发类文件在 src 文件夹下面，其中 \*.ejs 是数据，如果哪里有错可以在那里面改。自动测试的文件配置在 tests 下（采用的 CasperJS + PhantomJS，目前只是简单地测试网页能否正常加载而已）。

## 贡献规范

开 issue 的注意事项：issues 不是留言板，没问题别在上面发留言；私人问题请邮件交流，对我而言 issues 跟邮件的优先级是基本一致的。

1. Fork 后的 commit message 中英文均可（建议英文），如果无意义可能会在合并时被修改；
2. 发 Pull Request（到 develop 分支），并进行一轮友好交流；
3. 等待合并（合并后的事项与开发流程一致）和部署。

## 开发规范（所有协作者适用）

1. master 分支为线上版本，**已在 GitHub 开启分支保护**，任何新功能请先合并到 develop 分支，CI 测试通过后再 push 或 merge 到 master 分支；如果是较为复杂的功能请另开分支开发，避免与其它分支冲突（可以直接在这个项目下开自己的分支，不需要在 fork 下操作）。
2. 较为复杂的功能在有需要时可开 Pull Request 进行交流，再 merge 到 develop 分支；
3. master 分支的所有 commit 会在 CI 测试通过后，进行自动部署。