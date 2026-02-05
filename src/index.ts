import colors from 'colors';
import server from './server';

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(colors.magenta.bold(`Server is running on: ${port}`));
});

let productName = "tablet"
let isAuth = false
let price = 30

type Product = {
  id: number,
  price: number,
  name: string
}

let product : Product = {
  id: 1,
  price: 30,
  name: "tablet"
}

let product2 : Product = {
  id: 2,
  price: 40,
  name: "tablet 11inch"
}

const number = [10, 20, 30];