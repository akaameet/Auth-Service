import app from "./app";
import connectDB from "./db/db";
import redisClient from "./config/redis.config";

connectDB();
redisClient.connect();

app.listen(3000, () => {
  console.log("Server is running in port 3000");
});
