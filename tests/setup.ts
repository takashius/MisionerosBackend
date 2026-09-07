import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

jest.mock("../src/middleware/mailer", () => ({
  mailer: jest.fn().mockResolvedValue(200),
}));

let mongo: MongoMemoryServer | undefined;

const isUnitTest = expect.getState().testPath?.includes("__tests__");

beforeAll(async () => {
  if (isUnitTest) {
    return;
  }

  mongoose.set("bufferCommands", false);
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);

  const { init } = require("../src/index");
  await init();
}, 120000);

afterAll(async () => {
  if (isUnitTest) {
    return;
  }

  if (mongo) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
  }
});
