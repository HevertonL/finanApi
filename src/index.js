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

function getBalance(movimentation) {
  const balance = movimentation.reduce((acc, op) => {
  if (op.type === "credit") {
    return acc + op.amount;
  } else {
    return acc - op.amount;
  }
  }, 0);
  return balance;
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

app.post("/deposit", verifyIfAccountCPF, (req, resp) => {
  const {description, amount} = req.body;
  
  const {customer} = req;

  const op = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.movimentation.push(op);
  return resp.status(201).send();

})

app.post("/withdraw", verifyIfAccountCPF, (req, resp) => {
 const {description, amount} = req.body;
 const {customer} = req;

 const balance = getBalance(customer.movimentation);
 
 if (balance < amount) {
   return resp.status(400).json({error: "Insufficient funds!"})
 }

 const op = {
  description,
  amount,
  created_at: new Date(),
  type: "debit"
};

 customer.movimentation.push(op);
 return resp.status(201).send();

})

app.get("/movimentation", verifyIfAccountCPF, (req, resp) => {
  const {customer} = req;

  return resp.json(customer.movimentation);
});

app.get("/movimentation/date", verifyIfAccountCPF, (req, resp) => {
  const {customer} = req;
  const {date} = req.query;

  const dateFormat = new Date(date + " 00:00");

  const movimentation = customer.movimentation.filter(
    (movimentation) => 
    movimentation.created_at.toDateString() === 
    new Date(dateFormat).toDateString());

  return resp.json(movimentation);
});

app.get("/account", verifyIfAccountCPF, (req, resp) => {
  const {customer} = req;

  return resp.json(customer);
})

app.put("/account", verifyIfAccountCPF, (req, resp) => {
const {name} = req.body;
const {customer} = req;


customer.name = name;

return resp.status(201).send()

})

app.listen(3331);