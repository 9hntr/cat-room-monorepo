import React, { useState } from "react";
import { sendMessageTo } from "../wsHandler";
import { useDispatch, useSelector } from "react-redux";
import { selectTarget, selectUser, setTarget } from "../../state/room.reducer";

const Chat: React.FC<any> = () => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState<string>("");
  const target = useSelector(selectTarget);
  const user = useSelector(selectUser);

  const sendMessage = (event: any) => {
    event.preventDefault();
    if (!message) return;

    sendMessageTo(message, target?.id as string);
    setMessage("");
  };

  const hdlKeyDown = (key: string) => {
    if (!message.length && key === "Backspace") {
      dispatch(setTarget({ username: null, id: user?.roomId }));
    }
  };

  return (
    <React.Fragment>
      <form className="mt-1" onSubmit={sendMessage}>
        <div className="relative flex w-full focus:outline-none focus:placeholder-gray-400 bg-white rounded-md py-2">
          {target.id !== user?.roomId ? (
            <span className="text-bold text-gray-400 ml-3 flex justify-center items-center">
              {target.username}
            </span>
          ) : null}

          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            maxLength={20}
            className="text-gray-600 placeholder-gray-600 w-full ml-3 outline-none"
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(e) => hdlKeyDown(e.key)}
          />
          <button
            type="submit"
            className="flex items-center justify-center rounded-lg px-4 py-1 text-aldebaran font-bold"
          >
            Send
          </button>
        </div>
      </form>
    </React.Fragment>
  );
};

export default Chat;
