const express = require('express');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const database = require('./utilsMySQL.js');
const shadowsObj = require('./utilsShadows.js');
const app = express();
const port = 3002;

// Crear y configurar el objeto de la base de datos para usuarios
const db = new database();
db.init({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'pwd',
  database: 'BaseDatosUser'
});

// Crear y configurar el objeto de la base de datos para coches
const db2 = new database();
db2.init({
  host: 'localhost',
  port: 3308,
  user: 'root',
  password: 'pwd',
  database: 'coches'
});

// Inicializar objeto de shadows
const shadows = new shadowsObj();

app.use(express.static('public'));
app.use(express.json());

const httpServer = app.listen(port, appListen);

async function appListen() {
  await shadows.init('./public/index.html', './public/shadows');
  console.log(`Example app listening on: http://localhost:${port}`);
}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

function shutDown() {
  console.log('Received kill signal, shutting down gracefully');
  httpServer.close();
  db.end();
  db2.end();
  process.exit(0);
}

app.get('/index-dev.html', getIndexDev);

async function getIndexDev(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.send(shadows.getIndexDev());
}

app.get('/shadows.js', getShadows);

async function getShadows(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(shadows.getShadows());
}


// CREACION FILAS ******************************************************************************
app.post('/createCar', actionCreateCar);S

// Configurar la direcció '/ajaxCall'
app.post('/ajaxCall', ajaxCall)
async function ajaxCall (req, res) {
  let objPost = req.body;
  let result = ""

  // Simulate delay (1 second)
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Processar la petició
  switch (objPost.callType) {
      case 'actionCheckUserByToken':  result = await actionCheckUserByToken(objPost); break
      case 'actionLogout':            result = await actionLogout(objPost); break
      case 'actionLogin':             result = await actionLogin(objPost); break
      case 'actionSignUp':            result = await actionSignUp(objPost); break
      case 'createCar': // Agregar el nuevo caso para la creación de un carro
      result = await actionCreateCar(objPost);
      break;

      
      default:
          result = {result: 'KO', message: 'Invalid callType'}
          break;
  }
  let coches = await db2.query('select * from coche');
  // result = { result: 'OK', coches: coches };
  console.log(coches);
  // Retornar el resultat
  res.send(result)
}


// ****************************************************************************

async function actionCheckUserByToken (objPost) {
  let tokenValue = objPost.token
  // Si troba el token a les dades, retorna el nom d'usuari
  let users = await db.query('select * from users');
    console.log(users);
  let user = users.find(u => u.token == tokenValue)
  if (!user) {
      return {result: 'KO'}
  } else {
      return {result: 'OK', userName: user.userName}
  }
}

async function actionLogout (objPost) {
  let tokenValue = objPost.token
  // Si troba el token a les dades, retorna el nom d'usuari
  let users = await db.query('select * from users');
    console.log(users);
  let user = users.find(u => u.token == tokenValue)
  if (!user) {
      return {result: 'OK'}
  } else {
      return {result: 'OK'}
  }
}

async function actionLogin(objPost) {
  let userName = objPost.userName;
  let userPassword = objPost.userPassword;
  let hash = crypto.createHash('md5').update(userPassword).digest("hex");

  try {
    let users = await db.query('select * from users');
    console.log(users);

    // Buscar el usuario en los datos
    let user = users.find(u => u.userName == userName && u.password == hash);

    if (!user) {
      return { result: 'KO' };
    } else {
      let token = uuidv4();
      user.token = token;
      return { result: 'OK', userName: user.userName, token: token };
    }
  } catch (error) {
    console.error(error);
    return { result: 'Error al acceder a la base de datos' };
  }
}


async function actionSignUp(objPost) {
  let userName = objPost.userName;
  let userPassword = objPost.userPassword;
  let hash = crypto.createHash('md5').update(userPassword).digest("hex");
  let token = uuidv4();

  const ejemploUsuario = {
    userName: userName,
    password: hash,
    tokenn: token
  };

  const sqlQuery = `INSERT INTO users (userName, password, token) VALUES ('${ejemploUsuario.userName}', '${ejemploUsuario.password}', '${ejemploUsuario.tokenn}')`;

  try {
    // Realizar la consulta a la base de datos y esperar la respuesta
    const queryResult = await db.query(sqlQuery);
    console.log('Query Result:', queryResult);

    //const [results] = queryResult;

    // Aquí puedes manejar los resultados si es necesario

    return { result: 'OK', userName: userName, tokenn: token };
  } catch (error) {
    // Manejar errores, por ejemplo:
    console.error("Error al ejecutar la consulta:", error);
    return { result: 'Error', error: error.message };
  }
}


  async function actionCreateCar(req, res) {
    try {
      const carData = req.body; // Recibiendo los datos del nuevo coche desde la solicitud POST

      const insertQuery = `INSERT INTO coche (marca, modelo, any, color, precio) VALUES (?, ?, ?, ?, ?)`;
      const insertValues = [carData.marca, carData.modelo, carData.any, carData.color, carData.precio];

      const queryResult = await db2.query(insertQuery, insertValues);
      console.log('Nuevo coche insertado:', queryResult);

      return res.send({ result: 'OK', message: 'Coche creado exitosamente' });
    } catch (error) {
      console.error('Error creando coche:', error);
      return res.status(500).send({ result: 'KO', message: 'Error al crear el coche' });
    }
  }
