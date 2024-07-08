# 大文件上传

## init

``` bash
npm i -g pnpm@8.5.0 @microsoft/rush@5.110.2
rush update
```

## @demo/upload-file

需要启动两个 terminal：

``` bash
cd apps/upload-file
npm run dev
```

``` bash
cd apps/upload-file-vue
npm run dev
```

## @demo/dep-graph-cli

```bash
cd packages/dep-graph/cli
npm run dev ana ../../../common/config/rush/pnpm-lock.yaml
```
