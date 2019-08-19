// .env
require('dotenv').config();

// Crawling
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Schedule
const schedule = require('node-schedule')

// Slack Bot Token
const token = process.env.SLACK_BOT_TOKEN;

// Slack API
const { RTMClient } = require('@slack/rtm-api');
const { WebClient } = require('@slack/web-api');

const web = new WebClient(token);
const rtm = new RTMClient(token);

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
      const $bodyList = $('div.sect-showtimes').find('div.col-times');

      $bodyList.each(function (i, elem) {
        ulList.dataList[i] = {
          title: $(this)
            .find('div.info-movie a strong')
            .text()
            .trim(),
          hallType: $(this)
            .find('div.info-hall li')
            .first()
            .text()
            .trim(),
          timeTable: $(this)
            .find('div.info-timetable li')
            .map(function (i, el) {
              return $(this)
                .find('em')
                .text();
            })
            .get()
        };
      });

      return ulList;
    })
};

/**
 * CGV 무비차트 가져오기
 * -----------------------------------
 */
const getCGVChartData = async () => {
  try {
    return await axios.get(
      `http://www.cgv.co.kr/movies/`
    );
  } catch (error) {
    console.error(error);
  }
};

const getMovieChart = () => {
  return getCGVChartData()
    .then(html => {
      const ulList = []
      const $ = cheerio.load(html.data);
      const $chartList = $('div.sect-movie-chart').find('li')

      $chartList.length = $chartList.length - 1

      $chartList.each(function (i, elem) {
        ulList[i] = {
          title: $(this).find('.title').text().trim(),
          openDate: $(this).find('.txt-info').children('strong').text().trim().slice(0, 10),
          thumNail: $(this).find('.thumb-image').children('img').attr('src')
        };
      });

      return ulList;
    })
}

/**
 * ------------------------------------
 * Bot Setting
 * ------------------------------------
 * Slack 자체 API가 존재하여 그냥 사용해서 올리면 될 듯
 */

// Common send Message for text
const sendMessage = async (messageText, channel) => {
  return await rtm.sendMessage(messageText, channel);
};

const createHelpMessage = async () => {
  return [
    {
      'type': 'context',
      'elements': [
        {
          'type': 'mrkdwn',
          'text': ' - 지역코드 검색 : *지역코드* \n - 상영관코드 검색 : *상영관코드 / {지역코드}* \n - 상영관검색 : *상영관검색 / {검색할 단어}* \n - 날짜검색 : *날짜검색 / {상영관코드} / {날짜}* \n - 무비차트 : *{상영작 |  영화차트 | 영화리스트 | 무비차트 | 현재 상영작}*'
        }
      ]
    }
  ]
}

const getMovieContent = (movieList) => {
  return movieList.map((item) => {
    const timeList = item.timeTable.sort().reduce((acc, time) => acc + ', ' + time)
    return {
      'type': 'context',
      'elements': [
        {
          'type': 'mrkdwn',
          'text': `*${item.title}* / ${item.hallType} / ${timeList}`
        }
      ]
    }
  })
}

// Search Region Code
const searchRegionCode = async () => {
  const regionData = fs.readFileSync(`./regionCode.json`, 'utf8');
  const regionCodeList = JSON.parse(regionData).RegionCodeList;

  const blocks = regionCodeList.map((item) => {
    return {
      'type': 'context',
      'elements': [
        {
          'type': 'mrkdwn',
          'text': `*${item.RegionName}:* ${item.RegionCode}`
        }
      ]
    }
  })
  return blocks
}

// Search Theater Code
const searchTheaterCode = async (regionCode = 00, channel) => {
  if (regionCode === 00) {
    sendMessage('형식에 맞게 작성해주세요. => 상영관코드 / {지역코드}', channel)
  }

  const theaterData = fs.readFileSync(`theaterJsonData_${regionCode}.json`, 'utf-8');
  const theaterCodeList = JSON.parse(theaterData).AreaTheaterDetailList;

  const blocks = theaterCodeList.map((item) => {
    return {
      'type': 'context',
      'elements': [
        {
          'type': 'mrkdwn',
          'text': `*${item.TheaterName}:* ${item.TheaterCode}`
        }
      ]
    }
  })

  return blocks
}

// Search Theater Code to Name
const searchTheaterToName = (searchText = '') => {
  const allTheater = fs.readFileSync(`allTheater.json`, 'utf-8')
  const allTheaterList = JSON.parse(allTheater).AllTheaterDetailList.map(item => {
    return {
      'theaterName': item.TheaterName,
      'theaterCode': item.TheaterCode
    }
  });
  const theaterListString = allTheaterList
    .filter(({ theaterName }) => theaterName.includes(searchText))
    .reduce((acc, item) => `${acc === '' ? '' : acc + ' / '}${item.theaterName}(${item.theaterCode})`, '')

  return [{
    'type': 'context',
    'elements': [
      {
        'type': 'mrkdwn',
        'text': `${theaterListString}`
      }
    ]
  }]
}

// Search Movie List to Date in Specify Theater
const searchMovieToDate = async (theaterCode = '0055', date = (new Date()).toISOString().slice(0, 10).replace(/-/g, '')) => {
  const theaterData = await getParsingData('', theaterCode, date);

  console.log('날짜 검색 결과 : ', theaterData)

  const blocks = [
    {
      'type': 'context',
      'elements': [
        {
          'type': 'mrkdwn',
          'text': `*상영관 코드 :* ${theaterData.theaterCode}`
        },
        {
          'type': 'mrkdwn',
          'text': `*날짜 :* ${theaterData.date}`
        }
      ]
    }
  ]

  return [...blocks, ...getMovieContent(theaterData.dataList)]
}

// Get Movie Chart
const getMovieList = async () => {
  const movieChartList = await getMovieChart()
  return movieChartList.map((item, index) => {
    return {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `${index + 1}. ${item.title} / ${item.openDate} 개봉`
      },
      "accessory": {
        "type": "image",
        "image_url": `${item.thumNail}`,
        "alt_text": `image_${index}`
      }
    }
  })
}

/**
 * All alarmList
 * -------------
 * 
 * Form Example
 * [{
 *  theaterCode : '0055',
 *  date : '20190731',
 *  movieTitle : '알라딘'
 * }]
 * 
 */
let alarmList = []

// create All Alarm List Blocks
const createAlarmListBlocks = (alarmList) => {
  return alarmList.map((alram, index) => {
    return {
      'type': 'context',
      'elements': [
        {
          'type': 'mrkdwn',
          'text': `*알람 ${index + 1} :* ${alram.theaterCode} / ${alram.date} / ${alram.movieTitle}`
        },
      ]
    }
  })
}

// deleteAlarmList
const deleteAlarmList = (targetIndex) => {
  alarmList = alarmList.filter((alram, index) => {
    return index !== targetIndex
  })

  return createAlarmListBlocks(alarmList)
}

// create Ring Ding Dong Block
const createRingRingBlocks = (alarmInfo, movieInfo) => {
  return [{
    'type': 'context',
    'elements': [
      {
        'type': 'mrkdwn',
        'text': `*!!알람!!*  *${alarmInfo.date}* *${movieInfo.title}* 예매를 시작했습니다.  / ${movieInfo.hallType}`
      },
    ]
  }]
}

// Check Alarm List
const checkAlarmList = () => {
  const successList = alarmList.map(async (alarm, index) => {
    const searchList = await getParsingData('', alarm.theaterCode, alarm.date);
    const checkedMovieList = searchList.dataList.filter((movie) => movie.title === alarm.movieTitle)

    return { alarm, index, movie: checkedMovieList[0] }
  })

  successList.map((promise) => {
    promise.then((alarmDatas) => {
      if (alarmDatas.movie) {
        const blocks = createRingRingBlocks(alarmDatas.alarm, alarmDatas.movie)
        web.chat.postMessage({ blocks, channel: topChannel })

        return alarmDatas.index
      }

      return -1
    }).then((index) => {
      if (index >= 0) {
        const blocks = deleteAlarmList(parseInt(index))
        web.chat.postMessage({ blocks, channel: topChannel })
      }
    })
  })
}

// Create Message
let topChannel = ''
rtm.on('message', async event => {
  const eventCodeList = event.text.split('/').map((text) => text.trim())
  topChannel = event.channel
  console.log(eventCodeList);
  try {
    let result;
    const movieChartKorlist = ['상영작', '영화차트', '영화리스트', '무비차트', '현재 상영작']

    if (eventCodeList[0] === 'help') {
      const helpMessageBlocks = await createHelpMessage()
      result = await web.chat.postMessage({ blocks: helpMessageBlocks, channel: event.channel })
    }

    if (eventCodeList[0] === '지역코드') {
      blocks = await searchRegionCode()
      result = await web.chat.postMessage({ blocks, channel: event.channel })
    }

    if (eventCodeList[0] === '상영관코드') {
      blocks = await searchTheaterCode(eventCodeList[1], event.channel)
      result = await web.chat.postMessage({ blocks, channel: event.channel })
    }

    if (eventCodeList[0] === '상영관검색') {
      blocks = await searchTheaterToName(eventCodeList[1])
      result = await web.chat.postMessage({ blocks, channel: event.channel })
    }

    if (eventCodeList[0] === '날짜검색') {
      blocks = await searchMovieToDate(eventCodeList[1], eventCodeList[2])
      result = await web.chat.postMessage({ blocks, channel: event.channel })
    }

    if (movieChartKorlist.includes(eventCodeList[0])) {
      blocks = await getMovieList()
      result = await web.chat.postMessage({ blocks, channel: event.channel })
    }

    /** 
     * -------------------------------------------------------
     * 제일 중요한 부분으로 알림에 대한 전반적인 CRUD를 만들기
     * ------------------------------------------------------- 
     *  
     * Message 형식 
     * - Create : 알람 / 설정 / 상영관코드 / 날짜 / 영화이름
     * - Read : 알람 / 조회
     * - Delete : 알람 / 삭제 / 인덱스
     * 
     * 1. 모든 알람에 대한 정보는 List로 관리한다.
     * 2. 일정 시간마다 Loop를 돌면서 해당 설정한 알람에 대한 확인을 한다.
     * 3. 설정한 알람이 실행된 후 알람내역에서 삭제한다.
     * 4. !! 된다면 예매 사이트를 보내주도록 구현 !!
     * 
     */

    if (eventCodeList[0] === '알람') {
      switch (eventCodeList[1]) {
        case '조회':
          blocks = await createAlarmListBlocks(alarmList)
          result = await web.chat.postMessage({ blocks, channel: event.channel })
          break;
        case '삭제':
          blocks = await deleteAlarmList(parseInt(eventCodeList[2]) - 1)

          sendMessage(`알람이 삭제되었습니다.`, event.channel)
          result = await web.chat.postMessage({ blocks, channel: event.channel })
          break;
        case '설정':
          if (!eventCodeList[4]) {
            sendMessage(`알람설정이 실패했습니다.`, event.channel)
          } else {
            alarmList = [...alarmList, {
              theaterCode: `${eventCodeList[2]}` || '0055',
              date: `${eventCodeList[3]}` || (new Date()).toISOString().slice(0, 10).replace(/-/g, ''),
              movieTitle: `${eventCodeList[4]}` || ''
            }]

            sendMessage(`알람이 추가되었습니다.`, event.channel)

            blocks = await createAlarmListBlocks(alarmList)
            result = await web.chat.postMessage({ blocks, channel: event.channel })
          }
          break;

        default:
          break;
      }
    }

    console.log('result : ', result)

  } catch (error) {
    console.log('An error occurred', error);
  }
});

/**
 * Connect to Slack
 */
(async () => {
  const { self, team } = await rtm.start();
  console.log(`Listening RTM`, self, team);

  // Start Schedule
  schedule.scheduleJob('*/4 * * * *', function () {
    if (alarmList.length > 0 && topChannel != '') {
      checkAlarmList()
    }
  })
})();
