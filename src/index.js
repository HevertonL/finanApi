const express = require('express');
const {v4: uuidv4} = require("uuid");

const app = express();

app.use(express.json())

const customers = [];

/* 
* id = uuid
* cpf = string;
* name = string;
* movimentation = []
*/

app.post("/account", (req, resp) => {
  const {cpf, name} = req.body;
  const customerAlreadyExists = customers
  .some((customer) => customer.cpf === cpf);

  if(customerAlreadyExists) {
    return resp.status(400).json({error:"CPF já existe no banco de dados"})
  }

customers.push({
  cpf,
  name,
  id: uuidv4(),
  movimentation: [],
});

return resp.status(201).send();

});

app.get("/movimentation/:cpf", (req, resp) => {
  const {cpf} = req.params;
  const customer = customers.find(customer => customer.cpf === cpf)

  return resp.json(customer.movimentation);
});

app.listen(3331);