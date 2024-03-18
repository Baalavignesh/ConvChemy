import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgvideo from "../../assets/video/bgvideo.mp4";
import { api } from "../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "convex/_generated/dataModel";
import { Fade } from "@mui/material";
import MyToast from "@/components/toast/mytoast";

const Welcome: React.FC = () => {
  let navigate = useNavigate();
  const [gameCode, setGameCode] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [showToast, setShowToast] = useState<boolean>(false);

  const game = useQuery(api.game.getGame, {
    sessionId: gameCode as Id<"sessions">,
  });
  const createGameMut = useMutation(api.game.createGame);
  const joinGameMut = useMutation(api.game.joinGame);
  const updateGameMut = useMutation(api.game.updateGame);

  async function createGame() {
    if (username.length > 0) {
      const { sessionId, userId } = await createGameMut({ username });
      localStorage.setItem("sessionId", sessionId);
      localStorage.setItem("userId", userId);
      navigate("/lobby");
    } else {
      setShowToast(!showToast);

      setTimeout(() => {
        setShowToast(!showToast);
      }, 3000);
    }
  }

  async function joinGame() {
    if (gameCode.length > 0 && username.length > 0 && game) {
      console.log(game);
      const { sessionId, userId } = await joinGameMut({
        sessionId: gameCode as Id<"sessions">,
        username,
      });
      if (game && game.playerCount)
        await updateGameMut({ sessionId, playerCount: game?.playerCount + 1 });
      if (sessionId && userId) {
        localStorage.setItem("sessionId", sessionId);
        localStorage.setItem("userId", userId);
        if (game.isStarted) navigate("/game");
        else navigate("/lobby");
      }
    } else {
      setShowToast(!showToast);

      setTimeout(() => {
        setShowToast(!showToast);
      }, 3000);
    }
  }

  let handleInput = (e: any) => {
    setGameCode(e.target.value);
  };

  return (
    <Fade in={true} timeout={3000}>
      <main className="container max-h-screen min-h-screen flex flex-col justify-center items-center gap-8">
        <video
          className="videoTag"
          autoPlay
          loop
          muted
          style={{
            position: "absolute",
            width: "100%",
            height: "100vh",
            top: "0",
            objectFit: "cover",
            zIndex: "",
          }}
        >
          <source src={bgvideo} type="video/mp4" />
        </video>
        <h1 className="text-8xl amatic animate-wiggle">Convchemy</h1>
        {showToast && <MyToast title="Please enter a name" />}

        <div className="z-0 flex flex-col justify-center items-center gap-8">
          <input
            placeholder="Enter your name"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            className="p-2 rounded-lg w-72 placeholder:amatic placeholder:text-3xl text-dark-color amatic text-3xl border-4 border-gray-200 focus:border-secondary1 focus:outline-none focus:ring-0 transition duration-700"
          />
          <button
            className="px-6 py-8 bg-secondary2 rounded-lg text-4xl amatic hover:bg-secondary1 duration-700"
            onClick={createGame}
          >
            Start a Game
          </button>
          <p className="amatic text-2xl">or</p>
          <div className="flex gap-6">
            <input
              placeholder="enter the code"
              onChange={handleInput}
              value={gameCode}
              className="p-6 rounded-lg placeholder:amatic placeholder:text-4xl text-dark-color amatic text-4xl border-4 border-gray-200 focus:border-secondary1 focus:outline-none focus:ring-0 transition duration-700"
            />
            <button
              className="px-4 py-6 bg-secondary2 rounded-lg text-3xl amatic transition hover:bg-secondary1 duration-700"
              onClick={joinGame}
            >
              Join Game
            </button>
          </div>
        </div>
      </main>
    </Fade>
  );
};

export default Welcome;
