import Pusher from "pusher-js";
import { toast } from "react-toastify";

const pusher = new Pusher("YOUR_APP_KEY", {
  cluster: "YOUR_APP_CLUSTER",
});

const subscribeToChannel = (channelName, eventName, callback) => {
  const channel = pusher.subscribe(channelName);
  channel.bind(eventName, (data) => {
    callback(data);
    toast.info("New message received"); // Show toast notification
  });
};

export { subscribeToChannel };

subscribeToChannel(`chat-${userId}`, "new-message", (data) => {
  // You can handle the received message data here if needed
  console.log("New message:", data);
});
