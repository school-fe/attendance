import { message } from 'antd';
import axios from 'axios';

const API_HOST = '';

const HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  Accept: 'application/json, text/javascript',
};

const request = (method, url, requestParams, opts) => {
  const requestUrl = `${API_HOST}${url}`;
  if (opts.isMock) {
    /* eslint-disable */
    console.log('isMock:', requestUrl, requestParams, opts.response || {});
    /* eslint-enable */
    const { data, message } = opts.response;
    if (message === 'success') {
      return Promise.resolve(data);
    }
    if (opts.response.error_code === 0) {
      return Promise.resolve(data);
    }
    return Promise.reject(data);
  }

  return new Promise((resolve, reject) => {
    let secondParams = {};
    let thirdParams = {};
    const config = {};
    if (opts.headers) {
      config.headers = {
        ...HEADERS,
        ...opts.headers,
      };
    }
    if (method === 'get') {
      secondParams = {
        params: requestParams,
        ...config,
      };
    } else if (method === 'post') {
      secondParams = requestParams;
      thirdParams = config;
    }
    // axios#get(url[,config])   axios#post(url[,data[,config]])
    axios[method](requestUrl, secondParams, thirdParams)
      .then(res => {
        const responseData = res.data;
        resolve(responseData || {});
      })
      .catch(err => {
        if (err.response && err.response.status === 500) {
          message.error('服务器异常，请稍后重试');
        } else {
          /* eslint-disable */
          console.error(`${requestUrl}：${err}`);
          /* eslint-enable */
        }
        reject(err);
      });
  });
};

function get(url, params, opts) {
  return request('get', url, params, opts);
}

function post(url, params, opts) {
  return request('post', url, params, opts);
}

const Request = {
  get,
  post,
};

export default Request;
