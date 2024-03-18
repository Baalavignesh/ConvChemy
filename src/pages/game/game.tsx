import React, { useState, useEffect } from "react";
import Draggable from "react-draggable";
import "./game.css";
import bgvideo from "../../assets/video/bgvideo.mp4";
import audio1 from "../../assets/audio/place-1.mp3";
import audio2 from "../../assets/audio/place-2.mp3";
import audio3 from "../../assets/audio/place-3.mp3";
import audio4 from "../../assets/audio/place-4.mp3";
import mergesound from "../../assets/audio/new-item.mp3";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Box from "@mui/material/Box";
import Timer from "./components/timer";
import { Fade } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

interface Position {
  id: number;
  x: number;
  y: number;
  element?: string;
  merged?: boolean;
  emoji?: string;
}

interface Item {
  id: string;
  element?: string;
  merged?: boolean;
  emoji?: string;
}

const Game: React.FC = () => {
  const gameCode = localStorage.getItem("sessionId");
  const userId = localStorage.getItem("userId") as Id<"users">;
  const game = useQuery(api.game.getGame, {
    sessionId: gameCode as Id<"sessions">,
  });

  const leaderboard = useQuery(api.game.getLeaderboard, {
    sessionId: gameCode as Id<"sessions">,
  });

  const navigate = useNavigate();

  const [bounds, setBounds] = useState<{
    top: number;
    left: number;
    right: number;
    bottom: number;
  }>({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  });

  const [value, setValue] = React.useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  useEffect(() => {
    console.log("game", game);
    const screenWidth = window.innerWidth;
    const newBounds = {
      top: -0 * screenWidth,
      left: -0 * screenWidth,
      right: 0.75 * screenWidth,
      bottom: 0.75 * screenWidth,
    };
    setBounds(newBounds);
  }, []);

  const [positions, setPositions] = useState<Position[]>([
    // Add more positions for other draggable elements here
  ]);


  const myItems = useQuery(api.game.getUserMatches, {
    sessionId: gameCode as Id<"sessions">,
    userId,
  });

  const matchElement = useAction(api.game.userMatchElement);

  const handleDrag = (index: number, ui: any) => {
    const newPositions = [...positions];
    newPositions[index] = {
      ...newPositions[index],
      x: newPositions[index].x + ui.deltaX,
      y: newPositions[index].y + ui.deltaY,
    };
    setPositions(newPositions);
  };

  const playAudio = () => {
    let audio;
    let randomsound = Math.floor(Math.random() * 4) + 1;

    switch (randomsound) {
      case 1:
        audio = new Audio(audio1);
        break;
      case 2:
        audio = new Audio(audio2);
        break;
      case 3:
        audio = new Audio(audio3);
        break;
      case 4:
        audio = new Audio(audio4);
        break;
      default:
        // Handle the case where randomsound is not between 1 and 4
        break;
    }

    if (audio) {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  };
  const handleStop = (index1: number) => {
    playAudio();

    positions.forEach(async (position2, index2) => {
      if (index1 !== index2 && areOverlapping(index1, index2)) {
        const newPositions = [...positions];
        newPositions[index1].merged = true;
        newPositions[index2].merged = true;
        setPositions(newPositions);

        // Remove merged elements from the position array
        setTimeout(() => {
          const filteredPositions = newPositions.filter(
            (position, index) => index !== index1 && index !== index2
          );
          setPositions(filteredPositions);
        }, 500);

        // Merging happens here
        // TODO - Do the API call here
        // After Merging add the newly created item to the myItems list

        const newMatch = await matchElement({
          sessionId: gameCode as Id<"sessions">,
          userId,
          element1: newPositions[index1].element!,
          element2: newPositions[index2].element!,
        });

        console.log("HERE WE GO ", newMatch);

        if (!newMatch.isNothing) {
          const newItemPosition = {
            id: newMatch.id,
            x: newPositions[index1].x,
            y: newPositions[index1].y,
            element: newMatch.result,
            merged: false,
            emoji: newMatch.emoji,
          };
          setPositions((prevPositions) => [...prevPositions, newItemPosition]);
        }

        let audio = new Audio(mergesound);
        audio.volume = 1;
        audio.play();
      }
    });
  };

  const checkOverlap = (rect1: DOMRect, rect2: DOMRect) => {
    return (
      rect1.left < rect2.right &&
      rect1.right > rect2.left &&
      rect1.top < rect2.bottom &&
      rect1.bottom > rect2.top
    );
  };

  const areOverlapping = (index1: number, index2: number) => {
    const element1 = document.getElementById(`draggable-${index1}`);
    const element2 = document.getElementById(`draggable-${index2}`);
    if (element1 && element2) {
      const rect1 = element1.getBoundingClientRect();
      const rect2 = element2.getBoundingClientRect();
      return checkOverlap(rect1, rect2);
    }
    return false;
  };

  const getRandomPosition = (item: Item) => {
    const newPosition: Position = {
      id: positions.length + 1,
      x: Math.floor(Math.random() * 500),
      y: Math.floor(Math.random() * 500),
      element: item.element,
      merged: false,
      emoji: item.emoji,
    };
    return newPosition;
  };

  const addRandomItem = (item: Item) => {
    const newPosition = getRandomPosition(item);
    while (
      positions.some((position) =>
        areOverlappingPositions(newPosition, position)
      )
    ) {
      newPosition.x = Math.floor(Math.random() * 500);
      newPosition.y = Math.floor(Math.random() * 500);
    }
    playAudio();
    setPositions((prevPositions) => [...prevPositions, newPosition]);
  };

  const areOverlappingPositions = (
    position1: Position,
    position2: Position
  ) => {
    return (
      Math.abs(position1.x - position2.x) < 100 &&
      Math.abs(position1.y - position2.y) < 100
    );
  };

  return (
    <Fade in={true} timeout={3000}>
      <div className="flex max-w-screen min-h-screen max-h-screen overflow-hidden relative bg-dark-color">
        {game && !game.isFinished ? (
          <>
            {/* Parent div */}
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
                zIndex: "0",
              }}
            >
              <source src={bgvideo} type="video/mp4" />
            </video>

            <div className="z-10">
              <div className="flex-1 relative parent-div z-10" id="parent-div">
                {positions.map((position, index) => (
                  <Draggable
                    key={position.id}
                    onDrag={(e, ui) => handleDrag(index, ui)}
                    onStop={() => handleStop(index)}
                    position={{ x: position.x, y: position.y }}
                    bounds={bounds} // 100px in any direction
                  >
                    <div
                      id={`draggable-${index}`}
                      className={`w-fit flex px-2 py-2 bg-dark-color2 text-white select-none rounded-xl  shadow-md cursor-pointer text-lg border-primary1 border-2 font-medium absolute ${
                        position.merged ? "my-fade-out" : "my-fade-in"
                      }`}
                    >
                      <span className="mr-2"> {position.emoji}</span>
                      {position.element!.charAt(0).toUpperCase() +
                        position.element!.slice(1)}
                    </div>
                  </Draggable>
                ))}

                {game && (
                  <Timer
                    seconds={game?.timeRemaining ?? 60}
                    game={game}
                    leaderboard={leaderboard}
                  />
                )}
              </div>

              {/* Right side div */}
              <div className="bg-dark-color2  gap-4 w-96 h-screen p-0 absolute right-0 top-0 bg-opacity-70">
                <TabContext value={value}>
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <TabList
                      onChange={handleChange}
                      aria-label="lab API tabs example"
                      className="amatic"
                    >
                      <Tab
                        label={
                          <h1 className="text-3xl amatic text-secondary1 font-semibold">
                            My Elements
                          </h1>
                        }
                        value="1"
                      />
                      <Tab
                        label={
                          <h1 className="text-3xl amatic text-secondary1 font-semibold">
                            Leaderboard
                          </h1>
                        }
                        value="2"
                      />
                    </TabList>
                  </Box>
                  <TabPanel value="1">
                    {" "}
                    <>
                      <div className="flex flex-wrap gap-2">
                        {myItems &&
                          myItems.map((item, index) => {
                            return (
                              <>
                                <div
                                  key={index}
                                  className="w-fit px-2 py-1 bg-dark-color text-white select-none rounded-xl  shadow-md cursor-pointer text-lg border-primary1 border-2 font-medium"
                                  // className="w-fit px-4 py-2 text-lg bg-slate-50 text-black rounded-md shadow-md cursor-pointer font-medium  h-fit select-none"
                                  onClick={() => addRandomItem(item)}
                                >
                                  <span className="mr-2"> {item.emoji}</span>
                                  {item.element!.charAt(0).toUpperCase() +
                                    item.element!.slice(1)}
                                </div>
                              </>
                            );
                          })}
                      </div>
                    </>
                  </TabPanel>
                  <TabPanel value="2">
                    <>
                      <div className="flex amatic text-3xl gap-2 justify-between font-extrabold mb-4">
                        <div className="flex ">
                          <p>Username</p>
                        </div>
                        <p> Elements Found</p>
                      </div>
                      {leaderboard &&
                        leaderboard.map((userPlace: any, index: number) => {
                          return (
                            <div className="flex amatic text-3xl gap-2 justify-between">
                              <div className="flex ">
                                <span className="mr-2">{index + 1}. </span>
                                <p>{userPlace.username}</p>
                              </div>

                              <p> {userPlace.score}</p>
                            </div>
                          );
                        })}
                    </>
                  </TabPanel>
                  <TabPanel value="3">Item Three</TabPanel>
                </TabContext>
              </div>
            </div>
          </>
        ) : (
          <>
            <Fade in={true} timeout={3000}>
              <div className="flex flex-col gap-6 select-none cursor-default amatic  h-screen justify-center items-center w-full">
                <p className="text-9xl">Game Over</p>

                {leaderboard &&
                  leaderboard
                    .slice(0, 5)
                    .map((userPlace: any, index: number) => {
                      return (
                        <div className="flex amatic text-3xl gap-2 justify-between">
                          <div className="flex ">
                            <span className="mr-2">{index + 1}. </span>
                            <p className="mr-6">{userPlace.username}</p>
                          </div>

                          <p> {userPlace.score}</p>
                        </div>
                      );
                    })}
                <button
                  className="px-4 py-6 bg-secondary2 rounded-lg text-4xl amatic hover:bg-secondary1 duration-700 cursor-pointer"
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  Play Again
                </button>
              </div>
            </Fade>
          </>
        )}
      </div>
    </Fade>
  );
};

export default Game;
