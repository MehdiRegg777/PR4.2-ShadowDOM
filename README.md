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

## Obrir el navegador a la direcció

[http://localhost:8888](http://localhost:3000)

## En mode desenvolupament (amb el shadow DOM complet), la direcció és:

[http://localhost:8888/index-dev.html](http://localhost:3000/index-dev.html)

## Instalar imagen base de datos mysql en doker

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