// .env
require('dotenv').config()

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

// Setting Param
let areacode = "01";
let theatercode = "0056";
let date = "20190727";

const getTheaterData = async () => {
  try {
    return await axios.get(
      `http://www.cgv.co.kr/common/showtimes/iframeTheater.aspx?areacode=${areacode}&theatercode=${theatercode}&date=${date}`
    );
  } catch (error) {
    console.error(error);
  }
};

getTheaterData()
  .then(html => {
    let ulList = {
      areacode,
      theatercode,
      date,
      dataList: []
    };
    const $ = cheerio.load(html.data);
    const $bodyList = $("div.sect-showtimes").find("div.col-times");

    $bodyList.each(function(i, elem) {
      ulList.dataList[i] = {
        title: $(this)
          .find("div.info-movie a strong")
          .text()
          .trim(),
        hallType: $(this)
          .find("div.info-hall li")
          .first()
          .text()
          .trim(),
        timeTable: $(this)
          .find("div.info-timetable li")
          .map(function(i, el) {
            return $(this)
              .find("em")
              .text();
          })
          .get()
      };
    });

    return ulList;
    // return "data"
  })
  .then(res => {
    console.log(res);
    return res;
  })
  .then(data => {
    fs.writeFile(
      `./data_${areacode}_${theatercode}_${date}.json`,
      JSON.stringify(data),
      "utf8",
      err => {
        if (err) throw err;
        console.log("The file has been saved!");
      }
    );
  });

//--Bot setting-----------------------------------------------------

const Botkit = require("botkit"); // 봇 모듈 사용
const Slack = require("slack-node"); // 슬랙 모듈 사용
const { SlackAdapter } = require('botbuilder-adapter-slack'); // Adapter 추가

const adapter = new SlackAdapter({
  clientSigningSecret: process.env.BOT_TOKEN,
  botToken: process.env.BOT_TOKEN
});

const controller = new Botkit.Botkit({
  webhook_uri: '/api/messages',
  adapter,
  debug: false,
  log: true
});

controller.hears(["test"], 'message', (bot, message) => {
  bot.reply(message, "업무보고 링크주소");
});

controller.hears('hello','direct_message', function(bot, message) {
  bot.reply(message,'Hello yourself!');
});

// controller
//   .spawn({
//     token: process.env.BOT_TOKEN
//   })
//   .startRTM();
