import {
    PageContainer
} from '@ant-design/pro-components';
import React, { useEffect, useRef, useState } from 'react';

const WS: React.FC<unknown> = () => {
    // 创建 WebSocket 实例
    const [socket, setSocket] = useState<WebSocket>();
    const [message, setMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    // 建立 WebSocket 连接
    useEffect(() => {
        const newSocket = new WebSocket('ws://localhost:9001/ws4Order');

        newSocket.onopen = () => {
            setIsConnected(true);
            setSocket(newSocket);
        };

        newSocket.onmessage = (event) => {
            setMessage(event.data);
        };

        newSocket.onclose = () => {
            setIsConnected(false);
            setSocket(undefined);
        };

        return () => {
            newSocket.close();
        };
    }, []);

    // 发送消息
    const sendMessage = (e: any) => {
        if (socket && socket.readyState === 1) {
            socket.send(message);
            setMessage('');
        }
    };
    return (
        <PageContainer
            header={{
                title: 'WS 示例',
            }}
        >
            <div>
                {isConnected ? (
                    <div>
                        <input value={message} onChange={(e) => setMessage(e.target.value)} />
                        <button onClick={sendMessage}>发送</button>
                        <div>{message}</div>
                    </div>
                ) : (
                    <div>连接中...</div>
                )}
            </div>
        </PageContainer>
    );
};

export default WS;
