const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log(`Server is Started at 3000 Port`)
    })
  } catch (e) {
    console.log(`DB Error : ${e.messafe}`)
    process.exit(1)
  }
}

initializeDBAndServer()

// 1

app.get('/movies/', async (request, response) => {
  const GetAllMoviesQuery = `
    SELECT 
    movie_name
    FROM 
    movie;
    `
  const AllMoviesArray = await db.all(GetAllMoviesQuery)

  response.send(AllMoviesArray.map(each => ({movieName: each.movie_name})))
})

// 2

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails

  const AddMovieQuery = `
  INSERT INTO
  movie (director_id,movie_name,lead_actor)
  VALUES (
    ${directorId},
    '${movieName}',
    '${leadActor}'
  );
  `

  await db.run(AddMovieQuery)
  response.send('Movie Successfully Added')
})

//3

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const GetMovieByIDQuery = `SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`

  const movie = await db.get(GetMovieByIDQuery)
  const resMovie = {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  }

  response.send(resMovie)
})

// 4

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body

  const {directorId, movieName, leadActor} = movieDetails

  const UpdateMovieQuery = `
  UPDATE
  movie
  SET
   director_id = ${directorId},
   movie_name = '${movieName}',
   lead_actor = '${leadActor}'
  WHERE
    movie_id = ${movieId};

  `
  await db.run(UpdateMovieQuery)
  response.send('Movie Details Updated')
})

//5

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params

  const DeleteMovieByIDQuery = `
    DELETE
    FROM
      movie
    WHERE
      movie_id = ${movieId};`

  await db.run(DeleteMovieByIDQuery)
  response.send('Movie Removed')
})

// 6

app.get('/directors/', async (request, response) => {
  const GetDirectorsQuery = `SELECT
      *
    FROM
      director
    ORDER BY
     director_id;`

  const DirectorsArray = await db.all(GetDirectorsQuery)

  response.send(
    DirectorsArray.map(eachd => ({
      directorId: eachd.director_id,
      directorName: eachd.director_name,
    })),
  )
})

// 7

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params

  const GetMovieByDidQuery = `SELECT
      *
    FROM
      movie
    WHERE
      director_id = ${directorId};`

  const MoviesArray = await db.all(GetMovieByDidQuery)

  response.send(
    MoviesArray.map(eachm => ({
      movieName: eachm.movie_name,
    })),
  )
})

module.exports = app
