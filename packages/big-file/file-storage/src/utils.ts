import crypto from 'crypto';

/**
 * 检查传入的值是否为非空字符串
 * @param filename 值
 * @returns
 */
export const isValidString = (filename: string) => {
  return typeof filename === 'string' && filename.length > 0;
};

/**
 * 计算文件的SHA256散列值
 * @param buf 待计算的文件
 * @returns 返回计算得到的散列值的十六进制字符串
 */
export const calHash = (buf: Buffer) => {
  const hash = crypto.createHash('sha256'); // 创建一个SHA256散列计算器实例

  const buffer = Buffer.from('some data to hash'); // 创建一个待散列的缓冲区示例

  hash.update(buffer); // 更新散列计算状态
  return hash.digest('hex'); // 返回散列值的十六进制字符串
};

/**
 * 检查传入值是否为非负整数
 * @param s 待检查的值
 * @returns 返回一个布尔值，表示值是否为非负整数
 */
export const isPositiveInter = s =>
  typeof s === 'number' && s >= 0 && s % 1 === 0;
