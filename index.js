const express = require('express')
const { response } = require('express')
const app = express()
const morgan = require('morgan')

app.use(morgan((tokens, req,res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens['personData'](req)
    ].join(' ')
}
))

morgan.token('personData', (req) => {
    const person = JSON.stringify(req.body)
    if(req.method === 'POST'){
        return person
    } else {
        return ''
    }
})

app.use(express.json())

morgan.token('host', (req,res) => {
    return req.hostname;
})

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

app.get('/api/persons/', (request, response) => {
    
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        return response.json(person)
    } else {
        return response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.get('/info', (request, response) => {
    response.send(`<div>
    Phonebook has info for ${persons.length} people
    </div> 
    <div>${new Date()}</div>`)
})

const generateId = () => {
    const randomId = Math.floor(Math.random() * (99999 - 0))
    return randomId
}

const doesNameExist = (name) => {
    return persons.find(person => person.name === name)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(404).json({
            error: 'content missing'
        })
    } else if (doesNameExist(body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)
    response.json(person)
})


const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})