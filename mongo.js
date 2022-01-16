const mongoose = require('mongoose')

if (process.argv.length < 5) {
  console.log(
    'provide arguments: node mongo.js <password> <name> <phonenumber>'
  )
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const phone_number = process.argv[4]

const url = `mongodb+srv://fullstack:${password}@cluster0.mwars.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
  name: String,
  date: Date,
  phone_number: String,
})

const Person = mongoose.model('Person', phonebookSchema)

const person = new Person({
  name: name,
  date: new Date(),
  phone_number: phone_number,
})

person.save().then(() => {
  console.log(`added ${name} ${phone_number} to phonebook`)
  mongoose.connection.close()
})
