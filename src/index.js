const express = require('express');
const req = require('express/lib/request');
const {v4: uuidv4} = require("uuid");

const app = express();

app.use(express.json())

const customers = [];

function verifyIfAccountCPF(req, resp, next) {
  const {cpf} = req.headers;
  const customer = customers.find(customer => customer.cpf === cpf);

  if(!customer) {
    return resp.status(400).json({error: "Conta não existe"});
  }

  req.customer = customer;

  return next();
}

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

app.get("/movimentation", verifyIfAccountCPF, (req, resp) => {
  const {customer} = req;

  return resp.json(customer.movimentation);
});

app.post("/deposit", verifyIfAccountCPF, (req, resp) => {
  const {description, amount} = req.body;
  
  const {customer} = req;

  const movimentationDeposit = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.movimentation.push(movimentationDeposit);
  return resp.status(201).send();

})

app.listen(3331);