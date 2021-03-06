import React from 'react';

const styles = {
  footer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: '0',
    right: '0',
    bottom: '20px',
  },
  copyright: {
    fontSize: '13px',
    color: 'rgba(0, 0, 0, .45)',
    lineHeight: 1.5,
    textAlign: 'right',
  },
};

export default () => (
  <div style={styles.footer}>
    <div style={styles.copyright}> © 2018 版权所有</div>
  </div>
);
