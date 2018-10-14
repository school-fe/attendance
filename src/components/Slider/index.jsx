import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

let sliderObj = null;

class Slider extends PureComponent {
  initSliderView = () => {
    const { onSuccess, onClose, options } = this.props;
    const opts = {
      ele: 'h5_slide', // 验证码容器（id名称）
      host: 'https://verify.snssdk.com', // 主机 线上
      // host: 'http://10.8.121.119:6789', //主机 测试
      aid: '1128', // appid   1128 都应
      lang: 'zh',
      app_name: 'aweme',
      challenge_code: '1105',
      toolbarBackColor: '#fff', // 标题栏背景色
      promptBackColor: '#F0F0F0', // 滑动槽背景色
      promptFontColor: '#808080', // 滑动说明文案字体颜色
      refreshFontColor: '#FE2C55', // ”刷新“字体文案颜色
      refreshIconColor: '#FE2C55', // 刷新图片颜色
      validatePassBackColor: '#A0CC49', // 验证通过背景颜色
      validateFailBackColor: '#EB2F2F', // 验证失败背景颜色
      successCb() {
        onSuccess();
      }, // 验证成功的回调
      errorCb() {
        onClose();
      }, // 验证失败手动关闭验证码的回调
      ...options,
    };
    /* eslint-disable */
    if (SliderVerification) {
      sliderObj = new SliderVerification(opts);
      /* eslint-enable */
      sliderObj.init();
    } else {
      console.error('SliderVerification error');
    }
  };

  componentDidMount() {
    this.initSliderView();
  }

  render() {
    return (
      <div style={{ backgroundColor: '#fff' }}>
        <div id="h5_slide" />
      </div>
    );
  }
}

export default Slider;

export const SliderFunc = {
  show() {
    sliderObj.show();
  },
  hide() {
    sliderObj.hide();
  },
  init() {
    sliderObj.init();
  },
};

Slider.propTypes = {
  onSuccess: PropTypes.func,
  onClose: PropTypes.func,
  options: PropTypes.object,
};

Slider.defaultProps = {
  onSuccess: () => {},
  onClose: () => {},
  options: {},
};
