import React, { useState } from "react";

// components
import Chat from "@/components/chat";
import UserCharacter from "../userCharacter";
import RoomList from "../roomList";

import { updatePlayerPosition } from "../wsHandler";

// state management
import { useSelector } from "react-redux";
import { selectGridSize, selectPlayers } from "../../state/room.reducer";

const Room: React.FC<any> = () => {
  const gridSize = useSelector(selectGridSize);
  const players = useSelector(selectPlayers);
  const [modalOpen, setModalOpen] = useState(true);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const isMovementAllowed = (row: number, col: number): boolean => {
    // colisión con otros usuarios
    for (const { position } of players) {
      if (position.col === col && position.row === row) return false;
    }

    return true;
  };

  const handleCharacterMovement = (row: number, col: number) => {
    if (!isMovementAllowed(row, col)) return;

    updatePlayerPosition({ row, col });
  };

  const renderCells = (): React.ReactElement[] => {
    let cells: React.ReactElement[] = [];

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const player = players.find(
          ({ position }) => position.row === row && position.col === col
        );

        cells.push(
          <div
            key={`${row}-${col}`}
            onClick={() => handleCharacterMovement(row, col)}
            className="border-solid border border-white hover:border-isabella"
          >
            {player && (
              <UserCharacter
                avatar={(player?.avatar[player?.avatarXAxis] as string) ?? ""}
                userId={player.userId}
                userName={player.userName}
              />
            )}
          </div>
        );
      }
    }

    return cells;
  };

  return (
    <React.Fragment>
      <div className="flex flex-col items-center bg-aldebaran">
        <div className="gridMap grid grid-cols-10 grid-rows-10 w-80v h-70v">
          {players.length ? renderCells() : null}
        </div>
      </div>
      {/* <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        onClick={openModal}
      >
        Open Modal
      </button> */}
      <RoomList isOpen={modalOpen} onClose={closeModal} />
      {players.length ? <Chat /> : null}
    </React.Fragment>
  );
};

export default Room;
