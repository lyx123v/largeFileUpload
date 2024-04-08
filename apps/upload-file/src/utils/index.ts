/**
 * 检查给定的值是否为非空字符串。
 * @param s 待检查的值。
 * @returns {boolean} 如果给定的值是非空字符串，则返回true；否则返回false。
 */
export const isValidString = s => typeof s === 'string' && s.length > 0;

/**
 * 检查给定的值是否为非负整数。
 * @param s 待检查的值。
 * @returns {boolean} 如果给定的值是非负整数，则返回true；否则返回false。
 */
export const isPositiveInter = s =>
  typeof s === 'number' && s >= 0 && s % 1 === 0;

/**
 * 检查给定的值是否为undefined。
 * @param s 待检查的值。
 * @returns {boolean} 如果给定的值是undefined，则返回true；否则返回false。
 */
export const isUndefined = s => typeof s === 'undefined';
