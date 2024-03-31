import React, { useState } from "react";
import { socket } from "../wsHandler";

const Chat: React.FC<any> = () => {
  const [newMessage, setNewMessage] = useState<string>("");

  const sendMessage = (event: any) => {
    event.preventDefault();
    if (!newMessage) return;

    socket.emit("message", newMessage);
    setNewMessage("");
  };

  return (
    <React.Fragment>
      <form className="mt-1" onSubmit={sendMessage}>
        <div className="relative flex">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            maxLength={20}
            className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-6 bg-gray-200 rounded-md py-3"
            onChange={(event) => setNewMessage(event.target.value)}
          />
          <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg px-4 py-3 text-aldebaran focus:outline-none font-bold"
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </React.Fragment>
  );
};

export default Chat;
