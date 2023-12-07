import React, { useRef, useState } from 'react';
import {
    Button, message, Image
} from 'antd';
import {
    ActionType,
    DrawerForm,
    FooterToolbar,
    PageContainer,
    ProColumns,
    ProDescriptions,
    ProDescriptionsItemProps,
    ProTable
} from '@ant-design/pro-components';
import services from '@/services/demo';
const { getOrders, removeOrder } =
    services.UserController;

import moment from 'moment';
import 'moment/locale/zh-cn';
import { render } from 'react-dom';
moment.locale('zh-cn');

/**
 * 删除订单
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.UserListItem[]) => {
    const hide = message.loading('正在删除');
    if (!selectedRows) return true;
    try {
        const removeResult = await removeOrder({ ids: selectedRows.map((row) => row.id) });
        hide();
        if (removeResult.success) {
            message.success('删除成功');
        }
        return true;
    } catch (error) {
        hide();
        return false;
    }
};

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
        render: (_: any, record: any) => {
            return <Image style={{ width: 60, height: 60 }} alt='' src={`http://gratefulwheat.ruyue.xyz/${_[0]}`}></Image>
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
        title: '图片',
        dataIndex: 'images',
        valueType: 'text',
        render: (_: any, record: any) => {
            return <Image style={{ width: 60, height: 60 }} alt='' src={`http://gratefulwheat.ruyue.xyz/${_[0]}`}></Image>
        }
    },
    {
        title: '订单号',
        key: 'text',
        dataIndex: '_id',
        valueType: 'text',
        // ellipsis: true,
        // copyable: true,
    },
    {
        title: '日期',
        key: 'createdAt',
        dataIndex: 'createdAt',
        valueType: 'dateTime',
        // ellipsis: true,
        // copyable: true,
    },
    {
        title: '门店',
        key: 'shop',
        dataIndex: 'shop',
        valueType: 'text',
        // ellipsis: true,
        // copyable: true,
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
    /// 订单列表
    const [selectedRows, setSelectedRows] = useState<API.OrderListItem[]>([]);
    const tableActionRef = useRef<ActionType>();

    /// 当前条目设置
    const [createOrUpdateModalOpen, setCreateOrUpdateModalOpen] = useState<boolean>(false);
    const [currentRow, setCurrentRow] = useState<API.OrderListItem>();

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
                }}>查看</a>
            ]
        }
    ];

    return (
        <PageContainer title={false}>
            <ProTable<API.OrderListItem, API.GetSomeListParams>
                headerTitle=''
                actionRef={tableActionRef}
                rowKey="id"
                size='small'
                cardBordered
                search={false}
                pagination={{ pageSize: 10 }}
                request={getOrders}
                columns={tableColumnsConfig}
                rowSelection={{
                    onChange: (_, selectedRows) => {
                        setSelectedRows(selectedRows);
                    },
                }}
            />

            {/* 底部批量删除工具栏 */}
            {selectedRows?.length > 0 && (
                <FooterToolbar
                    extra={
                        <div>
                            已选择{' '}
                            <a style={{ fontWeight: 600 }}>{selectedRows.length}</a>{' '}
                            项
                        </div>
                    }
                >
                    <Button
                        onClick={async () => {
                            await handleRemove(selectedRows);
                            setSelectedRows([]);
                            tableActionRef.current?.reloadAndRest?.();
                        }}
                    >
                        批量删除
                    </Button>
                </FooterToolbar>
            )}

            <DrawerForm
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
                    dataSource={currentRow}
                    columns={KDescriptionsColumnsConfig}>
                </ProDescriptions>
            </DrawerForm>
        </PageContainer >
    );
};

export default Order;
