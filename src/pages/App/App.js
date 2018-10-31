import React, { Component } from 'react';
import queryString from 'query-string';

import Banner from './Banner';
import StudentInfo from './StudentInfo';

import { Request } from '../../util';

import './page.less';

var moment = require('moment');

let timer = null;
const loopGap = 5 * 60 * 1000;

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

  getClassInfo = () => {
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
          nowtime: moment().format('YYYY-MM-DD HH:mm:ss'),
        },
        {},
      )
        .then(res => {
          if (res.errno === 0) {
            this.setState({
              hasClass: true,
              classinfo: res.classinfo,
            });
            clearInterval(timer);
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
  };

  componentDidMount() {
    this.getClassInfo();
    timer = setInterval(this.getClassInfo, loopGap);
  }

  componentWillUnmount() {
    clearInterval(timer);
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
