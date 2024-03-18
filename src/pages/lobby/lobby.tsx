import { useEffect, useState } from "react";
import bgvideo from "../../assets/video/bgvideo.mp4";
import { useNavigate } from "react-router-dom";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Fade } from "@mui/material";
import MyToast from "@/components/toast/mytoast";

const Lobby: React.FC = () => {
  const [gameTime, setGameTime] = useState<number>(1);
  const gameCode = localStorage.getItem("sessionId");
  const [showToast, setShowToast] = useState<boolean>(false);

  const userId = localStorage.getItem("userId") as Id<"users">;
  const game = useQuery(api.game.getGame, {
    sessionId: gameCode as Id<"sessions">,
  });
  const startGameMut = useAction(api.game.startGame);

  let navigate = useNavigate();

  async function beginGame() {
    //TODO: check for playerCount > 1 : toast "need more players"
    if (game && game.host === userId && (game?.playerCount ?? 0) > 1) {
      await startGameMut({
        sessionId: gameCode as Id<"sessions">,
        totalTime: gameTime * 60,
      });
      navigate("/game");
    } else {
      setShowToast(!showToast);

      setTimeout(() => {
        setShowToast(!showToast);
      }, 3000);
    }
  }

  useEffect(() => {
    if(game?.isStarted) navigate("/game");
  }, [game]);

  return (
    <Fade in={true} timeout={2000}>
      <main className="container max-h-screen min-h-screen flex flex-col justify-center items-center gap-8 z-10">
        <video
          className="videoTag"
          autoPlay
          loop
          muted
          style={{
            position: "absolute",
            width: "100%",
            top: "0",
            zIndex: "0",
            objectFit: "cover",
            height: "100vh",
          }}
        >
          <source src={bgvideo} type="video/mp4" />
        </video>

        <div className="z-10 flex flex-col justify-center items-center gap-8 w-full">

        {showToast && <MyToast title="Minimum 2 players needed" />}


          <h1 className="text-8xl amatic border-b-4">Convchemy</h1>

          <div className="rounded py-12 px-8 w-1/2 text-center amatic">
            <h4 className="text-5xl  animate-wiggle">Waiting for players...</h4>
            <h4 className="text-3xl mt-6">
              {game?.playerCount ?? 0} players has joined
            </h4>

            <div className="flex flex-col gap-6 mt-4 bg-slate-400 p-4 py-8 bg-opacity-10 rounded-lg">
              <div className="flex flex-row justify-between">
                <div className="flex gap-4 items-center border-b-4 p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                  <h2 className="text-3xl self-start">Settings</h2>
                </div>
                <h2
                  onClick={() => {
                    navigator.clipboard.writeText(gameCode as string);
                  }}
                  className="text-3xl cursor-pointer"
                >
                  Game Code
                </h2>
              </div>
              <label className="self-start text-2xl">Time in minutes</label>
              <input
                placeholder="Minutes"
                type="number"
                value={gameTime}
                onChange={(e) => setGameTime(Number(e.target.value))}
                step="any"
                className="p-2 rounded-lg placeholder:amatic placeholder:text-xl text-dark-color amatic text-xl border-4 border-gray-200 focus:border-secondary1 focus:outline-none focus:ring-0 transition duration-700"
              />
            </div>
          </div>

          <button
            className="px-6 py-8 bg-secondary2 rounded-lg text-4xl amatic hover:bg-secondary1 duration-700 cursor-pointer"
            disabled={((game?.playerCount ?? 0) < 2 && game?.host != userId)}
            onClick={beginGame}
            
          >
            {(game?.host === userId) ? "Begin the chemistry" : "Waiting for host"}
          </button>
        </div>
      </main>
    </Fade>
  );
};

export default Lobby;
