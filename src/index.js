import Thrifty from "thrifty"

const connection = new Thrifty({
  protocol: "https",
  host: "metis.mapd.com",
  port: "443",
  dbName: "mapd",
  user: "mapd",
  password: "HyperInteractive"
})

connection
  .connect()
  .then(() => console.log('done'))