import React from 'react';
import {
    Image, Divider
} from 'antd';

const KPickUpTypeOptions = [
    { label: '自己提货', value: '自己提货' },
    { label: '商家配送', value: '商家配送' }
];

class BirthdayCakeOrder extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            cakeName: '奥特曼打怪兽',
            cakeImage: '/image/生日蛋糕/蛋糕3.0/奥特曼打怪兽-方图.jpg',
            creamType: '动物奶油',
            cakeSize: '8寸',
            cakeSizeExtra: '',
            cakePrice: '188',
            pickUpDay: '2022-8-13',
            pickUpTime: '18:00',
            pickUpType: '商家配送',
            responseShop: '教育局店',
            deliverAddress: '漳浦县绥安镇府前街西2号楼1202',
            pickUpName: '王先生',
            phoneNumber: '18698036807',
            remarks: '需要两个生日帽'
        };
    };

    componentDidMount = async () => {
        // let query = this.props.query;
        // let paramValueStr = query && query.get('param');
        // // console.log(paramValueStr);
        // if (paramValueStr) {
        //     paramValueStr = unescape(paramValueStr);
        //     // console.log(paramValueStr);
        //     let paramValueObj = JSON.parse(paramValueStr);
        // }
    };

    render() {
        const {
            cakeName,
            cakeImage,
            creamType,
            cakeSize,
            cakeSizeExtra,
            cakePrice,
            pickUpDay,
            pickUpTime,
            pickUpType,
            responseShop,
            deliverAddress,
            pickUpName,
            phoneNumber,
            remarks
        } = this.state;

        let tel = 'tel:' + phoneNumber
        return (
            <div>
                <div style={{
                    fontSize: 16,
                    textAlign: 'center',
                    paddingTop: 6,
                    paddingBottom: 6
                }}>蛋糕订购单</div>
                <div style={{
                    fontSize: 18,
                    textAlign: 'center',
                    paddingTop: 4,
                    paddingBottom: 4,
                    fontWeight: 'bold'
                }}>{cakeName}</div>
                <div style={{ width: '100%', textAlign: 'center' }}>
                    <Image style={{ width: 240 }} preview={false} src={cakeImage} />
                </div>
                <div style={{ marginLeft: 24, marginRight: 24 }}>
                    <Divider style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>制作</Divider>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>奶油：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{creamType}</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>尺寸：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{cakeSize}</span>
                        {
                            cakeSize === '组合' ? (
                                <span style={{ fontSize: 14, fontWeight: 'bold' }}>
                                    {cakeSizeExtra}
                                </span>) : (<span></span>)
                        }
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>价格：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{cakePrice}</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>元</span>
                    </div>
                    <Divider style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>取货</Divider>
                    <div>
                        <span style={{ fontSize: 14 }}>取货：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{pickUpDay}</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}> {pickUpTime}</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>方式：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{pickUpType}</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>门店：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{responseShop}</span>
                    </div>
                    {
                        pickUpType === KPickUpTypeOptions[1].value ? (
                            <div style={{ marginTop: 4, marginBottom: 4 }}>
                                <span style={{ fontSize: 14 }}>地址：</span>
                                <a href='https://uri.amap.com/marker?position=116.473195,39.993253'
                                    style={{ textDecoration: 'underline', fontSize: 14, fontWeight: 'bold' }}>
                                    {deliverAddress}
                                </a>
                            </div>
                        ) : (<div></div>)
                    }

                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>姓名：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{pickUpName}</span>
                    </div>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>手机：</span>
                        <span style={{ textDecoration: 'underline', fontSize: 14, fontWeight: 'bold' }}>
                            <a href={tel}>{phoneNumber}</a>
                        </span>
                    </div>
                    <Divider style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>其它</Divider>
                    <div style={{ marginTop: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>备注：</span>
                        <span style={{ fontSize: 14, fontWeight: 'bold', wordWrap: 'break-word' }}>{remarks}</span>
                    </div>
                </div>
            </div>)
    };
}

export default BirthdayCakeOrder;
