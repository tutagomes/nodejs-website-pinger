
const axios = require('axios')
const fs = require('fs');

axios.interceptors.request.use(function (config) {

config.metadata = { startTime: new Date()}
return config;
}, function (error) {
return Promise.reject(error);
});

axios.interceptors.response.use(function (response) {
    response.config.metadata.endTime = new Date()
    response.duration = response.config.metadata.endTime - response.config.metadata.startTime
    return response;
    }, function (error) {
    error.config.metadata.endTime = new Date();
    error.duration = error.config.metadata.endTime - error.config.metadata.startTime;
    return Promise.reject(error);
});
async function test(website) {
    let response = {
        online: false,
        time: 0,
        status: 0
    }
    let data
    try {
        data = await axios.get(website);
        response.online = true
        response.time = data.duration
        response.status = 200
    } catch (e) {
        response.online = false
        response.time = e.duration
        response.status = e.response.status
    }
    return response
}

async function initTest(website, minutes) {
    setInterval(async () => {
        let response = await test(website)
        let msg
        if (response.online) {
            msg = `UP,${response.time},${response.online},${response.status},${new Date()}\n`
        } else {
            msg = `DOWN,${response.time},${response.online},${response.status},${new Date()}\n`
        }
        fs.appendFile('log.csv', msg, function (err) {
            if (err) throw err;
            console.log('Saved!');
            console.log(response)
        });
    }, minutes*60*1000)
}

let site = 'http://arkhi.com.br'
initTest(site, 2)