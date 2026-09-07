import { set, connect as _connect } from "mongoose";
import config from "./commons";
set("debug", config.monDebug);

async function connect(url: string) {
  try {
    set("bufferCommands", false);
    await _connect(url, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 5,
      minPoolSize: 1,
      retryWrites: true,
      retryReads: true,
      compressors: ["zlib"],
      heartbeatFrequencyMS: 10000,
    });
    console.log("[db] Connection successful", url);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`DB Connection Error: ${message}`);
  }
}

export default connect;
