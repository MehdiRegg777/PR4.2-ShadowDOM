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
  database: "Productos"
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
      case 'actionGetCarInfo':          result = await actionGetCarInfo(objPost); break;
      case 'actionShowTabla':          result = await actionShowTabla(objPost); break;
      case 'actionCreateTable':          result = await actionCreateTable(objPost); break;
      case 'actionModyfyTable':          result = await actionModyfyTable(objPost); break;
      case 'actionDeleteTable':          result = await actionDeleteTable(objPost); break;

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
  //console.log(users, tokenValue)
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
      //console.log('Query Result:', queryResult);
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
  console.log(objPost);

  const tableName = objPost.tabla;
  const columns = Object.keys(objPost).filter(key => key !== 'callType' && key !== 'tabla');
  const values = columns.map(column => `'${objPost[column]}'`).join(', ');

  const sqlQuery2 = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values})`;
  console.log(sqlQuery2);
  try {
    // Realizar la consulta a la base de datos y esperar la respuesta
    const queryResult2 = await db2.query(sqlQuery2);
    console.log('Query Result:', queryResult2); 

    return { result: 'Productos Creados'};
  } catch (error) {
    // Manejar errores, por ejemplo:
    console.error("Error al ejecutar la consulta:", error);
    return { result: 'Error', error: error.message };
  }
}

// ****************** FUCNION ELIMINAR FILA DE LA TABLA ******************************
async function actionDeleteCar(objPost) {
  let carIdToDelete = objPost.carId;
  const tableName = objPost.tabla;
  //console.log(tableName);
  try {
      // Realizar la lógica para eliminar el automóvil en la base de datos
      // Ejemplo usando una consulta DELETE:
      const deleteQuery = `DELETE FROM ${tableName} WHERE id = ${carIdToDelete}`;
      const queryResult = await db2.query(deleteQuery);
      //console.log(deleteQuery);
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
async function actionTabla(objPost) {
  let queTabla = objPost.queTabla;
  //console.log("Okk2");
  try {
    // Realizar la lógica para obtener los datos de la base de datos
    // Ejemplo usando una consulta SELECT:
    const mostrarTabla = `select * from ${queTabla}`;
    const queryResult = await db2.query(mostrarTabla); // Asumiendo que tienes una conexión a la base de datos llamada "db"
    //console.log(queryResult);
    if (queryResult.length > 0) {
      return { result: 'OK', data: queryResult , tabla: queTabla};
    } else {
      return { result: 'KO', message: 'No se encontraron coches' };
    }
  } catch (error) {
    console.error("Error al obtener datos de coches:", error);
    return { result: 'Error', error: error.message };
  }
}

// ****************** Mostrar tablas Creadas ******************************
async function actionShowTabla() {
  //console.log("Okk1");
  try {
    // Realizar la lógica para obtener los datos de la base de datos
    // Ejemplo usando una consulta SELECT:
    const mostrarTabla2 = `show tables;`;
    const queryResult = await db2.query(mostrarTabla2); // Asumiendo que tienes una conexión a la base de datos llamada "db"
    //console.log(queryResult);
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

// *************************** MODIFY **********************************************************

async function actionGetCarInfo(objPost) {
  let carId = objPost.carId;
  let opcionSelect = objPost.opcionSelect;
  let NewValue = objPost.NewValue;
  const tableName = objPost.tabla;
  const edittoken2 = {
    carId: carId,
    opcionSelect: opcionSelect,
    NewValue: NewValue

  };
  const querymodyfy = `UPDATE ${tableName} SET ${edittoken2.opcionSelect} = '${edittoken2.NewValue}' WHERE ID = ${edittoken2.carId}`;

  try {
    // Realizar la consulta a la base de datos y esperar la respuesta
    const queryResult3 = await db2.query(querymodyfy);
    console.log(queryResult3); 

    return { result: 'Coches', marca: marca, modelo: modelo, any: any, color: color, precio: precio};
  } catch (error) {
    // Manejar errores, por ejemplo:
    console.error("Error al ejecutar la consulta:", error);
    return { result: 'Error', error: error.message };
  }
}

// ******************* FUNCION CREAR TABLAS *****************************
async function actionCreateTable(objPost) {
  let tableName = objPost.tableName;
  let valoresInputs = objPost.valoresInputs;
  let valoresSelects = objPost.valoresSelects;

  const ejemploUsuario = {
     tableName: tableName,
  };
  const columnas = valoresInputs.map((input, index) => `${input} ${valoresSelects[index]}`).join('(50), ');
  const columnas2 = valoresInputs.map((input) => `${input}`).join(', ');
  const sqlQuery3 = `CREATE TABLE ${ejemploUsuario.tableName} (ID INT AUTO_INCREMENT PRIMARY KEY, ${columnas}(50));`;
  console.log(sqlQuery3);
  const sqlQuery4 = `INSERT INTO ${ejemploUsuario.tableName} (${columnas2}) VALUES (${columnas2});`;
  console.log(sqlQuery4);
  try {
    // Realizar la consulta a la base de datos y esperar la respuesta
    const queryResult3 = await db2.query(sqlQuery3);
    const queryResult4 = await db2.query(sqlQuery4);

    console.log(queryResult3); 
    console.log(queryResult4); 


    return { result: 'Tablas', tableName: queryResult3};
  } catch (error) {
    // Manejar errores, por ejemplo:
    console.error("Error al ejecutar la consulta:", error);
    return { result: 'Error', error: error.message };
  }
}

// *************************** MODIFY Columna Tabla **********************************************************

async function actionModyfyTable(objPost) {
  let casilla = objPost.casilla;
  let nuevoValor = objPost.nuevoValor;
  const tableName = objPost.tabla;
  const ValorType = objPost.selectsType;
  //console.log(ValorType);
  
  const querymodyfy = `ALTER TABLE ${tableName} CHANGE ${casilla} ${nuevoValor} ${ValorType}(50);`;


  try {
    // Realizar la consulta a la base de datos y esperar la respuesta
    const queryResult3 = await db2.query(querymodyfy);
    console.log('Query Result:', queryResult3); 

  return { result: 'Tablas', tableName: queryResult3};
  } catch (error) {
    // Manejar errores, por ejemplo:
    console.error("Error al ejecutar la consulta:", error);
    return { result: 'Error', error: error.message };
  }

}
// *************************** DROP TABLE **********************************************************


async function actionDeleteTable(objPost) {
  const tableName = objPost.tabla;
  //console.log(tableName);
  try {
      // Realizar la lógica para eliminar el automóvil en la base de datos
      // Ejemplo usando una consulta DELETE:
      const dropQuery = `DROP TABLE ${tableName}`;
      const dropResult = await db2.query(dropQuery);
      //console.log(deleteQuery);
      // Comprueba el resultado y devuelve 'OK' si la eliminación fue exitosa
      if (dropResult.affectedRows > 0) {
          return { result: 'OK' };
      } else {
          return { result: 'KO', message: 'Car not found or could not be deleted' };
      }
  } catch (error) {
      console.error("Error deleting car:", error);
      return { result: 'Error', error: error.message };
  }

  
}