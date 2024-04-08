import path from 'path';

import { bootstrap } from './app';

async function main() {
  // 解析并设置文件存储根目录为node_modules/.cache目录的绝对路径
  const fileStorageRoot = path.resolve(__dirname, '../node_modules/.cache');
  // fileStorageRoot为文件存储位置
  // 启动应用程序，监听3000端口，并设置文件存储根目录
  await bootstrap({ port: 3000 }, { fileStorageRoot });
  console.log(`Start engine at: http://localhost:3000`); // 输出启动信息
}

main(); // 执行主函数
