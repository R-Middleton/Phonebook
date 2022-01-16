require('dotenv').config()
const express = require('express')
const { response } = require('express')
const app = express()
const morgan = require('morgan')
const Person = require('./models/person')

/// Middleware setup

app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens['personData'](req),
    ].join(' ')
  })
)

morgan.token('personData', (req) => {
  const person = JSON.stringify(req.body)
  if (req.method === 'POST') {
    return person
  } else {
    return ''
  }
})

app.use(express.static('build'))
app.use(express.json())

const cors = require('cors')
app.use(cors())

morgan.token('host', (req, res) => {
  return req.hostname
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.get('/api/persons/', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      console.log('Person found', person)
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => {
      console.log('What is this')
      next(error)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

/* app.get('/info', (request, response) => {
  response.send(`<div>
    Phonebook has info for ${persons.length} people
    </div> 
    <div>${new Date()}</div>`)
}) */

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (body.name === undefined || body.phone_number === undefined) {
    return response.status(400).json({
      error: 'content missing',
    })
  }

  const person = new Person({
    name: body.name,
    phone_number: body.phone_number,
    date: new Date(),
  })

  console.log('new person', person)

  person.save().then((savedPerson) => {
    response.json(savedPerson)
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
