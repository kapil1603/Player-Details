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

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT *
    FROM cricket_team 
    ORDER BY player_id`;

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };

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
    cricket_team (playerName,jerseyNumber,role )
    VALUES (${playerName},
         ${jerseyNumber},
         ${role}
         )`;

  const playerList = await db.run(postPlayerQuery);
  const newPlayerId = playerList.lastID;
  response.send({ playerId: newPlayerId });
});

// get player

app.get("/players/:player_Id/", async (request, response) => {
  const { player_Id } = request.params;
  const getPlayer = `
    SELECT *
    FROM cricket_team 
    WHERE player_Id = ${player_Id}`;

  const player = await db.get(getPlayer);
  response.send(player);
});

//Updates the detail

app.put("/players/:player_Id/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const putPlayerQuery = `
    UPDATE cricket_team 
    SET {playerName:${playerName},
         jerseyNumber:${jerseyNumber},
         role:${role}
    }
    WHERE playerId = ${player_Id}`;

  await db.run(putPlayerQuery);
  response.send("Player Details Updated");
});

// Deletes a player

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerQuery = `
  DELETE FROM 
  WHERE playerId = ${player_Id}
    `;

  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
