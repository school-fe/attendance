import React, { Component } from 'react';
import { Carousel } from 'antd';

export default class Banner extends Component {
  static displayName = 'Banner';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  slides = [
    {
      url: require('./images/01.jpg'),
      text: '1',
    },
    {
      url: require('./images/02.jpg'),
      text: '2',
    },
    {
      url: require('./images/03.jpg'),
      text: '2',
    },
  ];

  render() {
    return (
      <div style={style.introBannerWrapStyles}>
        <Carousel autoplay>
          {this.slides.map((item, index) => (
            <div key={index} className="slider-img-wrapper">
              <img src={item.url} alt={item.text} />
            </div>
          ))}
        </Carousel>
      </div>
    );
  }
}

const style = {
  introBannerWrapStyles: {
    width: '100%',
    height: '1440px',
    overflow: 'hidden',
  },
};
