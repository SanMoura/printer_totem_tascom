const printer = require(`pdf-to-printer`);
const uuid = require("uuid");
const dotenv = require("dotenv/config");
const { rmSync, writeFileSync } = require("fs");
const io = require("socket.io-client");

async function test_connection(host) {
  const socket = io(host, {
    extraHeaders: {
      "Bypass-Tunnel-Reminder": "libera",
    },
    // transport: ['websocket']
  });
  await socket.connect();
  let sumPromise = new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve(socket.connected);
      if (socket.connected) socket.disconnect();
    }, 3000);
  });
  let response = await sumPromise;
  return response;
}

async function await_file_for_print() {
  const host = "http://172.16.0.202:5000";

  const host2 = "http://172.16.0.202:5051";

  host_ok = await test_connection(host);

  const socket = io(host_ok ? host : host2, {
    extraHeaders: {
      "Bypass-Tunnel-Reminder": "libera",
    },
  });

  socket.connect();

  socket.on("connect", () => {
    console.log("connected!");
  });
  socket.on("connect_error", () => {
    console.log("no connection found, please contact support!");
  });

  socket.on(process.env.PRINTER_ID, async (data) => {
    try {
      const newFileName = uuid.v4();
      const pathFile = `${__dirname}\\filesToPrinter\\${newFileName}.pdf`;

      var base64Data = data.replace(/^data:application\/pdf;base64,/, "");
      writeFileSync(
        `${__dirname}\\filesToPrinter\\${newFileName}.pdf`,
        base64Data,
        {
          encoding: "base64",
        }
      );
      await printer.print(pathFile);
      rmSync(pathFile);
    } catch (err) {
      console.log(err);
    }
  });
}
await_file_for_print();
