import React from 'react';
import {
    Button
} from 'antd';

class PrintProductionPlan extends React.Component {
    constructor(props) {
        super(props);
    }

    async componentDidMount() {
    }

    render() {
        return (
            <div>
                <Button onClick={e => {
                    e.preventDefault();
                    let oldStr = window.document.body.innerHTML; // 获取body的内容
                    let start = "/* startprint */"; // 开始打印标识, 17个字符
                    let end = "/* endprint */"; // 结束打印标识
                    let newStr = oldStr.substr(oldStr.indexOf(start) + 17); // 截取开始打印标识之后的内容
                    newStr = newStr.substring(0, newStr.indexOf(end)); // 截取开始打印标识和结束打印标识之间的内容
                    window.document.body.innerHTML = newStr; // 把需要打印的指定内容赋给body
                    window.print(); // 调用浏览器的打印功能打印指定区域
                    window.document.body.innerHTML = oldStr; // body替换为原来的内容
                }}>
                    打印
                </Button>
                {/* startprint */}
                <div id='printContent'>打印内容</div>
                {/* endprint */}
            </div>
        );
    }
}

export default PrintProductionPlan;
