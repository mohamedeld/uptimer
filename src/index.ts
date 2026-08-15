import express from "express";
import MonitorServer from "./server/server";
import { connectToDB } from "./server/database";
const initializeApp = async () => {
  const app = express();
  await connectToDB();
  const monitorServer = new MonitorServer(app);
  monitorServer.start();
};

initializeApp();
