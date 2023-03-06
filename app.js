const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error :${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//get the list of player
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT *
    FROM cricket_team 
    ORDER BY player_id`;

  const playerList = await db.all(getPlayerQuery);
  //   response.send(playerList);
  response.send(
    playerList.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//post player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const postPlayerQuery = `
    INSERT INTO
    cricket_team (player_name,jersey_number,role )
    VALUES ('${playerName}',
         ${jerseyNumber},
         '${role}'
         )`;

  const playerList = await db.run(postPlayerQuery);
  //   console.log(playerList);
  //   const newPlayerId = playerList.lastID;
  response.send("Player Added to Team");
});

// get player

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      cricket_team 
    WHERE 
      player_id = ${playerId};`;
  const player = await database.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player)); // here we passed to the function
}); // so that we get correct key name

//Updates the detail
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const putPlayerQuery = `
    UPDATE cricket_team
    SET player_name='${playerName}',
         jersey_number=${jerseyNumber},
         role='${role}'
    
    WHERE player_id = ${playerId}`;
  //   console.log(putPlayerQuery);
  await db.run(putPlayerQuery);
  response.send("Player Details Updated");
});

// // Deletes a player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerQuery = `
  DELETE FROM cricket_team
  WHERE player_id = ${playerId}`;

  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
