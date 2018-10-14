import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Header.less';

class Header extends Component {
  render() {
    const { left, right, center } = this.props;
    return (
      <div className="header-content">
        <div className="left-view">{left && <div>{left}</div>}</div>
        <div className="center-view">{center && <div>{center}</div>}</div>
        <div className="right-view">{right && <div>{right}</div>}</div>
      </div>
    );
  }
}

export default Header;

Header.propTypes = {
  left: PropTypes.object,
  right: PropTypes.object,
  center: PropTypes.object,
};

Header.defaultProps = {
  left: null,
  right: null,
  center: null,
};
