let tags = require('./bot-data/tags.json')
let pizzaModifiers = require('./bot-data/pizzaModifiers.json')
let pizzaMenu = require('./bot-data/pizzaMenu.json')
let variants = require('./bot-data/variants.json')
let details = require('./bot-data/details.json')


let botAnswers = [variants.startMsg]
let pizza_lst = []

let pizza_quantity = 0
let pizza_mode = false
let almost_ready = false
let fully_ready = false

// modifying JSON data (tags.json)
tags = tags.map(obj => { obj.patterns = obj.patterns.map(element => {return element.toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=_`~()]/g, "")
    .replace(/s{2,}/g, " ")
    .replace(/ a /g, " ")
    .replace(/ the /g, " ")
    .replace(/ an /g, " ")
    .replace(/'s/g, " is")
    .replace(/please /g, "")
    .replace(/ please/g, "")})
    return obj})

// modifying JSON data (pizzaModifiers.json)
for (let key in pizzaModifiers) {
    pizzaModifiers[key] = pizzaModifiers[key].map(item => {return item.toLowerCase()})
}


function str2int(str){
    switch(str){
        case "two":
            return 2;
        case "three":
            return 3;
        case "four":
            return 4;
        case "five":
            return 5;
        case "six":
            return 6;
    }
}
function getAmount(str){
    // convert str-number to int
    if (str.length === 1){
        return  parseInt(str);
    }else{ // convert str-word to int
        return  str2int(str);
    }
}
function getOverallPrice(){
    let price = 0
    let is_chosen = false

    for(let i = 0; i < pizza_lst.length; i++) {

        for (let price_category in pizzaMenu) {
            is_chosen = false
            for (let pizza_type of pizzaMenu[price_category].type) {

                if (pizza_lst[i].type === pizza_type.toLowerCase()) {

                    for (let pizza_size in pizzaMenu[price_category].size) {
                        if (pizza_lst[i].size === pizza_size.toLowerCase()) {
                            price += pizzaMenu[price_category].size[pizza_size]
                            is_chosen = true
                            break;
                        }
                    }
                    break;
                }
            }
            if(is_chosen){
                break;
            }
        }
    }
    return price
}
function getPrice(pizza, size){
        for (let price_category in pizzaMenu) {
            for (let pizza_type of pizzaMenu[price_category].type) {

                if (pizza === pizza_type.toLowerCase()) {

                    for (let pizza_size in pizzaMenu[price_category].size) {
                        if (size === pizza_size.toLowerCase()) {
                            return pizzaMenu[price_category].size[pizza_size]
                        }
                    }
                }
            }
        }
}
function randomizeAnswers(arr){
    return arr[Math.floor(Math.random() * arr.length)];
}
function restart(answ = ""){
    pizza_lst = []
    pizza_quantity = 0
    pizza_mode = false
    almost_ready = false
    fully_ready = false

    answ = variants.startMsg
    botAnswers.push(answ)

    if(answ !== "")
        return answ
}
function bubbleSort(text, arr, property) {
    let len = arr.length;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len-1; j++) {
            if (text.indexOf(arr[j][property]) > text.indexOf(arr[j + 1][property])) {
                let tmp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = tmp;
            }
        }
    }
    return arr;
}
function modifyAnswer(keyword_tag, answ, num = 0) {
    // replacing [info]
    switch (keyword_tag) {
        case "pizza":
            return answ.replace(/\[.*]/g, pizzaModifiers.type.map((elem) => {
                return (" " + (elem.charAt(0).toUpperCase() + elem.slice(1)))
            }))
        case "location":
            return answ.replace(/\[.*]/g, details.address)
        case "our_address":
            answ = answ.replace(/\[restaurant_location]/g, details.address)
            return answ.replace(/\[min]/g, Math.floor(Math.random() * 41) + 20)
        case "user_address_answ":
            return answ.replace(/\[.*]/g, Math.floor(Math.random() * 41) + 20)
        case "contact":
            answ = answ.replace(/\[email]/g, details.email)
            return answ.replace(/\[.*]/g, details.telephone)
        case "social media":

            let organized_answer = "\n"
            for (let media in details.social_media) {
                organized_answer += "-> " + (media.charAt(0).toUpperCase() + media.slice(1)) + ": "
                    + details.social_media[media] + "\n"
            }
            return answ.replace(/\[.*]/g, organized_answer)
        case "delivery":
            return answ.replace(/\[.*]/g, details.delivery_map_link)
        case "menu":
            let str = ""
            str = "[Large, standard, small]: "
            for (let cost_type in pizzaMenu) {
                str += `[${pizzaMenu[cost_type].size["Large"]}$, ${pizzaMenu[cost_type].size["Standard"]}$, ` +
                    `${pizzaMenu[cost_type].size["Small"]}$] -> `
                for (let pizza_type of pizzaMenu[cost_type].type) {
                    str += (pizza_type.charAt(0).toUpperCase() + pizza_type.slice(1)) + ", "
                }
                str = str.slice(0, -2) + "; "
            }
            return answ.replace(/\[.*]/g, str.slice(0, -2))
        case "sauce":
            return answ.replace(/\[.*]/g, pizzaModifiers.sauce.map((elem) => {
                return (" " + (elem.charAt(0).toUpperCase() + elem.slice(1)))
            }))
        case "weight":
            answ = answ.replace(/\[large]/g, variants.weight.large.toString())
            answ = answ.replace(/\[standard]/g, variants.weight.standard.toString())
            return answ.replace(/\[small]/g, variants.weight.small.toString())
        case "ready_pizza":
            answ = answ.replace(/\[size]/g, pizza_lst[num].size)
            answ = answ.replace(/\[type]/g, pizza_lst[num].type)
            answ = answ.replace(/\[crust]/g, pizza_lst[num].crust)
            return answ.replace(/\[sauce]/g, pizza_lst[num].sauce)
        case "order_number":
            let capital_letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            let number = ""
            for (let i = 0; i < 7; i++) {
                number += capital_letters.charAt(Math.floor(Math.random() * capital_letters.length));
            }
            number += "#" + Math.floor(Math.random() * 8998 + 1001)
            return answ.replace(/\[.*]/g, number)
        case "overall_price":
            return answ.replace(/\[.*]/g, getOverallPrice().toString())
        case "current_order":
            let current_pizzas = "";
            for (let i = 0; i < pizza_lst.length; i++) {
                current_pizzas += "\n--> " + pizza_lst[i].size + " " + pizza_lst[i].type + " pizza"
                if (pizza_lst[i].crust.length !== 0)
                    current_pizzas += " on " + pizza_lst[i].crust + " crust"
                if (pizza_lst[i].sauce.length !== 0)
                    current_pizzas += " with " + pizza_lst[i].sauce + " sauce"
            }
            if (current_pizzas === "")
                answ = answ.replace(/\[.*]/g, randomizeAnswers(variants.current_order))
            return answ.replace(/\[.*]/g, current_pizzas)
        case "help":
            let help_list = ""
            for (let interaction of variants.help)
                help_list += interaction
            return answ.replace(/\[.*]/g, help_list)
        case "reviews":
            answ = answ.replace(/\[.*]/g, "")
            for (let i = 0; i < 3; i++)
                answ += variants.reviews[Math.floor(Math.random() * variants.reviews.length)]
            return answ
        default:
            return answ
    }
}

const operate = (data) => {
    let answer = ""
    let keywords = []

    let is_pizza_prop_upd = false;
    let yes_no_q = false;
    let is_menu_printed = false;
    let is_help_printed = false;


    // __MODIFYING DATA__

    // modifying user input (text)
    let userTextOrig = " " + data.toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=_`~()]/g, "")
        .replace(/s{2,}/g, " ")
        .replace(/ a /g, " ")
        .replace(/ the /g, " ")
        .replace(/ an /g, " ")
        .replace(/'s/g, " is")
        .replace(/please /g, "")
        .replace(/ please/g, "") + " "
    let userText = userTextOrig;

    // bots' last answer
    let botAnswers_last = botAnswers[botAnswers.length - 1].slice(botAnswers[botAnswers.length - 1]
        .lastIndexOf('\n')).toLowerCase()


    // __ORDER IS READY MODE__

    // switching to *order_fully_ready* mode
    if(almost_ready) {
        // not ready to submit --> back to *original* mode
        for (let agree_answer of variants.agree) {
            if (userText.includes(agree_answer))

                for (let question of variants.readyOrder.oneMore)
                    if (botAnswers_last.includes(question.toLowerCase())) {
                        almost_ready = false
                        botAnswers.push(answer)
                        return answer = randomizeAnswers(variants.readyOrder.notDoneYet) // what else to order?
                    }


        }

        // submit order --> *fully_ready* mode
        for (let disagree_answer of variants.disagree) {
            if (userText.includes(disagree_answer)) {

                for (let question of variants.readyOrder.oneMore) {
                    if (botAnswers_last.includes(question.toLowerCase())) {
                        answer = randomizeAnswers(variants.readyOrder.order_number)
                        answer = modifyAnswer("order_number", answer)  // tracking number
                        answer += " " + randomizeAnswers(variants.price.result)
                        answer = modifyAnswer("overall_price", answer)  // overall price
                        answer += "\n" + randomizeAnswers(variants.order_details.grab_meal) // pickup or delivery?

                        almost_ready = false
                        fully_ready = true

                        botAnswers.push(answer)
                        return answer
                    }
                }
            }
        }

        return randomizeAnswers(variants.readyOrder.oneMore)  // repeat until answer received
    }


    // __ADDITIONAL AGGRESSIVE QUESTION__
    // to switch to pizza_mode
    if(!pizza_mode && answer !== "" && !is_menu_printed && !is_help_printed && !almost_ready)
        answer += "\n " + randomizeAnswers(variants.order); // want to order pizza?

    // __FALLBACKS__
    if (answer === "") {
        //soft fallback
        answer = randomizeAnswers(variants.fallback)
        answer += "\"" + data + "\"";

        botAnswers.push("fallback")

        // hard fallback (= 3 soft fallbacks)
        if (botAnswers.length > 4)
            // if last 4 bot answers identical
            if (botAnswers.slice(-4).every((val, i, arr) => val === arr[0]))
                answer = restart(answer);  // answer = startMsg
    }
    else {
        botAnswers.push(answer);
    }


    // __SEND ANSWER__
    return answer;
}
module.exports = operate