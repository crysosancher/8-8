require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  eightx8: {
    apiKey: process.env.EIGHTX8_API_KEY,
    apiSecret: process.env.EIGHTX8_API_SECRET,
    subAccountId: process.env.EIGHTX8_SUBACCOUNT_ID,
    voiceBaseUrl: "https://voice.8x8.com/api/v1",
    logsBaseUrl: "https://voice.wavecell.com/api/v1",
  },
};
