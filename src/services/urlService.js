const Url = require("../models/url");

const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const CODE_LENGTH = 6;

function generateCode() {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  return code;
}

async function createShortUrl(originalUrl) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const code = generateCode();
      const url = new Url({ originalUrl, code });
      await url.save();
      return url;
    } catch (error) {
      if (error.code === 11000 && attempt < 4) {
        console.log(
          `Collision detected for code, retrying (attempt ${attempt + 1})...`,
        );
        continue;
      }
      throw error;
    }
  }
  throw new Error("Could not generate a unique short code");
}

async function getUrlByCode(code) {
  return await Url.findOne({ code });
}

async function incrementClicks(id) {
  return await Url.findByIdAndUpdate(
    id,
    { $inc: { clicks: 1 } },
    { new: true },
  );
}

async function listUrls(page = 1, limit = 10) {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  return await Url.find()
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);
}

module.exports = {
  generateCode,
  createShortUrl,
  getUrlByCode,
  incrementClicks,
  listUrls,
};
