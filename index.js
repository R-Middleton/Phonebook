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

app.get('/api/persons/', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  const person = Person.findById(request.params.id).then((person) =>
    response.json(person)
  )
  if (person) {
    return response.json(person)
  } else {
    return response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter((person) => person.id !== id)
  response.status(204).end()
})

/* app.get('/info', (request, response) => {
  response.send(`<div>
    Phonebook has info for ${persons.length} people
    </div> 
    <div>${new Date()}</div>`)
}) */

app.post('/api/persons', (request, response) => {
  const body = request.body
  console.log('body', body)

  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({
      error: 'content missing',
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    date: new Date(),
  })

  person.save().then((savedPerson) => {
    response.json(savedPerson)
  })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
