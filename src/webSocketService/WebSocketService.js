import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import config from '@/config';

class WebSocketService {
  constructor() {
    this.webSocketEndPoint = config.WEB_SOCKET_URL; // WebSocket server URL
    this.topic = '';
    this.stompClient = null;
  }

  connect(topic, callback, options = {}) {
    this.topic = topic;
    this.callback = callback;

    console.log('Initializing WebSocket Connection...');
    const ws = new SockJS(this.webSocketEndPoint);
    this.stompClient = Stomp.over(ws);

    // Disable debug logs conditionally
    if (process.env.NODE_ENV === 'production') {
      this.stompClient.debug = null;
    }

    this.stompClient.connect(
      {},
      (frame) => {
        console.log('WebSocket Connected:', frame);
        if (options.onConnectSuccess) options.onConnectSuccess();

        // Subscribe to the topic
        this.stompClient.subscribe(this.topic, (message) => {
          console.log('Message Received:', message);
          if (message.body) {
            const parsedMessage = JSON.parse(message.body);
            this.callback(parsedMessage);
          }
        });
      },
      (error) => {
        console.error('WebSocket Connection Error:', error);
        if (options.onConnectError) options.onConnectError(error);
        this.reconnect();
      }
    );
  }

  reconnect() {
    console.log('Attempting to reconnect...');
    setTimeout(() => {
      this.connect(this.topic, this.callback);
    }, 5000); // Retry every 5 seconds
  }

  send(topic, message) {
    if (this.stompClient && this.stompClient.connected) {
      console.log('Sending message to:', topic);
      this.stompClient.send(topic, {}, JSON.stringify(message));
    } else {
      console.warn('Cannot send message. WebSocket is not connected.');
    }
  }

  disconnect() {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.disconnect(() => {
        console.log('WebSocket Disconnected');
      });
    }
  }
}

export default WebSocketService;
