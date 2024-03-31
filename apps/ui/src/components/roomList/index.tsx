import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../wsHandler";

import { setCurrentRoom } from "../../state/room.reducer";

const RoomList = ({ isOpen, onClose }: { isOpen: boolean; onClose: any }) => {
  const dispatch = useDispatch();
  const rooms = useSelector((state: any) => state.room.rooms);
  const [roomName, setRoomName] = useState("room1");
  const [userName, setUsername] = useState(
    `kitty${Math.floor(Math.random() * 100)}`
  );
  const [step, setStep] = useState<number>(1);
  const [avatarId, setAvatarId] = useState<number>(1);

  const buttons = [
    { id: 1, url: "1_r.png" },
    { id: 2, url: "2_r.png" },
    { id: 3, url: "3_r.png" },
    { id: 4, url: "4_r.png" },
    { id: 5, url: "5_r.png" },
  ];

  // step 1
  const handleSelectRoom = (rId: string) => {
    dispatch(setCurrentRoom(rId));
    setRoomName(rId);
    setStep(2);
  };

  // step 2
  const handleSelectName = (e: any) => {
    e.preventDefault();
    socket.emit("userCreation", { roomName, userName, avatarId });
    onClose();
  };

  useEffect(() => {
    socket.emit("getRoomList");
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-opacity-50 ${
        isOpen ? "" : "hidden"
      }`}
    >
      {/* Step 1 - Room creation/selection */}
      {step === 1 && (
        <div className="bg-white p-4 rounded shadow lg:w-1/5 md:w-2/5 w-3/5">
          <h2 className="text-xl font-bold mb-4 text-center">Lobby</h2>

          <div className="pr-4 pl-4 pb-4">
            {rooms.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="py-2 px-4 text-left">Rooms online</th>
                    <th className="py-2 px-4 text-left">Cats</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room: any, idx: number) => (
                    <tr key={idx}>
                      <td
                        onClick={() => handleSelectRoom(room.title)}
                        className="py-2 px-4 text-aldebaran hover:text-black cursor-pointer"
                      >
                        {room.title}
                      </td>
                      <td className="py-2 px-4">{room.numCats}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No rooms available.</p>
            )}

            <div className="flex mt-6">
              <input
                className="px-4 py-2 border border-gray-100 flex-initial w-4/5"
                type="text"
                placeholder="Name your room"
                onChange={({ target }) => setRoomName(target.value)}
                value={roomName}
              />
              <button
                className="px-4 py-2 flex-shrink-0 bg-aldebaran text-white"
                onClick={() => handleSelectRoom(roomName)}
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 - Username selection */}
      {step === 2 && (
        <div className="bg-white p-4 rounded shadow lg:w-1/5 md:w-2/5 w-3/5">
          <h2 className="text-xl font-bold mb-4 text-center">
            Enter your name
          </h2>

          <form className="pr-4 pl-4 pb-4 flex" onSubmit={handleSelectName}>
            <input
              type="text"
              value={userName}
              onChange={({ target }) => setUsername(target.value)}
            />
            <button
              className="px-4 py-2 flex-shrink-0 bg-aldebaran text-white"
              onClick={() => handleSelectRoom(roomName)}
            >
              Join
            </button>
          </form>
          <div className="flex items-center justify-center">
            {buttons.map((button, idx: number) => {
              const baseClass: string =
                "flex items-center justify-center rounded-md p-2 ml-1 border-2";
              const className: string =
                buttons[idx].id === avatarId
                  ? baseClass + " border-blue-300"
                  : baseClass + " border-gray-200";

              return (
                <button
                  key={idx}
                  onClick={() => setAvatarId(buttons[idx].id)}
                  className={className}
                >
                  <img src={button.url} className="w-8 h-8" alt="" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* este boton debe mostrarse con la condicion de que ya pertenezca a una sala */}
      {/* <button className="text-black px-4 py-2 rounded mt-4" onClick={onClose}>
          Close
        </button> */}
    </div>
  );
};

export default RoomList;
