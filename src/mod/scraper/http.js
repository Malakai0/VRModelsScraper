import https from "https";
import dotenv from "dotenv";

dotenv.config();

const MAX_RETRIES = 8;

const exponentialBackoff = (retries) => {
  return Math.pow(2, retries) * 1000 + Math.random() * 1000;
};

const httpCall = async (url, encoding, retries) => {
  if (!retries) {
    retries = 0;
  }

  const options = {
    hostname: "vrmodels.store",
    port: 443,
    path: url,
    method: "GET",
    headers: {
      Cookie: `dle_user_id=${process.env.USER_ID}; dle_password=${process.env.USER_PASS}; dle_newpm=0`,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      // if we get rate limited, retry
      if (
        res.statusCode == 503 ||
        res.statusCode == 504 ||
        res.statusCode == 502 ||
        res.statusCode == 429
      ) {
        if (retries < MAX_RETRIES) {
          setTimeout(() => {
            resolve(httpCall(url, encoding, retries + 1));
          }, exponentialBackoff(retries));
        } else {
          reject("Max retries exceeded");
        }

        return;
      }

      let data = "";

      if (encoding) {
        res.setEncoding(encoding);
      }

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve(data);
      });
    });

    req.on("error", (error) => {
      if (retries < MAX_RETRIES) {
        setTimeout(() => {
          resolve(httpCall(url, encoding, retries + 1));
        }, exponentialBackoff(retries));
      } else {
        reject(error);
      }
    });

    req.end();
  });
};

export default httpCall;
