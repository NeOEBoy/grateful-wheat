import React, { useRef, useState } from 'react';
import {
    Button, message, Image, Divider
} from 'antd';
import {
    ActionType,
    DrawerForm,
    ModalForm,
    FooterToolbar,
    PageContainer,
    ProColumns,
    ProDescriptions,
    ProDescriptionsItemProps,
    ProTable
} from '@ant-design/pro-components';
// import QRCode from 'qrcode';
var QRCode = require('qrcode')
import services from '@/services/demo';
const { getOrders } = services.UserController;
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

const KTableColumnsConfig: ProColumns<API.OrderListItem>[] = [
    {
        title: '序',
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 36,
    },
    {
        title: '图片',
        dataIndex: 'images',
        valueType: 'text',
        render: (_: any) => {
            let imageSource = ``;
            if (_[0].indexOf('data:image') !== -1) {
                imageSource = _[0];
            } else {
                imageSource = `http://gratefulwheat.ruyue.xyz/${_[0]}`;
            }
            return <Image style={{ width: 60, height: 60 }} alt='' src={imageSource}></Image>
        }
    },
    {
        title: '订单号',
        dataIndex: '_id',
        valueType: 'text'
    },
    {
        title: '日期',
        dataIndex: 'createdAt',
        valueType: 'dateTime'
    },
    {
        title: '名称',
        dataIndex: 'name',
        valueType: 'text',
    },
    {
        title: '奶油',
        dataIndex: 'cream',
        valueType: 'text',
    },
    {
        title: '大小',
        dataIndex: 'size',
        valueType: 'text',
    },
    {
        title: '门店',
        dataIndex: 'shop',
        valueType: 'text',
    },
    {
        title: '姓名',
        dataIndex: 'pickUpName',
        valueType: 'text',
    },
    {
        title: '电话',
        dataIndex: 'phoneNumber',
        valueType: 'text',
    }
];

const KDescriptionsColumnsConfig: ProDescriptionsItemProps<API.OrderListItem>[] = [
    {
        title: '预定日期',
        key: 'createdAt',
        dataIndex: 'createdAt',
        valueType: 'dateTime'
    },
    {
        title: '名称',
        dataIndex: 'name',
        valueType: 'text',
    },
    {
        title: '描述',
        dataIndex: 'description',
        valueType: 'text',
    },
    {
        title: '图片',
        dataIndex: 'images',
        valueType: 'text',
        render: (_: any) => {
            return (<Image style={{ width: 44, height: 44 }} alt=''
                src={`http://gratefulwheat.ruyue.xyz/${_[0]}`} />)
        }
    },
    {
        title: '奶油',
        dataIndex: 'cream',
        valueType: 'text',
    },
    {
        title: '大小',
        dataIndex: 'size',
        valueType: 'text',
    },
    {
        title: '大小附加',
        dataIndex: 'sizeExtra',
        valueType: 'text',
    },
    {
        title: '高度',
        dataIndex: 'height',
        valueType: 'text',
    },
    {
        title: '价格',
        dataIndex: 'price',
        valueType: 'text',
    },
    {
        title: '夹心',
        dataIndex: 'fillings',
        valueType: 'text'
    },
    {
        title: '蜡烛',
        dataIndex: 'candle',
        valueType: 'text'
    },
    {
        title: '蜡烛额外',
        dataIndex: 'candleExtra',
        valueType: 'text'
    },
    {
        title: '火柴盒',
        dataIndex: 'kindling',
        valueType: 'text'
    },
    {
        title: '帽子',
        dataIndex: 'hat',
        valueType: 'text'
    },
    {
        title: '餐具',
        dataIndex: 'plates',
        valueType: 'text'
    },
    {
        title: '取货日期',
        dataIndex: 'pickUpDay',
        valueType: 'text'
    },
    {
        title: '取货时间',
        dataIndex: 'pickUpTime',
        valueType: 'text'
    },
    {
        title: '取货方式',
        dataIndex: 'pickUpType',
        valueType: 'text'
    },
    {
        title: '门店',
        dataIndex: 'shop',
        valueType: 'text',
    },
    {
        title: '地址',
        dataIndex: 'address',
        valueType: 'text',
    },
    {
        title: '姓名',
        dataIndex: 'pickUpName',
        valueType: 'text',
    },
    {
        title: '电话',
        dataIndex: 'phoneNumber',
        valueType: 'text',
    },
    {
        title: '备注',
        key: 'remarks',
        dataIndex: 'remarks',
        valueType: 'text',
        // ellipsis: true,
        // copyable: true,
    }
];

const Order: React.FC = () => {
    /// 当前条目设置
    const [createOrUpdateModalOpen, setCreateOrUpdateModalOpen] = useState<boolean>(false);
    const [currentRow, setCurrentRow] = useState<API.OrderListItem>();
    const [image4QRCode, setImage4QRCode] = useState<string>('dummy4init');
    const imgRef = useRef<HTMLImageElement>(null);
    // const canvasRef = useRef<HTMLCanvasElement>(null);

    const tableColumnsConfig: ProColumns<API.OrderListItem>[] = [
        ...KTableColumnsConfig,
        {
            title: '操作',
            dataIndex: 'option',
            valueType: 'option',
            width: 80,
            render: (_, record) => [
                <a key="view" onClick={() => {
                    setCurrentRow(record);
                    setCreateOrUpdateModalOpen(true);
                    setTimeout(() => {
                        if (imgRef.current && imgRef.current.src) {
                            // 获取绘制后的 canvas 的 dataURL
                            // const imageData = canvasRef.current?.toDataURL('image/jpeg');
                            // imgRef.current.src = imageData ? imageData : '';
                        }
                    }, 0);
                }}>查看</a>
            ]
        }
    ];

    const _theDiv4CaptureWidth = 760;
    const theDiv4CaptureHeight = _theDiv4CaptureWidth * 148 / 210;
    const _theDiv4CaptureStyle = {
        width: _theDiv4CaptureWidth,
        height: theDiv4CaptureHeight,
        background: 'white',
        borderRadius: 8, border: '1px dotted #000000'
    };
    const _theLeftDivInTheDiv4CaptureStyle = {
        width: theDiv4CaptureHeight - 180,
        height: theDiv4CaptureHeight - 180 + 40,
        float: "left", marginLeft: 8,
        borderRadius: 8, border: '2px dotted #008B8B'
    };
    let _theRightDivInTheDiv4CaptureStyle = {
        float: "right",
        width: _theDiv4CaptureWidth - theDiv4CaptureHeight + 160
    };

    const orderingTime = moment(currentRow?.createdAt).format('YYYY年M月D日 HH:mm:ss');;


    return (
        <PageContainer title={false}>
            <ProTable<API.OrderListItem, API.GetSomeListParams>
                headerTitle='订单列表'
                rowKey="_id"
                size='small'
                cardBordered
                search={false}
                pagination={{ pageSize: 10 }}
                request={getOrders}
                columns={tableColumnsConfig}
            />

            <ModalForm
                modalProps={{ style: { top: 10 }, destroyOnClose: true }}
                width={1400}
                open={createOrUpdateModalOpen}
                onOpenChange={(open) => {
                    setCreateOrUpdateModalOpen(open);
                    !open && currentRow && setCurrentRow(undefined);
                }}
                onFinish={async (value) => {
                    console.log('onFinish value = ' + value);
                    setCreateOrUpdateModalOpen(false);
                    currentRow && setCurrentRow(undefined);
                }}>
                <ProDescriptions
                    title='订单详情'
                    column={6}
                    dataSource={currentRow}
                    columns={KDescriptionsColumnsConfig}>
                </ProDescriptions>
                <div style={{ textAlign: 'center' }}>
                    {/* <img style={{ width: 100, height: 100 }} alt='gi' ref={imgRef} src='' /> */}
                </div>
                <div style={{ opacity: 1 }}>
                    {/* <canvas width={100} height={100} style={{ background: 'red' }} ref={canvasRef} /> */}
                    <div style={_theDiv4CaptureStyle}>
                        <div id="qrcode" style={{
                            textAlign: 'right', position: 'absolute',
                            paddingRight: 18, paddingTop: 10,
                            width: _theDiv4CaptureWidth, height: 150
                        }}>
                            <div style={{ fontSize: 12, fontWeight: 'bold' }}>电子订购单二维码</div>
                            <Image style={{ width: 135, height: 135 }}
                                onLoad={() => {

                                }}
                                onError={async () => {
                                    if (image4QRCode == 'dummy4init') {
                                        let cakeOrderUrl = `http://gratefulwheat.ruyue.xyz/cakeOrder?_id=${currentRow._id}`;
                                        let qrOpts = {
                                            errorCorrectionLevel: 'L',
                                            type: 'image/jpeg',
                                            quality: 0.8,
                                            margin: 2,
                                            color: {
                                                dark: "#000000ff",
                                                light: "#ffffffff"
                                            }
                                        }
                                        let qrCode = await QRCode.toDataURL(cakeOrderUrl, qrOpts);
                                        setImage4QRCode(qrCode);
                                    }
                                }}
                                preview={false}
                                src={image4QRCode}
                            />
                        </div>

                        <div style={{
                            textAlign: 'left', position: 'absolute', paddingLeft: 20,
                            width: _theDiv4CaptureWidth, fontSize: 14, paddingTop: 10,
                        }}>{`订购时间：${orderingTime}`}</div>

                        <div style={{
                            fontSize: 22,
                            fontWeight: 'bold',
                            textAlign: 'center',
                            paddingTop: 6,
                            paddingBottom: 6
                        }}>蛋糕订购单</div>
                        <div>
                            <div style={_theLeftDivInTheDiv4CaptureStyle}>
                                <div style={{
                                    fontSize: 20,
                                    textAlign: 'center',
                                    paddingTop: 4,
                                    paddingBottom: 4,
                                    fontWeight: 'bold',
                                    background: '#D8D8D8',
                                    borderBottom: '1px dashed black'
                                }}>
                                    <span>{`《${currentRow?.name}》`}</span>
                                </div>
                                <div>
                                    <div style={{ position: 'relative' }}>
                                        <Image preview={false} src={
                                            currentRow?.images?.[0].indexOf('data:image') !== -1 ?
                                                currentRow?.images?.[0] :
                                                `http://gratefulwheat.ruyue.xyz/${currentRow?.images?.[0]}`
                                        } />
                                    </div>
                                    <Image style={{ marginTop: 16 }} preview={false} src="/弯麦logo长.png" />
                                </div>
                            </div>
                            <div style={_theRightDivInTheDiv4CaptureStyle}>
                                <Divider orientation='left' dashed style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>制作</Divider>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>奶油：</span>
                                    <span style={{ fontSize: 18, color: 'green' }}>{currentRow?.cream}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>尺寸：</span>
                                    <span style={{ fontSize: 18, color: 'green' }}>{currentRow?.size}</span>
                                    {
                                        currentRow?.size === '数字蜡烛' ? (
                                            <span style={{ fontSize: 18, color: 'green' }}>
                                                {` | ${currentRow?.sizeExtra}`}
                                            </span>) : (<span></span>)
                                    }
                                    <span style={{ fontSize: 18, color: 'green' }}>
                                        {` | ${currentRow?.height}`}
                                    </span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>价格：</span>
                                    <span style={{ fontSize: 14 }}>{currentRow?.price}</span>
                                    <span style={{ fontSize: 14 }}>元</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>夹心：</span>
                                    <span style={{ fontSize: 16, color: 'green' }}>{
                                        (currentRow?.fillings?.length !== undefined &&
                                            currentRow?.fillings?.length > 0) ?
                                            currentRow?.fillings?.join('+') :
                                            '没有夹心'
                                    }</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>蜡烛：</span>
                                    <span style={{ fontSize: 16, color: 'blue' }}>{currentRow?.candle}</span>
                                    {
                                        currentRow?.candle === '数字蜡烛' ? (
                                            <span style={{ fontSize: 16, color: 'blue' }}>
                                                {`(${currentRow?.candleExtra})`}
                                            </span>) : (<span></span>)
                                    }
                                    {
                                        currentRow?.kindling === '火柴盒' ? (
                                            <span style={{ fontSize: 16, color: 'blue' }}>
                                                {`+火柴盒`}
                                            </span>
                                        ) : (<span></span>)
                                    }
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>帽子：</span>
                                    <span style={{ fontSize: 16, color: 'blue' }}>{currentRow?.hat}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>餐具：</span>
                                    <span style={{ fontSize: 16, color: 'blue' }}>{currentRow?.plates}</span>
                                    <span style={{ fontSize: 16, color: 'blue' }}>套</span>
                                </div>
                                <Divider orientation='left' style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>取货</Divider>
                                <div>
                                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>时间：</span>
                                    <span style={{ fontSize: 18, color: 'red' }}>{currentRow?.pickUpDay}</span>
                                    <span style={{ fontSize: 18, color: 'red' }}>{currentRow?.pickUpTime}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>方式：</span>
                                    <span style={{ fontSize: 14 }}>{currentRow?.pickUpType}</span>
                                </div>
                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>门店：</span>
                                    <span style={{ fontSize: 14 }}>{currentRow?.shop}</span>
                                </div>
                                {
                                    currentRow?.pickUpType === '商家配送' ? (
                                        <div style={{ marginTop: 4, marginBottom: 4 }}>
                                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>地址：</span>
                                            <span style={{ fontSize: 18, color: 'red' }}>{currentRow?.address}</span>
                                        </div>
                                    ) : (<div></div>)
                                }

                                <div style={{ marginTop: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>姓名：</span>
                                    <span style={{ fontSize: 18, color: 'red' }}>
                                        {`${currentRow?.pickUpName}（${currentRow?.phoneNumber}）`}
                                    </span>
                                </div>
                                <Divider orientation='left' style={{ marginTop: 0, marginBottom: 0, fontSize: 8 }}>其它</Divider>
                                <div style={{ marginTop: 4, marginBottom: 4, marginRight: 8 }}>
                                    <span style={{ fontSize: 14, fontWeight: 'bold' }}>备注：</span>
                                    <span style={{ fontSize: 18, color: 'red', wordWrap: 'break-word' }}>
                                        {currentRow?.remarks}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ModalForm>
        </PageContainer >
    );
};

export default Order;
