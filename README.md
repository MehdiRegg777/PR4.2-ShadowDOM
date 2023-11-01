# Shadow DOM i NodeJS 

Exemple de Shadow DOM interactuant amb AJAX a NodeJS.

L'exemple fa ús de LocalStorage per guardar un 'token' de sessió.

A la part de NodeJS fa ús de 'hash' per guardar les contrasenyes.


## Instal·lar

```bash
npm install
```

## Executar en mode desenvolupament

```bash
npm run dev
```
## Instalar imagen base de datos mysql en doker

```bash
docker run --name mysqlUsers -p 3308:3306 -e MYSQL_ROOT_PASSWORD=pwd -d mysql
```

## Ejecutar las tablas de sql desde windows


```bash
Get-Content .\BaseDatosUser.sql | docker exec -i mysqlUsers mysql -uroot -ppwd
```

```bash
Get-Content .\coches.sql | docker exec -i mysqlUsers mysql -uroot -ppwd
```

## entrar a la base de datos mediate mysql desde Docker

```bash
mysql -uroot -ppwd
```