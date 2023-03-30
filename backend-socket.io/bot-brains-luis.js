const fetch = require("node-fetch");
const tags = require('./bot-data/tags-luis.json')
const pizzeriaInfo = require("./bot-data/pizzaModifiers-luis.json")
const pizzaMenu = require("./bot-data/pizzaMenu-luis.json")
const variants = require("./bot-data/variants-luis.json")

const operate = (data, pizza_lst, botAnswers, pickupAction) => {
    // url to get prediction from LUIS app
    let url = 'https://gnosis-luis-bot.cognitiveservices.azure.com/luis/prediction/v3.0/apps/1499890b-2973-4b75-b381-74709ebcc0d9/slots/production/predict?verbose=true&show-all-intents=true&log=true&subscription-key=8eac63d31758445ebaad91af7e8321d8&query=' +
        data.replace(/ /g, "_")

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

        })
        .catch(err => { throw err });
}
module.exports = operate