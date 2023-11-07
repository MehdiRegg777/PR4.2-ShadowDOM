const express = require('express')
const crypto = require('crypto')
const url = require('url')
const { v4: uuidv4 } = require('uuid')
const database = require('./utilsMySQL.js')
const shadowsObj = require('./utilsShadows.js')
const app = express()
const port = 3001

// Gestionar usuaris en una variable (caldrà fer-ho a la base de dades)
// let hash0 = crypto.createHash('md5').update("1234").digest("hex")
// let hash1 = crypto.createHash('md5').update("abcd").digest("hex")
// let users = [
//   {userName: 'user0', password: hash0, token: ''},
//   {userName: 'user1', password: hash1, token: ''}
// ]

// Inicialitzar objecte de shadows
let shadows = new shadowsObj()

// Crear i configurar l'objecte de la base de dades
var db = new database()
db.init({
  host: "localhost",
  port: 3308,
  user: "root",
  password: "pwd",
  database: "BaseDatosUser"
})

// Crear i configurar l'objecte de la base de dades
var db2 = new database()
db2.init({
  host: "localhost",
  port: 3308,
  user: "root",
  password: "pwd",
  database: "coches"
})

// Publicar arxius carpeta ‘public’ 
app.use(express.static('public'))

// Configurar per rebre dades POST en format JSON
app.use(express.json());

// Activar el servidor 
const httpServer = app.listen(port, appListen)
async function appListen () {
  await shadows.init('./public/index.html', './public/shadows')
  console.log(`Example app listening on: http://localhost:${port}`)
  console.log(`Development queries on: http://localhost:${port}/index-dev.html`)
}

// Close connections when process is killed
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
function shutDown() {
  console.log('Received kill signal, shutting down gracefully');
  httpServer.close()
  db.end()
  process.exit(0);
}

// Configurar la direcció '/index-dev.html' per retornar
// la pàgina que descarrega tots els shadows (desenvolupament)
app.get('/index-dev.html', getIndexDev)
async function getIndexDev (req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.send(shadows.getIndexDev())
}

// Configurar la direcció '/shadows.js' per retornar
// tot el codi de les shadows en un sol arxiu
app.get('/shadows.js', getShadows)
async function getShadows (req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(shadows.getShadows())
}

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
      case 'actionCreateCar':         result = await actionCreateCar(objPost); break;  
      case 'actionDeleteCar':           result = await actionDeleteCar(objPost);break;
      case 'mostrarTabla':           result = await actionTabla(objPost);break;
      default:
          result = {result: 'KO', message: 'Invalid callType'}
          break;
  }

  // Retornar el resultat
  res.send(result)

}



async function actionCheckUserByToken (objPost) {
  let tokenValue = objPost.token
  // Si troba el token a les dades, retorna el nom d'usuari
  let users = await db.query('select * from users');
  console.log(users, tokenValue)
  let user = users.find(u => u.token == tokenValue)
  if (!user) {
      return {result: 'KO'}
  } else {
      return {result: 'OK', userName: user.userName}
  }
}

async function actionLogout (objPost) {
  let tokenValue = objPost.token
  let users = await db.query('select * from users');
  // Si troba el token a les dades, retorna el nom d'usuari
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
    //console.log(users);

    // Buscar el usuario en los datos
    let user = users.find(u => u.userName == userName && u.password == hash);

    if (!user) {
      return { result: 'KO' };
    } else {
      let token = uuidv4();
      //user.token = token;
      ////
      const edittoken = {
        userName: userName,
        tokenn: token
      };
      const sqlQuery = `UPDATE users SET token = '${edittoken.tokenn}' WHERE userName = '${edittoken.userName}'`;
      const queryResult = await db.query(sqlQuery);
      console.log('Query Result:', queryResult);
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

// ******************* FUNCION INSERTAR COCHES EN LA TABLA *****************************
async function actionCreateCar(objPost) {
  let marca = objPost.marca;
  let modelo = objPost.modelo;
  let color = objPost.color;
  let any = parseInt(objPost.any, 10);
  let precio = parseInt(objPost.precio, 10);
  const ejemploUsuario = {
    marca: marca,
    modelo: modelo,
    any: any,
    color: color,
    precio: precio
  };

  const sqlQuery2 = `INSERT INTO coche (marca, modelo, any, color, precio) VALUES ('${ejemploUsuario.marca}', '${ejemploUsuario.modelo}', '${ejemploUsuario.any}', '${ejemploUsuario.color}', '${ejemploUsuario.precio}')`;
  try {
    // Realizar la consulta a la base de datos y esperar la respuesta
    const queryResult2 = await db2.query(sqlQuery2);
    console.log('Query Result:', queryResult2); 

    return { result: 'Coches', marca: marca, modelo: modelo, any: any, color: color, precio: precio};
  } catch (error) {
    // Manejar errores, por ejemplo:
    console.error("Error al ejecutar la consulta:", error);
    return { result: 'Error', error: error.message };
  }
}

// ****************** FUCNION ELIMINAR FILA DE LA TABLA ******************************
async function actionDeleteCar(objPost) {
  let carIdToDelete = objPost.carId;

  try {
      // Realizar la lógica para eliminar el automóvil en la base de datos
      // Ejemplo usando una consulta DELETE:
      const deleteQuery = `DELETE FROM coche WHERE id = ${carIdToDelete}`;
      const queryResult = await db2.query(deleteQuery);

      // Comprueba el resultado y devuelve 'OK' si la eliminación fue exitosa
      if (queryResult.affectedRows > 0) {
          return { result: 'OK' };
      } else {
          return { result: 'KO', message: 'Car not found or could not be deleted' };
      }
  } catch (error) {
      console.error("Error deleting car:", error);
      return { result: 'Error', error: error.message };
  }
}

// ****************** Mostrar las FILAS DE LAS TABLAS ******************************
async function actionTabla() {
  try {
    // Realizar la lógica para obtener los datos de la base de datos
    // Ejemplo usando una consulta SELECT:
    const mostrarTabla = `select * from coche`;
    const queryResult = await db2.query(mostrarTabla); // Asumiendo que tienes una conexión a la base de datos llamada "db"
    console.log(queryResult);
    if (queryResult.length > 0) {
      return { result: 'OK', data: queryResult };
    } else {
      return { result: 'KO', message: 'No se encontraron coches' };
    }
  } catch (error) {
    console.error("Error al obtener datos de coches:", error);
    return { result: 'Error', error: error.message };
  }
}