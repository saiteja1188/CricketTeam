const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbpath = path.join(__dirname, 'cricketTeam.db')

let database = null

const initalizeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initalizeDbAndServer()

const converToResponseObject = DbObject => {
  return {
    playerId: DbObject.player_id,
    playerName: DbObject.player_name,
    jerseyNumber: DbObject.jersey_number,
    role: DbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const getPlayersList = `
  SELECT
    * 
  FROM 
    cricket_team;
  `
  const PlayerList = await database.all(getPlayersList)
  response.send(PlayerList.map(DbObject => converToResponseObject(DbObject)))
})

// Get A Single Player

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
  SELECT
    *
  FROM 
    cricket_team
  WHERE
    player_id = ${playerId};
  `
  const player = await database.get(getPlayerQuery)
  response.send(converToResponseObject(player))
})

// Add Player to Cricket_tema

app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const addPlayerQuery = `
  INSERT INTO 
  cricket_team (
    player_name, jersey_number, role
  )
  VALUES ( 
    '${playerName}',
    ${jerseyNumber},
    '${role}'      
  );
  `
  await database.run(addPlayerQuery)
  response.send('Player Added to Team')
})

//Update Player

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const updatePlayer = `
  UPDATE
    cricket_team
  SET
   player_name = "${playerName}",
   jersey_number = ${jerseyNumber},
   role = "${role}"
  WHERE 
    player_id = ${playerId}
  `
  await database.run(updatePlayer)
  response.send('Player Details Updated')
})

// dalete player

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteQuery = `
  DELETE FROM
    cricket_team
  WHERE
   player_id = ${playerId};
  `
  await database.run(deleteQuery)
  response.send('Player Removed')
})

module.exports = app
