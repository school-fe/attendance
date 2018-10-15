import React, { Component } from 'react';
import { Progress } from 'antd';

import { Request } from '../../util';

var moment = require('moment');

let timer = null;
const loopGap = 5 * 1000;

export default class StudentInfo extends Component {
  static displayName = 'StudentInfo';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      teacherid: '',
      data: {},
      studentlist: [],
      lateList: [],
      leaveList: [],
    };
  }

  getStudentInfo = () => {
    const { classinfo } = this.props;
    const teacherid = classinfo[0].teacherid;
    if (teacherid) {
      Request.get(
        'http://58.119.112.12:8081/app/get_teacher_attendance',
        {
          teacherid,
          nowtime: moment().format('YYYY-MM-DD HH:mm:ss'),
        },
        {},
      )
        .then(res => {
          if (res.errno === 0) {
            this.setState({
              data: res,
            });
            this.parseStudentList(res.studentlist);
          } else {
            console.error('get_teacher_attendance', res);
            window.location.reload(true);
          }
        })
        .catch(res => {
          console.error('get_teacher_attendance', res);
          window.location.reload(true);
        });
    }
  };

  parseStudentList = studentlist => {
    const lateList = [];
    const leaveList = [];
    if (studentlist) {
      for (let index = 0; index < studentlist.length; index++) {
        const element = studentlist[index];
        if (element.status === '迟到') {
          lateList.push(element);
        }
        if (element.status === '请假') {
          leaveList.push(element);
        }
      }
    }
    this.setState({
      lateList,
      leaveList,
    });
  };

  componentDidMount() {
    this.getStudentInfo();
    timer = setInterval(this.getStudentInfo, loopGap);
  }

  componentWillUnmount() {
    clearInterval(timer);
  }

  render() {
    const { data, lateList, leaveList } = this.state;
    const { studentlist } = data;
    const { classinfo } = this.props;
    const classData = classinfo[0];
    return (
      <div className="class-info">
        <div className="header">
          <div className="classInfo">
            <div id="classroomname" className="class_number">
              {data.classroomname}
            </div>
          </div>
          <div className="detailInfo">
            <div className="kechenginfo">
              <p className="teacher">
                <span className="gudinginfo">课程：</span>
                <span id="subjectname" className="changeinfo">
                  {data.subjectname}
                </span>
              </p>
              <p className="teacher ml48">
                <span className="gudinginfo">老师：</span>
                <span id="teachername" className="changeinfo">
                  {classData.teachername}
                </span>
              </p>
            </div>
            <div className="kechengtime">
              <p className="teacher">
                <span className="gudinginfo">上课时间：</span>
                <span id="date" className="changeinfo">
                  {classData.date}
                </span>
              </p>
              <p className="teacher ml48">
                <span className="gudinginfo">节次：</span>
                <span id="classNumber" className="changeinfo">
                  周{parseInt(classData.week) + 1}
                  &nbsp;&nbsp;&nbsp;第 {parseInt(data.timeorder) + 1}节
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="middle">
          <div className="i-title">打卡情况</div>
          <div className="middle-circle">
            <Progress
              type="circle"
              strokeWidth={10}
              width={150}
              percent={parseInt((data.absentpeople / data.shouldpeople) * 100)}
            />
          </div>
          <div className="middle-bar">
            <div style={{ clear: 'both' }}>
              <div className="title">应 到：</div>
              <Progress
                percent={100}
                strokeWidth={20}
                className="line"
                strokeColor="#5cf800"
                format={percent => {
                  return <span> {data.shouldpeople} 人</span>;
                }}
              />
            </div>
            <div style={{ clear: 'both' }}>
              <div className="title">实 到：</div>
              <Progress
                percent={parseInt(
                  (data.absentpeople / data.shouldpeople) * 100,
                )}
                strokeWidth={20}
                className="line"
                strokeColor="#c6f35b"
                format={percent => {
                  return <span> {data.absentpeople} 人</span>;
                }}
                status="active"
              />
            </div>
            <div style={{ clear: 'both' }}>
              <div className="title">未 到：</div>
              <Progress
                percent={parseInt(
                  (data.dayoffpeople / data.shouldpeople) * 100,
                )}
                percent={20}
                strokeWidth={20}
                className="line"
                strokeColor="#f57a81"
                status="active"
                format={percent => {
                  return <span> {data.dayoffpeople} 人</span>;
                }}
              />
            </div>
            <div style={{ clear: 'both' }}>
              <div className="title">迟 到：</div>
              <Progress
                percent={parseInt((data.latepeople / data.shouldpeople) * 100)}
                strokeWidth={20}
                className="line"
                status="exception"
                format={percent => {
                  return <span> {data.latepeople} 人</span>;
                }}
              />
            </div>
          </div>
        </div>
        <div className="footer">
          <div style={{ clear: 'both' }}>
            <div className="i-title">学生信息</div>
            <div className="i-desc">
              温馨提示：
              <span>黄色名称未打卡，</span>
              浅绿色名称已打卡！
            </div>
          </div>
          <div style={{ clear: 'both', margin: '80px 20px 40px' }}>
            {studentlist &&
              studentlist.length > 0 &&
              studentlist.map(item => {
                let color = '';
                if (item.status == '缺勤') {
                  color = 'rgba(255,204,0,1)';
                } else if (item.status == '正常') {
                  color = '#00FF00';
                } else if (item.status == '迟到') {
                  color = 'rgba(228,80,49,1)';
                } else if (item.status == '请假') {
                  color = '#FFFFFF';
                }
                return (
                  <span
                    key={item.studentid}
                    className="footer-student"
                    style={{ backgroundColor: '#6fa5bb', color: color }}
                  >
                    {item.studentname}
                  </span>
                );
              })}
          </div>
        </div>
        <div className="footer-right">
          <div className="i-title">迟到学生</div>
          <div style={{ clear: 'both', margin: '10px' }}>
            {lateList &&
              lateList.length > 0 &&
              lateList.map(item => {
                if (item.studentname) {
                  return (
                    <span
                      key={item.studentid}
                      className="footer-student"
                      style={{
                        backgroundColor: '#6fa5bb',
                        color: 'rgba(228,80,49,1)',
                      }}
                    >
                      {item.studentname}
                    </span>
                  );
                }
                return null;
              })}
          </div>
          <div className="i-title">请假学生</div>
          <div>
            {leaveList &&
              leaveList.length > 0 &&
              leaveList.map(item => {
                if (item.studentname) {
                  return (
                    <span
                      key={item.studentid}
                      className="footer-student"
                      style={{ backgroundColor: '#6fa5bb', color: '#FFFFFF' }}
                    >
                      {item.studentname}
                    </span>
                  );
                }
                return null;
              })}
          </div>
        </div>
      </div>
    );
  }
}
