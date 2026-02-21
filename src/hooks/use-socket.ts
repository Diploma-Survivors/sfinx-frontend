import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSession } from 'next-auth/react';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useSocket = (namespace = '') => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        let isMounted = true;

        const initSocket = async () => {
            try {
                const session = await getSession();
                if (!isMounted) return;

                // @ts-ignore
                const token = session?.accessToken || session?.user?.accessToken || session?.token;

                if (!token) {
                    if (socketRef.current) {
                        socketRef.current.disconnect();
                        socketRef.current = null;
                        setSocket(null);
                        setConnected(false);
                    }
                    return;
                }

                const url = namespace ? `${SOCKET_URL}/${namespace}` : SOCKET_URL;

                // Ensure we don't connect multiple times
                if (socketRef.current) return;

                const socketIo = io(url, {
                    auth: {
                        token: token,
                    },
                    transports: ['websocket', 'polling'],
                });

                socketIo.on('connect', () => {
                    if (isMounted) setConnected(true);
                });

                socketIo.on('disconnect', () => {
                    if (isMounted) setConnected(false);
                });

                setSocket(socketIo);
                socketRef.current = socketIo;
            } catch (error) {
                console.error("Socket init error:", error);
            }
        };

        const timeoutId = setTimeout(initSocket, 0); // Put at end of event loop

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [namespace]);

    return { socket, connected };
};
