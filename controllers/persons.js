const personsRouter = require('express').Router()
const Person = require('../models/person')

personsRouter.get('/', (request, response) => {
  Person.find({}).then((persons) => {
    console.log('persons', persons)
    response.json(persons)
  })
})

personsRouter.get('/:id', (request, response, next) => {
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

personsRouter.delete('/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

personsRouter.post('/', (request, response) => {
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

module.exports = personsRouter
