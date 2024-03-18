import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Welcome from "./pages/welcome/welcome";
import Game from "./pages/game/game";
import Lobby from "./pages/lobby/lobby";
import MyFooter from "./components/footer/footer";

function App() {
  return (
    <div className="bg-dark-color">
      <MyFooter />
    <Router>
      <Routes>
        <Route path="/" Component={Welcome} />
        <Route path="/lobby" Component={Lobby} />
        <Route path="/game" Component={Game} />
      </Routes>
    </Router>
    </div>

  );
}

export default App;
