import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

let telegramUrl = "https://api.telegram.org/bot" + process.env.TELEGRAM_API_TOKEN + "/sendMessage";
let openWeatherUrl = process.env.OPENWEATHER_API_URL;

function sendMessage(url, message, reply, res) {
    axios.post(url, {
        chat_id: message.chat.id,
        text: reply
    }).then(response => {
        console.log("Message posted");
        res.end("ok");
    }).catch(error => {
        console.log(error);
    })
}

function getForecast(city) {
    let newUrl = openWeatherUrl + city + "&appid=" + process.env.OPENWEATHER_API_KEY
    return axios.get(newUrl).then(response => {
        let temp = response.data.main.temp;
        //converts temperature from kelvin to celsuis
        temp = Math.round(temp - 273.15);
        let cityName = response.data.name;
        let resp = "It's "+temp+" degrees in"+cityName;
        return resp;
    }).catch(error => {
        console.log(error);
    });
}

var app = express();
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.post("/start", function(req, res) {
    const { message } = req.body.message;
    let reply = "Welcome to NodeJs Super Telebot";
    let cityText = message.text.toLowerCase();
    let cityCheck = cityText.indexOf('/');
    if (cityText.indexOf("hi") !== -1) {
        sendMessage(telegramUrl, message, reply, res);
    } else if (cityText.indexOf("check") !== -1 && cityCheck !== -1) {
        city = message.text.split('/')[1];
        getForecast(city).then( response => {
            sendMessage(telegramUrl, response, message, res)
        });
    } else {
        reply = "request not understood, please review and try again.";
        sendMessage(telegramUrl, message, reply, res);
        return res.end();
    }
});

app.listen(3000, () => console.log("Listening on port 3000 ..."));