export const device = require('./device');
export const locale = require('./locale');
export const theme  = require('./theme');

export default {
  ...device,
  ...locale,
  ...theme,
}