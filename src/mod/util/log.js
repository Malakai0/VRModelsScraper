import events from "events";

const event = new events.EventEmitter();

export default {
  event,
  error: (message) => {
    event.emit("error", message);
    console.error(message);
  },
  info: (message) => {
    event.emit("info", message);
    console.info(message);
  },
  warn: (message) => {
    event.emit("warn", message);
    console.warn(message);
  },
};
