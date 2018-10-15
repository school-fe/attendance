import React, { Component } from 'react';
import { Carousel } from 'antd';
import queryString from 'query-string';
var moment = require('moment');

import Banner from './Banner';
import StudentInfo from './StudentInfo';

import { Request } from '../../util';

import './page.less';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buildingname: '',
      classroomname: '',
      nowtime: moment().format('YYYYM-MM-DD hh:mm:ss'),
      hasClass: true,
      classinfo: null,
    };
  }
  componentDidMount() {
    /* eslint-disable */
    const values = queryString.parse(location.search);
    /* eslint-enable */
    const classroomname = values.classroomname;
    let buildingname = '';
    let classroom = '';
    if (classroomname) {
      if (classroomname.substr(0, 1) == 'G') {
        buildingname = '高中楼';
      } else {
        buildingname = '初中楼';
      }
      classroom = classroomname.substring(1);
      this.setState({
        buildingname,
        classroomname: classroom,
      });
      Request.get(
        'http://58.119.112.12:8081/rest/get_classroom_info',
        {
          buildingname,
          classroomname: classroom,
          nowtime: moment().format('YYYYM-MM-DD hh:mm:ss'),
          // nowtime: '2018-10-09 10:38:26',
        },
        {},
      )
        .then(res => {
          if (res.errno === 0) {
            this.setState({
              hasClass: true,
              classinfo: res.classinfo,
            });
          } else {
            this.setState({
              hasClass: false,
            });
          }
        })
        .catch(res => {
          console.error('get_classroom_info', res);
        });
    } else {
      console.error('get_classroom_info 缺少参数');
    }
  }

  render() {
    const { hasClass, classinfo } = this.state;
    return (
      <div className="app">
        {hasClass && classinfo ? (
          <StudentInfo classinfo={classinfo} />
        ) : (
          <Banner />
        )}
      </div>
    );
  }
}

export default App;
