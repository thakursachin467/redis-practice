const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');
const Port = 3000;
const app = express();

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));

app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

//create client
let client = redis.createClient();
client.on('connect', () => {
  console.log('redis connected');
})

app.post('/user/search', (req, res, next) => {
  const id = req.body.id;
  client.hgetall(id, (err, data) => {
    if (!data) {
      res.render('searchusers', { err: 'User does not exist' });
    } else {
      data.id = id;
      res.render('details', {
        user: data
      })
    }
  })

});

app.delete('/user/delete/:id', (req, res, next) => {
  client.del(req.params.id, (err, data) => {
    if (!err) {
      res.redirect('/');
    }
  });
});


app.post('/user/add', (req, res, next) => {
  const id = req.body.id;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const phone = req.body.phone;
  client.hset(id, ['firstName', firstName, 'lastName', lastName, 'email', email, 'phone', phone], (err, data) => {
    if (data) {
      console.log(data);
      res.redirect('/');
    }
    if (err) {
      res.render('adduser', {
        err: err
      })
    }
  });
});

app.get('/user/add', (req, res, next) => {
  res.render('adduser');
})

app.get('/', (req, res, next) => {
  res.render('searchusers');
})

app.listen(Port, () => {
  console.log(`App running on ${Port}`)
})