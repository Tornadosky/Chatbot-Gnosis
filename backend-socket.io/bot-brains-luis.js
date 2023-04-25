const fetch = require("node-fetch");
const tags = require('./bot-data/tags-luis.json')
const pizzeriaInfo = require("./bot-data/pizzaModifiers-luis.json")
const pizzaMenu = require("./bot-data/pizzaMenu-luis.json")
const variants = require("./bot-data/variants-luis.json")
const config = require("./config.json")

const operate = (data, pizza_lst, botAnswers, pickupAction) => {
    // url to get prediction from LUIS app
    let url = 'https://gnosis-luis-bot.cognitiveservices.azure.com/luis/prediction/v3.0/apps/1499890b-2973-4b75-b381-74709ebcc0d9/slots/production/predict?verbose=true&show-all-intents=true&log=true&subscription-key=' +
        config["luis_key"] + '&query=' + data.replace(/ /g, "_")

    // create prediction JSON object from LUIS url
    return fetch(url)
        .then(res => res.json())
        .then(predictionJSON => {

            function getRandomNumberBetween(min, max){
                return Math.floor(Math.random()*(max-min+1)+min);
            }
            function restart() {
                pizza_lst = []
                pickupAction = ""
            }
            function modifyAnswer(keyword_tag, answ, num = 0) {
                // replacing [info]
                switch (keyword_tag) {
                    case "ready_pizza":
                        answ = answ.replace(/\[size]/g, pizza_lst[num].size)
                        answ = answ.replace(/\[type]/g, pizza_lst[num].type)
                        answ = answ.replace(/\[crust]/g, pizza_lst[num].crust)
                        return answ
                    case "order_number":
                        const capital_letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                        let number = ""
                        for (let i = 0; i < 7; i++) {
                            number += capital_letters.charAt(getRandomNumberBetween(0, capital_letters.length));
                        }
                        number += "#" + getRandomNumberBetween(1001, 9999).toString()
                        return answ.replace(/\[.*]/g, number)
                    default:
                        return answ
                }
            }
            function randomizeAnswers(arr) {
                return arr[Math.floor(Math.random() * arr.length)];
            }
            // ask question about unfinished pizza order
            function getNextQuestion() {
                let ans = ""
                // picking next question to modify order
                for (let i = 0; i < pizza_lst.length; i++) {

                    let answer_picked;

                    for (let property in pizza_lst[i]) {

                        answer_picked = false;

                        if (pizza_lst[i][property] === "") {

                            switch (property) {
                                case "size":
                                    ans += randomizeAnswers(variants.size.botQuestion);
                                    answer_picked = true;
                                    break;
                                case "crust":
                                    ans += randomizeAnswers(variants.crust.botQuestion);
                                    answer_picked = true;
                                    break;
                            }
                        }
                        if (answer_picked)
                            break;
                    }
                    if (answer_picked)
                        break;
                }

                if (ans === ""){
                    let all_pizzas_done = 0
                    for (let i = 0; i < pizza_lst.length; i++) {
                        if (Object.values(pizza_lst[i]).every(x => x !== '')) {

                            all_pizzas_done++;

                            if(all_pizzas_done === pizza_lst.length) {
                                if (pizza_lst.length === 1) {
                                    ans = randomizeAnswers(variants.readyOrder.notify)
                                    ans = modifyAnswer("ready_pizza", ans)
                                } else {
                                    ans = randomizeAnswers(variants.readyOrder.notify)

                                    for (let i = 0; i < pizza_lst.length; i++) {
                                        ans += "\n " + variants.readyOrder.resultSeveral
                                        ans = modifyAnswer("ready_pizza", ans, i)
                                    }
                                }

                                ans += "\n" + randomizeAnswers(variants.readyOrder.oneMore)
                            }
                        }
                    }
                }
                return ans
            }

            let answer = ""
            let userIntent = predictionJSON.prediction.topIntent.toLowerCase()
            const entities = predictionJSON.prediction.entities

            console.log(userIntent)
            console.log(entities)

            // get the last bot answer
            let botAnswers_last = botAnswers[botAnswers.length - 1].slice(botAnswers[botAnswers.length - 1]
                .lastIndexOf('\n')).replace(/\n/g, "")

            switch(userIntent){
                case "agreement":
                    if (variants.readyOrder.oneMore.includes(botAnswers_last))
                        answer = randomizeAnswers(variants.readyOrder.notDoneYet)
                    break;
                case "rejection":
                    if (variants.order.includes(botAnswers_last))
                        answer = randomizeAnswers(variants.noQ)
                    if (variants.readyOrder.oneMore.includes(botAnswers_last)) {
                        answer = randomizeAnswers(variants.readyOrder.order_number)
                        answer = modifyAnswer("order_number", answer)
                        answer += "\n" + randomizeAnswers(variants.order_details.grab_meal)

                        botAnswers.push(answer)
                    }
                    break;
            }
            // decide what to do according to user Intent
            switch(userIntent) {
                case "insertcrust":
                    // insert crust that user printed
                    if (entities.hasOwnProperty('CrustList')) {
                        let j = 0
                        for (let i = 0; i < pizza_lst.length; i++) {
                            if (pizza_lst[i].crust === "") {
                                pizza_lst[i].crust = entities.CrustList[0][j].toLowerCase()
                                j++
                            }
                        }
                        answer = getNextQuestion()
                    }
                    break;
                case "insertsize":
                    // insert size that user printed
                    if (entities.hasOwnProperty('SizeList')) {
                        let k = 0
                        for (let i = 0; i < pizza_lst.length; i++) {
                            if (pizza_lst[i].size === "") {
                                pizza_lst[i].size = entities.SizeList[0][k].toLowerCase()
                                k++
                            }
                        }
                        answer = getNextQuestion()
                    }
                    break;
                case "help":
                    answer = randomizeAnswers(tags["help"])
                    break;
                case "pickupdetails":
                    if (entities.hasOwnProperty('PickupList')) {
                        pickupAction = entities.PickupList[0][0]
                        if (pickupAction === "delivery")
                            answer = randomizeAnswers(variants.order_details.user_address_q)
                                .replace(/\[.*]/g, getRandomNumberBetween(15, 60).toString())

                        if (pickupAction === "pickup") {
                            answer = randomizeAnswers(variants.order_details.our_address)
                                .replace(/\[restaurant_location\]/g, pizzeriaInfo.locationDetails)
                                .replace(/\[min\]/g, getRandomNumberBetween(15, 60).toString())
                            restart()
                        }
                    }
                    break;
                case "greetings":
                    answer = randomizeAnswers(tags["greetings"])
                    answer += "\n" + randomizeAnswers(variants.order)
                    break;
                case "goodbye":
                    answer = randomizeAnswers(tags["goodbye"])
                    break;
                case "introduction":
                    answer = randomizeAnswers(tags["introduction"])
                    answer += "\n" + randomizeAnswers(variants.order)
                    break;
                case "location":
                    answer = randomizeAnswers(tags["location"]).replace(/\[.*/g, pizzeriaInfo.locationDetails)
                    answer += "\n" + randomizeAnswers(variants.order)
                    break;
                case "rating":
                    answer = randomizeAnswers(tags["rating"]).replace(/\[.*/g, pizzeriaInfo.reviews.map((elem) => {
                        return (" " + elem)
                    }))
                    answer += "\n" + randomizeAnswers(variants.order)
                    break;
                case "socialmedia":
                    if (entities.hasOwnProperty('SocialMediaList'))
                    {
                        // create array of social media without repeats
                        let SocialMediaSet = new Set()
                        entities.SocialMediaList.forEach(socialMedia => {
                            SocialMediaSet.add(socialMedia[0])
                        })
                        let SocialMediaArr = Array.from(SocialMediaSet)
                        // answer exactly with links user wants to know
                        SocialMediaArr.forEach(socialMediaType => {
                            if (pizzeriaInfo.socialMedia.hasOwnProperty(socialMediaType.toLowerCase())) {
                                answer += "Our " + socialMediaType + " is: "
                                answer += pizzeriaInfo.socialMedia[socialMediaType.toLowerCase()] + " \n"
                            }
                        })
                    }else{
                        // by default answers with all links described in file
                        // first create an array from json object and print it in answer
                        let socialMediaArr = []
                        for (let key in pizzeriaInfo.socialMedia)
                            socialMediaArr.push(key)

                        answer = randomizeAnswers(tags["social media"])
                        socialMediaArr.forEach(socialMedia => {
                            answer += socialMedia + ": " + pizzeriaInfo.socialMedia[socialMedia] + "\n"
                        })
                    }
                    answer += "\n" + randomizeAnswers(variants.order)
                    break;
                case "reviews":
                    const selected = pizzeriaInfo.reviews.sort(() => 0.5 - Math.random()).slice(0,3);
                    let str = ""
                    selected.map((elem) => {
                        return (elem + "\n")
                    }).forEach(elem => {
                        str += "- " + elem
                    })
                    answer = randomizeAnswers(tags["reviews"]).replace(/\[.*/g, str)
                    break;
            }
        })
        .catch(err => { throw err });
}
module.exports = operate