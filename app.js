const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();

const dbPath = path.join(__dirname, "cricketTeam.db");

app.use(express.json());

let db = null;

// initializeDBAndServer using sqlite,sqlite3,path,handler ,try catch,port number

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server has started");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1); //process.exit(1);
  }
};

initializeDBAndServer(); //calling initializeDBAndServer

const editedOutput = (item) => {
  return {
    playerId: item.player_id,
    playerName: item.player_name,
    jerseyNumber: item.jersey_number,
    role: item.role,
  };
};

// GETING players list
app.get("/players/", async (request, response) => {
  const getQuery = `
    SELECT * FROM cricket_team`;
  const listOfPlayers = await db.all(getQuery);

  response.send(listOfPlayers.map((item) => editedOutput(item)));
});

//creating a player

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayerQuery = `
    INSERT INTO cricket_team ( player_name , jersey_number, role)
    VALUES (
        '${playerName}',
        '${jerseyNumber}',
        '${role}');`;
  const addedPlayer = await db.run(addPlayerQuery);
  const playerId = addedPlayer.lastID;
  response.send("Player Added to Team");
});

// getting a particular player

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM cricket_team
    WHERE player_id = '${playerId}'`;
  const player = await db.get(getPlayerQuery);
  response.send(editedOutput(player));
});

//update the player details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updateQuery = `
    UPDATE 
        cricket_team 
    SET 
        player_name = '${playerName}',
       jersey_number =  '${jerseyNumber}',
       role =  '${role}'
       WHERE player_id = '${playerId}';`;
  const updatedPlayer = await db.run(updateQuery);
  response.send("Player Details Updated");
});

//DELETE player

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE FROM cricket_team
    WHERE player_id = '${playerId}'`;
  await db.get(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
