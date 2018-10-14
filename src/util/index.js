/**
 * @providesModule ByteUtil
 * 一些常用的工具类
 */

export { default as Request } from './Request/Request';

export const isMobile = value => /^1\d{10}$/.test(value);

export default {};
