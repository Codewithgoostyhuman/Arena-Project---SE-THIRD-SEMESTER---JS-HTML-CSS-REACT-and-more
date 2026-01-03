import React from 'react'
import Register from './UI-Components/Register.jsx';
import Login from './UI-Components/Login.jsx';
import ActivateUsers from './UI-Components/ActivateUsers.jsx';
import NumberGuessDuelUI from './GameComponents/NumberGuessDuelUI.jsx';
import Player from './ClassesForTheProject/Player.js'
import Match from "./ClassesForTheProject/Match.js"
import NumberGuessDuel from './ClassesForTheProject/GameLogics/numberguessduellogic.js';
import SingleEliminationTournamentStyle from "./ClassesForTheProject/TournamentStyles/SingleEliminationTournamentStyle.js"

const App = () => {
  let player1 = new Player(123,"Zeeshan1","zeeshan@gmail.com","123","player","active");
  let player2 = new Player(123,"Zeeshan2","zeeshan@gmail.com","123","player","active");
  let singleElimination = new SingleEliminationTournamentStyle([player1,player2])
  let match = new Match(NumberGuessDuel,[player1,player2]);
  return (
    <div>
      {/* <Register /> */}
      {/* <Login /> */}
      {/* <ActivateUsers /> */}
      <NumberGuessDuelUI />
    </div>
  )
}

export default App
