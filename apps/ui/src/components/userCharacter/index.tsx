import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { userCleanMessage } from "../../state/room.reducer";

const UserCharacter = ({
  avatar,
  userId,
  userName,
}: {
  avatar: string;
  userId: string;
  userName: string;
}) => {
  const dispatch = useDispatch();
  const message = useSelector((state: any) => state.room.messages[userId]);
  const messageDurationSecs: number = 7;

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(userCleanMessage(userId));
    }, messageDurationSecs * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [message]);

  return (
    <div className="relative w-full h-full">
      {message ? (
        <div className="w-0 absolute">
          <span className="bubble">{message}</span>
        </div>
      ) : null}
      <img
        src={avatar}
        className="flex justify-center items-center mb-[50%] w-[40px] absolute"
      />
      <span className="text-xs text-white font-custom absolute mt-[32px] select-none">
        {userName}
      </span>
    </div>
  );
};

export default UserCharacter;
