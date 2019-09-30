<div align="center" >

<img src="https://user-images.githubusercontent.com/24274424/65892871-f6d7df00-e3e1-11e9-8f54-6b6e22fa5a9d.png" width="200">

</div>

## Theater Noti

[![GitHub Author](https://img.shields.io/badge/Author-sNyung-blue?style=flat-square)](https://github.com/SeonHyungJo)
[![GitHub license](https://img.shields.io/github/license/SeonHyungJo/Theater-Noti?style=flat-square)](https://github.com/SeonHyungJo/Theater-Noti/blob/master/LICENSE)
[![HitCount](http://hits.dwyl.io/SeonHyungJo/Theater-Noti.svg)](http://hits.dwyl.io/SeonHyungJo/Theater-Noti)

**내가 보고 싶은 영화는 대체 언제 예매가 가능한거지?**

## Demo

Slack 채널로 초대합니다. :point_right: [Theater-Noti 봇 구경하기](https://join.slack.com/t/snyung/shared_invite/enQtNzY2NjQ3Njc3OTM5LTg5MjRkNzMyYWFhNjFiZDAyNmRjN2NjZWFkNjVlZDk5MGIwMTA0YTI4ZWFhMDkyNTBmZGRiZjJmOTE4OWNmMjk)

## How to use

### Command

 1. Help

```text
help
```

<center>
<img style="box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.4);" src="https://user-images.githubusercontent.com/24274424/63279097-5b802400-c2e3-11e9-99d1-33a3b677ba5f.png" width="500px">
</center>

---

 2. 지역코드 리스트
  
```text
지역코드
```

<center>
<img style="box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.4);" src="https://user-images.githubusercontent.com/24274424/63277149-caf41480-c2df-11e9-8fa9-558a3178464d.png" width="500px">
</center>

 3. 지역코드 검색
   
```text
지역코드 / {지역명} 
```

<center>
<img style="box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.4);" src="https://user-images.githubusercontent.com/24274424/63277218-eb23d380-c2df-11e9-8746-02d186760851.png" width="500px">
</center>

 4. 상영관코드 리스트

```text
상영관코드 / {지역코드} 
```

<center>
<img style="box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.4);" src="https://user-images.githubusercontent.com/24274424/63277285-07c00b80-c2e0-11e9-93ff-5c97ad7b9192.png" width="500px">
</center>

 5. 상영관검색 

```text
상영관검색 / {상영관명}
```

<center>
<img style="box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.4);" src="https://user-images.githubusercontent.com/24274424/63277362-2a522480-c2e0-11e9-8769-8e7c6777eada.png" width="500px">
</center>

 6. 날짜검색

```text
날짜검색 / {상영관코드} / {날짜} 
```

<center>
<img style="box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.4);" src="https://user-images.githubusercontent.com/24274424/63277416-3fc74e80-c2e0-11e9-849c-3bf204e1e8a5.png" width="500px">
</center>

 7. 무비차트

```text
{상영작 |  영화차트 | 영화리스트 | 무비차트 | 현재 상영작} 
```

<center>
<img style="box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.4);" src="https://user-images.githubusercontent.com/24274424/63277711-c8de8580-c2e0-11e9-8643-1f9e4e98ade9.png" width="500px">
</center>

 8. 알람 / 설정

```text
알람 / 설정 / {상영관코드} / {날짜} / {영화이름} 
```

<center>
<img style="box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.4);" src="https://user-images.githubusercontent.com/24274424/63278070-8b2e2c80-c2e1-11e9-9e6c-16919dfafc9d.png" width="500px">
</center>

 9. 알람 / 조회

```text
알람 / 조회 
```

<center>
<img style="box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.4);" src="https://user-images.githubusercontent.com/24274424/63277895-2bd01c80-c2e1-11e9-9142-7b553200058b.png" width="500px">

<img style="box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.4);" src="https://user-images.githubusercontent.com/24274424/63278124-a862fb00-c2e1-11e9-9d6a-fd64e3a2df3f.png" width="500px">
</center>

 10.  알림 / 삭제

```text
알람 / 삭제 / {인덱스}
```

<center>
<img style="box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.4);" src="https://user-images.githubusercontent.com/24274424/63278464-42c33e80-c2e2-11e9-9491-0f2a58e15ea5.png" width="500px">
</center>

 11. 알림!!

<center>
<img style="box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.4);" src="https://user-images.githubusercontent.com/24274424/63280056-1957e200-c2e5-11e9-8353-4676abbfff42.png" width="500px">
</center>

---

#### Reference 

- [대화봇 만들기](http://labs.brandi.co.kr/2019/01/30/kwakjs.html)
- [Node.js에서 웹크롤링하기](https://velog.io/@yesdoing/Node.js-%EC%97%90%EC%84%9C-%EC%9B%B9-%ED%81%AC%EB%A1%A4%EB%A7%81%ED%95%98%EA%B8%B0-wtjugync1m)
