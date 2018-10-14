import 'babel-polyfill';
window.config = {};
if (process.env.NODE_ENV === 'development') {
  window.config = {
    __ENV__: 'development',
    __API_HOST__: '',
    __APP_NAME__: 'hh',
  };
} else {
  // 线上配置
  window.config = {
    __ENV__: 'production',
    __API_HOST__: '',
    __APP_NAME__: 'hh',
  };
}
