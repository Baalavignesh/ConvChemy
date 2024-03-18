import { api } from "../../../../convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import React, { useState, useEffect } from "react";

const Timer = (props: any) => {
  const gameCode = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId") as Id<"users">;
  const game = useQuery(api.game.getGame, {
    sessionId: gameCode as Id<"sessions">,
  });

  const leaderboard = useQuery(api.game.getLeaderboard, {
    sessionId: gameCode as Id<"sessions">,
  });

  const userPosition = leaderboard?.findIndex(
    (entry) => entry.userId === userId
  );


  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  };


  return (
    <div className="flex-row amatic z-50 text-white p-4 rounded-br-md flex justify-center gap-2 font-semibold">
      <div className={`z-50 text-5xl text-white rounded-br-md flex justify-center gap-2 items-center ${(game?.timeRemaining ?? 0) < 10 ? "text-red-600 animate-pulse": "text-white"}`}>
        ⏱️ {formatTime(game?.timeRemaining ?? 0)}
      </div>
      <div className="text-3xl">
       👑 {((userPosition ?? 0) + 1) > 10 ? ((userPosition ?? 0) + 1) :"0"+ ((userPosition ?? 0) + 1)}/{props.game.playerCount > 10 ? props.game.playerCount : "0"+props.game.playerCount} - {leaderboard && leaderboard[userPosition ?? 0].score} pts
      </div>
    </div>
  );
};

export default Timer;
