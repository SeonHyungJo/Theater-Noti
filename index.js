// .env
require("dotenv").config();

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

/**
 * 해당 상영관 관련 영화정보 가져오기
 * -----------------------------------
 *
 * @param areacode 지역
 * @param theaterData 상영관 정보
 * @param date 날짜
 */
const getParsingData = async (areaCode, theaterCode, date) => {
  const getTheaterData = async () => {
    try {
      return await axios.get(
        `http://www.cgv.co.kr/common/showtimes/iframeTheater.aspx?areacode=${areaCode}&theatercode=${theaterCode}&date=${date}`
      );
    } catch (error) {
      console.error(error);
    }
  };

  return getTheaterData()
    .then(html => {
      const ulList = {
        areaCode,
        theaterCode,
        date,
        dataList: []
      };
      const $ = cheerio.load(html.data);
      const $bodyList = $("div.sect-showtimes").find("div.col-times");

      $bodyList.each(function (i, elem) {
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
            .map(function (i, el) {
              return $(this)
                .find("em")
                .text();
            })
            .get()
        };
      });

      console.log('ulList', ulList)
      return ulList;
    })
  // .then(data => {
  // fs.writeFile(
  //   `./data_${areaCode}_${theaterCode}_${date}.json`,
  //   JSON.stringify(data),
  //   "utf8",
  //   err => {
  //     if (err) throw err;
  //     console.log("The file has been saved!");
  //   }
  // );

  //   return data;
  // });
};

/**
 * Create Template
 * ------------------------------------
 * 지역 / 상영관 / 날짜 / 시간 / 영화 내역
 *
 * ## 영화 내역
 * | 영화 제목 | 영화 타입 | 시간표 |
 * | title | hallType  | timeTable(Array) |
 *
 */

const movieTheater = () => { };

/**
 * ------------------------------------
 * Bot Setting
 * ------------------------------------
 * Slack 자체 API가 존재하여 그냥 사용해서 올리면 될 듯
 */
const { RTMClient } = require("@slack/rtm-api");
const { WebClient } = require("@slack/web-api");

//--------------------------------------------------
// JSON 데이터 가져오기
const regionData = require("./regionCode.json")
// const fs = require('fs');


const token = process.env.SLACK_BOT_TOKEN;

const web = new WebClient(token);
const rtm = new RTMClient(token);

const sendMessage = async (messageText, channel) => {
  return await rtm.sendMessage(messageText, channel);
};

// Create Message
rtm.on("message", async event => {
  console.log(event);
  try {
    console.log("TEXT : ", event.text);
    let messageText = "";

    if (event.text === "hello") {
      messageText = `Welcome to the channel, <@${event.user}>`;
      const reply = await sendMessage(messageText, event.channel);
      console.log("Message sent successfully", reply);

      return
    } else if (event.text === "상영관검색") {
      // messageText = `극장 정보 가져오기`;
      const theaterData = await getParsingData();
      console.log("theaterData", theaterData);
      messageText = JSON.stringify(theaterData);
      const reply = await sendMessage(messageText, event.channel);
      console.log("Message sent successfully", reply);

      return
    }

    if (event.text === "지역코드") {
      const regionCodeList = regionData.RegionCodeList
      const blocks = regionCodeList.map((item) => {
        return {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text": `*${item.RegionName}:* ${item.RegionCode}`
            }
          ]
        }
      })

      // messageText = JSON.stringify(regionData);
      const result = await web.chat.postMessage({ blocks, channel: event.channel })
      return
    }

    const splitText = event.text.split('/').map((text) => text.trim())
    console.log('splitText', splitText)

    if (splitText[0] === "상영관코드") {
      const regionCode = splitText[1]
      const theaterData = fs.readFileSync(`theaterJsonData_${regionCode}.json`);
      const theaterCodeList = JSON.parse(theaterData).AreaTheaterDetailList;
      const blocks = theaterCodeList.map((item) => {
        return {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text": `*${item.TheaterName}:* ${item.TheaterCode}`
            }
          ]
        }
      })

      // messageText = JSON.stringify(regionData);
      const result = await web.chat.postMessage({ blocks, channel: event.channel })
      return
    }

    if (splitText[0] === "날짜검색") {
      if (!splitText[1] || !splitText[2]) {
        messageText = '형식에 맞게 작성해주세요 => 날짜검색 / 상영관코드 / 날짜(ex 20190727)';
        const reply = await sendMessage(messageText, event.channel);
        console.log("Message sent successfully", reply);
      } else {
        const theaterCode = splitText[1]
        const date = splitText[2]

        console.log('searching~~~~~')
        const theaterData = await getParsingData('', theaterCode, date);
        const movieList = theaterData.dataList
        console.log('theaterData==============>', theaterData)

        let blocks = [
          {
            "type": "context",
            "elements": [
              {
                "type": "mrkdwn",
                "text": `*상영관 코드 :* ${theaterData.theaterCode}`
              }
            ]
          },
          {
            "type": "context",
            "elements": [
              {
                "type": "mrkdwn",
                "text": `*날짜 :* ${theaterData.date}`
              }
            ]
          }
        ]

        const movieContentList = movieList.map((item) => {
          const timeList = item.timeTable.sort().reduce((acc, time) => acc + ", " + time)
          return {
            "type": "context",
            "elements": [
              {
                "type": "mrkdwn",
                "text": `*${item.title}* / ${item.hallType} / ${timeList}`
              }
            ]
          }
        })

        blocks = [...blocks, ...movieContentList]
        const result = await web.chat.postMessage({ blocks, channel: event.channel })
        return
      }
    }
  } catch (error) {
    console.log("An error occurred", error);
  }
});

(async () => {
  // Connect to Slack
  const { self, team } = await rtm.start();
  console.log(`Listening RTM`);
})();
