// 配置
type NodeEnv = 'development' | 'production' | 'test'; // 运行环境（开发，生成，测试）

export const ENV: NodeEnv = (process.env.NODE_ENV || 'development') as NodeEnv; // 运行环境默认开发环境

export const SERVER_PORT = 3000; // 服务端口

export const API_FIND_FILE = '/api/file/check'; // 查找文件
export const API_FIND_DELETE = '/api/file/delete'; // 删除文件
export const API_CHUNK = '/api/chunk'; // 分片上传
export const API_MERGE_FILE = '/api/file/merge'; // 合并文件
export const SQL_NAME = 'FileDB'; // 数据库名称
export const DB_NAME = 'FileTable'; // 数据库表名称
