const fetch = require('node-fetch');
const ExcelJS = require('exceljs');
const moment = require('moment');

let DEPARTMENT_NAME; let DEPARTMENT_ID; let QUERY_MONTH;
let QUERY_MONTH_BEGIN; let QUERY_MONTH_END;

const getDayBeginAndEnds = () => {
    let dayBeginAndEnds = [];
    let monthBegin = moment(QUERY_MONTH_BEGIN);
    let monthEnd = moment(QUERY_MONTH_END);

    while (monthBegin.endOf('day').diff(monthEnd, 'days') <= 0) {
        let dayBegin = monthBegin.startOf('day').format("YYYY.MM.DD HH:mm:ss");
        let dayEnd = monthBegin.endOf('day').format("YYYY.MM.DD HH:mm:ss");
        dayBeginAndEnds.push([dayBegin, dayEnd]);
        monthBegin = monthBegin.add(1, 'days');
    }

    return dayBeginAndEnds;
}

const getAccessToken = async () => {
    let tokenUrl = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=ww39a03eb2c110c3d6&corpsecret=_KD8z7HcxBaoi0KFF-kFX8JkuNuvERur7W8V-IoOfwI';
    const tokenResponse = await fetch(tokenUrl, {
        method: 'GET'
    });
    const tokenResponseJson = await tokenResponse.json();
    return tokenResponseJson;
}

const getDepartmentList = async (accessToken) => {
    let departmentListUrl = 'https://qyapi.weixin.qq.com/cgi-bin/department/list?id=1&';
    departmentListUrl += 'access_token=';
    departmentListUrl += accessToken;
    const departmentListResponse = await fetch(departmentListUrl, {
        method: 'GET'
    });
    const departmentListResponseJson = await departmentListResponse.json();
    return departmentListResponseJson;
}

const getUserSimplelist = async (accessToken, departmentId) => {
    let userSimplelistUrl = 'https://qyapi.weixin.qq.com/cgi-bin/user/simplelist?';
    userSimplelistUrl += 'access_token=';
    userSimplelistUrl += accessToken;
    userSimplelistUrl += '&department_id=';
    userSimplelistUrl += departmentId;

    const userSimplelistResponse = await fetch(userSimplelistUrl, {
        method: 'GET'
    });
    const userSimplelistResponseJson = await userSimplelistResponse.json();
    return userSimplelistResponseJson;
}

const getCheckinDaydata = async (accessToken, startTime, endTime, userIdList) => {
    let getCheckinDaydataUrl = 'https://qyapi.weixin.qq.com/cgi-bin/checkin/getcheckin_daydata?';
    getCheckinDaydataUrl += 'access_token=';
    getCheckinDaydataUrl += accessToken;

    let getCheckinDaydataBody = {
        'useridlist': userIdList,
        'starttime': startTime.unix(),
        'endtime': endTime.unix()
    };
    const checkinDaydataResponse = await fetch(getCheckinDaydataUrl, {
        method: 'POST', body: JSON.stringify(getCheckinDaydataBody),
        headers: { 'Content-Type': 'application/json' }
    });

    const checkinDaydataResponseJson = await checkinDaydataResponse.json();
    return checkinDaydataResponseJson;
}

const getCheckInData = async (accessToken, startTime, endTime, userIdList) => {
    let checkInDataUrl = 'https://qyapi.weixin.qq.com/cgi-bin/checkin/getcheckindata?';
    checkInDataUrl += 'access_token=';
    checkInDataUrl += accessToken;

    let checkInBody = {
        'opencheckindatatype': 3,
        'useridlist': userIdList,
        'starttime': startTime.unix(),
        'endtime': endTime.unix()
    };
    const checkInResponse = await fetch(checkInDataUrl, {
        method: 'POST', body: JSON.stringify(checkInBody),
        headers: { 'Content-Type': 'application/json' }
    });

    const checkInResponseJson = await checkInResponse.json();
    return checkInResponseJson;
}

const makeExcelCommonTitle = (worksheet, name) => {
    let lastRow = 1;
    {
        const titleRow = worksheet.getRow(lastRow);
        titleRow.height = 24;
        worksheet.mergeCells('A' + lastRow + ':J' + lastRow);
        let titleCell = worksheet.getCell('A' + lastRow);
        titleCell.value = '<<' + DEPARTMENT_NAME + '-' + name + '>>' + '上下班打卡_日报';
        titleCell.font = { size: 12, bold: true, name: '等线' };
        titleCell.alignment = { horizontal: 'left', vertical: 'middle' };
    }
    lastRow++;
    {
        const titleRow = worksheet.getRow(lastRow);
        titleRow.height = 24;
        worksheet.mergeCells('A' + lastRow + ':J' + lastRow);
        let titleCell = worksheet.getCell('A' + lastRow);
        titleCell.value = '统计时间:' + QUERY_MONTH_BEGIN.format("YYYY.MM.DD") + '~' + QUERY_MONTH_END.format("YYYY.MM.DD") + '     ' + '制表时间:' + moment().format('YYYY.MM.DD HH:mm');
        titleCell.font = { size: 12, bold: true, name: '等线' };
        titleCell.alignment = { horizontal: 'left', vertical: 'middle' };
    }

    return lastRow;
}

const makeExcelCheckInTitle = (worksheet, lastRow) => {
    lastRow++;
    {
        worksheet.getRow(lastRow).height = 26;

        worksheet.getColumn(1).width = 10;
        let dataCell = worksheet.getCell('A' + lastRow);
        dataCell.value = '日期';
        dataCell.font = { size: 9, bold: true, name: '等线' };
        dataCell.alignment = { horizontal: 'center', vertical: 'middle' };
        dataCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getColumn(2).width = 8;
        let nameCell = worksheet.getCell('B' + lastRow);
        nameCell.value = '姓名';
        nameCell.font = { size: 9, bold: true, name: '等线' };
        nameCell.alignment = { horizontal: 'center', vertical: 'middle' };
        nameCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getColumn(3).width = 4;
        let checkinCountCell = worksheet.getCell('C' + lastRow);
        checkinCountCell.value = '次数';
        checkinCountCell.font = { size: 9, bold: true, name: '等线' };
        checkinCountCell.alignment = { horizontal: 'center', vertical: 'middle' };
        checkinCountCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getColumn(4).width = 5;
        let regularWorkCell = worksheet.getCell('D' + lastRow);
        regularWorkCell.value = '时长';
        regularWorkCell.font = { size: 9, bold: true, name: '等线' };
        regularWorkCell.alignment = { horizontal: 'center', vertical: 'middle' };
        regularWorkCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getColumn(5).width = 10;
        let checkInCell1 = worksheet.getCell('E' + lastRow);
        checkInCell1.value = '打卡一';
        checkInCell1.font = { size: 9, bold: true, name: '等线' };
        checkInCell1.alignment = { horizontal: 'center', vertical: 'middle' };
        checkInCell1.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getColumn(6).width = 10;
        let checkInCell2 = worksheet.getCell('F' + lastRow);
        checkInCell2.value = '打卡二';
        checkInCell2.font = { size: 9, bold: true, name: '等线' };
        checkInCell2.alignment = { horizontal: 'center', vertical: 'middle' };
        checkInCell2.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getColumn(7).width = 10;
        let checkInCell3 = worksheet.getCell('G' + lastRow);
        checkInCell3.value = '打卡三';
        checkInCell3.font = { size: 9, bold: true, name: '等线' };
        checkInCell3.alignment = { horizontal: 'center', vertical: 'middle' };
        checkInCell3.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getColumn(8).width = 10;
        let checkInCell4 = worksheet.getCell('H' + lastRow);
        checkInCell4.value = '打卡四';
        checkInCell4.font = { size: 9, bold: true, name: '等线' };
        checkInCell4.alignment = { horizontal: 'center', vertical: 'middle' };
        checkInCell4.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getColumn(9).width = 10;
        let checkInCell5 = worksheet.getCell('I' + lastRow);
        checkInCell5.value = '打卡五';
        checkInCell5.font = { size: 9, bold: true, name: '等线' };
        checkInCell5.alignment = { horizontal: 'center', vertical: 'middle' };
        checkInCell5.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        worksheet.getColumn(10).width = 10;
        let checkInCell6 = worksheet.getCell('J' + lastRow);
        checkInCell6.value = '打卡六';
        checkInCell6.font = { size: 9, bold: true, name: '等线' };
        checkInCell6.alignment = { horizontal: 'center', vertical: 'middle' };
        checkInCell6.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    }

    return lastRow;
}

const makeExcelCheckInData = (worksheet, lastRow, checkinDataArray) => {
    lastRow++;
    {
        let datas = checkinDataArray.datas;
        for (let ii = 0; ii < datas.length; ++ii) {
            let data = datas[ii];

            const checkInRow = worksheet.getRow(lastRow);
            checkInRow.height = 22;

            let dataCell = worksheet.getCell('A' + lastRow);
            dataCell.value = moment.unix(data.date).format('YYYY.MM.DD');
            dataCell.font = { size: 9, bold: false, name: '等线' };
            dataCell.alignment = { horizontal: 'center', vertical: 'middle' };

            let nameCell = worksheet.getCell('B' + lastRow);
            nameCell.value = data.name;
            nameCell.font = { size: 9, bold: false, name: '等线' };
            nameCell.alignment = { horizontal: 'center', vertical: 'middle' };

            let checkinCountCell = worksheet.getCell('C' + lastRow);
            checkinCountCell.value = data.checkinCount;
            checkinCountCell.font = { size: 9, bold: false, name: '等线' };
            checkinCountCell.alignment = { horizontal: 'center', vertical: 'middle' };

            let regularWorkCell = worksheet.getCell('D' + lastRow);
            regularWorkCell.value = parseFloat(parseFloat(data.regularWorkSec / (60 * 60)).toFixed(2));
            regularWorkCell.font = { size: 9, bold: false, name: '等线' };
            regularWorkCell.alignment = { horizontal: 'center', vertical: 'middle' };

            if (data.checkinDatas && data.checkinDatas.length > 0) {
                const getValue = (item) => {
                    let value = '';
                    if (item.exceptionType === '未打卡') {
                        value = item.checkinType + ' 未打卡';
                    } else {
                        value = item.checkinType + ' ' + moment.unix(item.checkinTime).format('HH:mm');
                    }
                    return value;
                }

                const getFGColor = (item) => {
                    let color = '';
                    if (item.exceptionType === '未打卡') {
                        color = { argb: 'FFFF0000' };
                    } else {
                        color = { argb: 'FF000000' };
                    }
                    return color;
                }

                let one = data.checkinDatas[0];
                if (one) {
                    let checkin1Cell = worksheet.getCell('E' + lastRow);
                    checkin1Cell.value = getValue(one);
                    checkin1Cell.font = { size: 9, bold: false, name: '等线', color: getFGColor(one) };
                    checkin1Cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                let two = data.checkinDatas[1];
                if (two) {
                    let checkin1Cell = worksheet.getCell('F' + lastRow);
                    checkin1Cell.value = getValue(two);
                    checkin1Cell.font = { size: 9, bold: false, name: '等线', color: getFGColor(one) };
                    checkin1Cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                let three = data.checkinDatas[2];
                if (three) {
                    let checkin1Cell = worksheet.getCell('G' + lastRow);
                    checkin1Cell.value = getValue(three);
                    checkin1Cell.font = { size: 9, bold: false, name: '等线', color: getFGColor(one) };
                    checkin1Cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                let four = data.checkinDatas[3];
                if (four) {
                    let checkin1Cell = worksheet.getCell('H' + lastRow);
                    checkin1Cell.value = getValue(four);
                    checkin1Cell.font = { size: 9, bold: false, name: '等线', color: getFGColor(one) };
                    checkin1Cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                let five = data.checkinDatas[4];
                if (five) {
                    let checkin1Cell = worksheet.getCell('I' + lastRow);
                    checkin1Cell.value = getValue(five);
                    checkin1Cell.font = { size: 9, bold: false, name: '等线', color: getFGColor(one) };
                    checkin1Cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                let six = data.checkinDatas[5];
                if (six) {
                    let checkin1Cell = worksheet.getCell('J' + lastRow);
                    checkin1Cell.value = getValue(six);
                    checkin1Cell.font = { size: 9, bold: false, name: '等线', color: getFGColor(one) };
                    checkin1Cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }
            }

            lastRow++;
        }
    }

    return lastRow;
}

const startBuild = async () => {
    // console.log('准备提取<<' + DEPARTMENT_NAME + '>>，从<<' +
    //     QUERY_MONTH_BEGIN.format("YYYY.MM.DD HH:mm:ss") + '>>到<<' +
    //     QUERY_MONTH_END.format("YYYY.MM.DD HH:mm:ss") + '>>的打卡数据！！！');

    console.log('获取accesstoken...');
    /// 登录并获取token
    const tokenResponseJson = await getAccessToken();
    // console.log(tokenResponseJson);
    if (tokenResponseJson.errcode !== 0) return;
    const accessToken = tokenResponseJson.access_token;

    /// 获取部门列表
    console.log('获取部门列表...');
    const departmentListResponseJson = await getDepartmentList(accessToken);
    // console.log(departmentListResponseJson);
    if (departmentListResponseJson.errcode !== 0) return;

    for (let i = 0; i < departmentListResponseJson.department.length; ++i) {
        let element = departmentListResponseJson.department[i];
        if (element.parentid === 1) { /// 弯麦食品店
            if (element.name === DEPARTMENT_NAME) {
                DEPARTMENT_ID = element.id;
                break;
            }
        }
    }

    if (!DEPARTMENT_ID) {
        console.log('找不到对应部门，请检查部门名称是否正确~');
        return;
    }

    console.log('获取部门成员信息...');
    const userSimplelistResponseJson = await getUserSimplelist(accessToken, DEPARTMENT_ID);
    // console.log(userSimplelistResponseJson);
    if (userSimplelistResponseJson.errcode !== 0 ||
        userSimplelistResponseJson.userlist.length <= 0) {
        console.log('找不到对应部门的成员，请检查对应部门是否有成员~');
        return;
    }

    const userIdList = [];
    const userObjArray = [];
    for (let i = 0; i < userSimplelistResponseJson.userlist.length; ++i) {
        let element = userSimplelistResponseJson.userlist[i];
        userIdList.push(element.userid);
        let userObj = {};
        userObj.userid = element.userid;
        userObj.name = element.name;

        ///测试
        // if (element.name !== '张燕丹') continue;

        userObj.datas = [];
        userObjArray.push(userObj);
    }

    // console.log('useridlist = ' + userIdList);
    // console.log('starttime = ' + QUERY_MONTH_BEGIN);
    // console.log('endtime = ' + QUERY_MONTH_END);

    const dayBeginAndEnds = getDayBeginAndEnds();
    // console.log(dayBeginAndEnds);
    for (let dayIndex = 0; dayIndex < dayBeginAndEnds.length; ++dayIndex) {
        let beginAndEnd = dayBeginAndEnds[dayIndex];
        let begin = moment(beginAndEnd[0], 'YYYY.MM.DD HH:mm:ss');
        let end = moment(beginAndEnd[1], 'YYYY.MM.DD HH:mm:ss');

        /// 查询打卡简录
        console.log('获取所有成员从<<' + beginAndEnd[0] +
            '>>到<<' + beginAndEnd[1] + '>>的打卡简要日报...');
        const checkinDaydataResponseJson = await getCheckinDaydata(accessToken, begin, end, userIdList);
        if (checkinDaydataResponseJson.errcode !== 0 ||
            checkinDaydataResponseJson.datas.length <= 0) {
            console.log('找不到成员的简要打卡数据~');
            return;
        }

        // console.log('checkinDaydataResponseJson = ' + JSON.stringify(checkinDaydataResponseJson.datas));
        let checkinDaydatas = checkinDaydataResponseJson.datas;
        for (let ii = 0; ii < checkinDaydatas.length; ++ii) {
            let checkinDay = checkinDaydatas[ii];
            let baseInfo = checkinDay.base_info;
            let summaryInfo = checkinDay.summary_info;
            if (baseInfo && summaryInfo) {
                // console.log(baseInfo);
                let acctid = baseInfo.acctid;
                let date = baseInfo.date;
                let name = baseInfo.name;

                ///测试
                // if (name !== '张燕丹') continue;

                let checkinCount = summaryInfo.checkin_count;
                let regularWorkSec = summaryInfo.regular_work_sec;

                let userObj4AddData;
                for (let jj = 0; jj < userObjArray.length; ++jj) {
                    let userObj = userObjArray[jj];
                    if (userObj.userid === acctid) {
                        userObj4AddData = userObj;
                        break;
                    }
                }

                if (userObj4AddData) {
                    let reportData = {};
                    reportData.date = date;
                    reportData.checkinCount = checkinCount;
                    reportData.name = name
                    reportData.userid = acctid;
                    reportData.regularWorkSec = regularWorkSec;
                    userObj4AddData.datas.push(reportData);
                }

            }
        }

        /// 查询打卡具体记录
        console.log('获取所有成员从<<' + beginAndEnd[0] +
            '>>到<<' + beginAndEnd[1] + '>>的打卡详细日报...');
        const checkindataResponseJson = await getCheckInData(accessToken, begin, end, userIdList);
        // console.log(checkindataResponseJson);

        if (checkindataResponseJson.errcode !== 0) {
            console.log('找不到成员的具体打卡数据~');
            return;
        }
        let checkinData = checkindataResponseJson.checkindata;
        for (let ii = 0; ii < checkinData.length; ++ii) {
            let checkin = checkinData[ii];
            let userid = checkin.userid;

            let userObj4AddData;
            for (let jj = 0; jj < userObjArray.length; ++jj) {
                let userObj = userObjArray[jj];
                if (userObj.userid === userid) {
                    userObj4AddData = userObj;
                    break;
                }
            }

            if (userObj4AddData) {
                let checkinTime = checkin.checkin_time;
                let checkinTimeFormat = moment.unix(checkinTime).format('YYYY.MM.DD');
                let selectData;
                let datas = userObj4AddData.datas;
                for (let ii = 0; ii < datas.length; ++ii) {
                    let data = datas[ii];
                    let dateFormat = moment.unix(data.date).format('YYYY.MM.DD');
                    // console.log(dateFormat);
                    if (checkinTimeFormat === dateFormat) {
                        selectData = data;
                        break;
                    }
                }

                if (selectData) {
                    if (!(selectData.checkinDatas)) {
                        selectData.checkinDatas = [];
                    }
                    let newCheckIn = {};

                    if (checkin.checkin_type === '上班打卡') {
                        checkin.checkin_type = '上班';
                    } else if (checkin.checkin_type === '下班打卡') {
                        checkin.checkin_type = '下班';
                    }

                    newCheckIn.checkinType = checkin.checkin_type;
                    newCheckIn.exceptionType = checkin.exception_type;
                    newCheckIn.checkinTime = checkin.checkin_time;
                    selectData.checkinDatas.push(newCheckIn);
                }
            }
        }
    }

    // console.log(JSON.stringify(userObjArray));

    /// todo 写入excel
    let userObjArrayLength = userObjArray.length;
    if (userObjArrayLength > 0) {
        const workbook = new ExcelJS.Workbook();
        for (let ii = 0; ii < userObjArrayLength; ++ii) {
            let userObj = userObjArray[ii];
            let name = userObj.name;
            if (!name) continue;

            const worksheet = workbook.addWorksheet(name);
            /// 通用总标题
            console.log('构建<<' + name + '>>通用表格头！');
            let theLastRow = makeExcelCommonTitle(worksheet, name);
            console.log('构建<<' + name + '>>打卡表格头！');
            theLastRow = makeExcelCheckInTitle(worksheet, theLastRow);
            console.log('构建<<' + name + '>>打卡表格数据！');
            theLastRow = makeExcelCheckInData(worksheet, theLastRow, userObj);
        }

        await workbook.xlsx.writeFile('./' + DEPARTMENT_NAME + '_' + QUERY_MONTH_BEGIN.format("YYYY.MM.DD") + '-' + QUERY_MONTH_END.format("YYYY.MM.DD") + '_' + '打卡表.xlsx');
    }
};

const excute = () => {
    var args = process.argv.splice(2);
    if (args.length !== 2) {
        console.log('参数错误，第1参数：店名(总部|教育局店|旧镇店|江滨店|汤泉店|假日店|狮头店|动力杯店...)，第2个参数：月份(2020.12)');
    } else {
        DEPARTMENT_NAME = args[0];
        if (DEPARTMENT_NAME === undefined || DEPARTMENT_NAME.length <= 0) {
            console.log('第1参数错误，请输入正确店名(总部|教育局店|旧镇店|江滨店|汤泉店|假日店|狮头店|动力杯店...)');
            return;
        }

        if (args[1].indexOf('.') === -1) {
            console.log('第2参数错误，请输入正确月份(如：2020.12)');
            return;
        }
        QUERY_MONTH = args[1];
        if (QUERY_MONTH.indexOf('~') === -1) { ///不包含~，月份格式：2021.5
            QUERY_MONTH_BEGIN = moment(QUERY_MONTH, 'YYYY.MM').startOf('month');
            QUERY_MONTH_END = moment(QUERY_MONTH, 'YYYY.MM').endOf('month');
        } else { ///包含~，日期格式：2021.5.1~2021.5.4
            let query_month_Array = QUERY_MONTH.split('~');
            if (query_month_Array.length === 2) {
                QUERY_MONTH_BEGIN = moment(query_month_Array[0], 'YYYY.MM.DD').startOf('day');
                QUERY_MONTH_END = moment(query_month_Array[1], 'YYYY.MM.DD').endOf('day');
            }
        }

        startBuild();
    }
}

excute();
