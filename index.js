const express = require('express')
const app = express()
require('dotenv').config()

const Note = require('./models/note.js')

app.use(express.static('dist'))

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'maldormatted id' })
  }
  next(error)
}

const logger = require('./loggerMiddleware')

const cors = require('cors')

app.use(cors())

app.use(express.json())
app.use(logger)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response, next) => {
  // const id = Number(request.params.id)
  // const note = Note.find(note => note.id === id)
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      next(error)
      console.log(error)
    })
})

app.post('/api/notes/', (request, response) => {
  const body = request.body

  if (body.content === undefined) {
    return response.status(400).json({
      error: 'note.content is missing'
    })
  }
  // const ids = notes.map(note => note.id)
  // const maxId = Math.max(...ids)

  // const newNote = {
  //   id: maxId + 1,
  //   content: note.content,
  //   important: typeof note.important !== 'undefined' ? note.important : false
  // }
  // notes = notes.concat(newNote)
  const note = new Note({
    content: body.content,
    important: body.important || false
  })
  note.save().then(savedNote => {
    response.json(savedNote)
  })
  response.status(201).json(note)
})

app.delete('/api/notes/:id', (request, response, next) => {
  // const id = Number(request.params.id)
  // Note.filter(note => note.id !== id)
  // response.status(204).end()
  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/notes:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updateNote => {
      response.json(updateNote)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

// app.use((request, response) => {
//   console.log(request.path)

//   response.status(404).json({
//     error: 'Not found'
//   })
// })

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server runing on port ${PORT}`)
})
