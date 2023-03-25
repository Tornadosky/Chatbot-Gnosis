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
                        return answer = randomizeAnswers(variants.readyOrder.notDoneYet) // what else to order?
                    }
        }

        // submit order --> *fully_ready* mode
        for (let disagree_answer of variants.disagree) {
            if (userText.includes(disagree_answer)) {

                for (let question of variants.readyOrder.oneMore) {
                    if (botAnswers_last.includes(question.toLowerCase())) {

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

    // order is fully ready --> get delivery details
    if(fully_ready){
        almost_ready = false

        if(botAnswers[botAnswers.length - 1].includes("address")){
            restart()
            return answer
        }
        if(userText.includes("deliver")){
            answer = randomizeAnswers(variants.order_details.user_address_q) // what is users address
            botAnswers.push(answer)
            return  answer
        }
        if(userText.includes("pickup")){
            answer = randomizeAnswers(variants.order_details.our_address) // inform user: our location and time
            answer = modifyAnswer("our_address", answer)
            botAnswers.push(answer)
            restart()
            return answer
        }
    }

    // __ORIGINAL MODE__

    // Y/N QUESTION <--> BOT KEYWORD SPOTTING

    // if last bot msg is new_line --> probably y/n question
    if(botAnswers_last) {
        // yes case
        for (let agree_answer of variants.agree) {
            if (userText.includes(agree_answer)) {
                yes_no_q = true;

                // get bot response from tags.json file
                for (let tagObj of tags)
                    if (botAnswers_last.includes(tagObj.tag)) {

                        answer = randomizeAnswers(tagObj.responses);
                        answer = modifyAnswer(tagObj.tag, answer);

                        break;
                    }
                almost_ready = false;
                break;
            }
        }
        // no case
        if (!yes_no_q) {

            // "no thanks" case included
            for (let disagree_answer of variants.disagree)
                if (userText.includes(disagree_answer)) {

                    for (let tagObj of tags)
                            for (let tagPattern of tagObj.patterns)
                                if (userText.includes(tagPattern))
                                    userText = userText.replace(tagPattern, " ");

                    answer = randomizeAnswers(variants.noQ) // how can i help you
                    is_help_printed = true
                    break;
                }
        }
    }

    // SIMPLE QUESTION <--> USER KEYWORD SPOTTING

    // get response to simple request
    if(!yes_no_q) {
        let answer_picked = false; // answer to priority question

        for (let tagObj of tags) {
            for (let tagPattern of tagObj.patterns)
                if (userText.includes(tagPattern)) {

                    answer_picked = true;

                    answer = randomizeAnswers(tagObj.responses)
                    answer = modifyAnswer(tagObj.tag, answer)

                    if (tagObj.tag === "pizza" || tagObj.tag === "menu") {
                        let next_q = variants.type.botQuestion  // what exact pizza you want
                        answer += " " + randomizeAnswers(next_q)
                    }
                    is_help_printed = false
                    break;
                }

            if(answer_picked)
                break;
        }
    }

    // request with modify intent
    // weight, cost, restart adn current_order cases --> return answer
    for (let tagObj of tags) {
        for (let tagPattern of tagObj.patterns)
            if (userText.includes(tagPattern))
                switch (tagObj.tag) {
                    case "restart":
                        answer = restart() // answer = startMsg
                        return answer
                    case "current_order":
                        answer = randomizeAnswers(tagObj.responses)
                        answer = modifyAnswer(tagObj.tag, answer)

                        botAnswers.push(answer)
                        return answer
                    case "weight":
                        answer = randomizeAnswers(tagObj.responses)
                        answer = modifyAnswer(tagObj.tag, answer)

                        botAnswers.push(answer)
                        return answer
                    case "price":
                        answer = ""

                        for (let pizza_type of pizzaModifiers.type) {
                            if (userText.includes(pizza_type)) {
                                for (let pizza_size of pizzaModifiers.size)
                                    if (userText.includes(pizza_size)) {
                                        answer = randomizeAnswers(tagObj.responses)
                                        answer = answer.replace(/\[type]/g, pizza_type);
                                        answer = answer.replace(/\[size]/g, pizza_size);
                                        answer = answer.replace(/\[price]/g,
                                            getPrice(pizza_type, pizza_size).toString());
                                        break;
                                    }

                                break;
                            }
                        }
                        if (answer === "")
                            answer = randomizeAnswers(variants.price.error)  // pizza type and size must be included

                        botAnswers.push(answer)
                        return answer
                }
    }

    // __SWITCHING TO *PIZZA_MODE*__

    // if pizza's {type} mentioned --> activating *pizza_mode*
    if(!pizza_mode) {
        for (let pizza_type of pizzaModifiers.type) {
            if (userText.includes(pizza_type)) {
                almost_ready = false
                pizza_mode = true;
                break;
            }
        }
    }

    // __PIZZA MODE__

    // cyclic questions until order is completed
    if (pizza_mode) {

        // CREATING OBJECTS AND PUSHING TO ORDER LIST

        //  "{num} {pizza_type}" recognition
        for (let pizza_type of pizzaModifiers.type) {
            if (userText.includes(pizza_type))
                for (let quantity of variants.quantity)
                    if (userText.includes(quantity + " " + pizza_type)) {

                        // deleting info  --- not to get keywords for the second time after
                        userText = userText.replace(quantity, "");
                        userText = userText.replace(pizza_type, "");

                        let amount = getAmount(quantity); // "three" --> 3 as int

                        // create and push pizzas
                        for (let i = 0; i < amount; i++)
                            pizza_lst.push({type: pizza_type, size: "", sauce: "", crust: ""});

                        pizza_quantity += amount;
                        is_pizza_prop_upd = true;
                    }
        }

        //  "{size} {pizza_type}" recognition
        for (let pizza_type of pizzaModifiers.type) {
            if (userText.includes(pizza_type))
                for (let pizza_size of pizzaModifiers.size)
                    if (userText.includes(pizza_size + " " + pizza_type)) {

                        // deleting info  --- not to get keywords for the second time after
                        userText = userText.replace(pizza_size, "");
                        userText = userText.replace(pizza_type, "");

                        pizza_lst.push({type: pizza_type, size: pizza_size, sauce: "", crust: ""});

                        pizza_quantity++;
                        is_pizza_prop_upd = true;
                    }
        }

        // "{pizza_type}" recognition
        for (let pizza_type of pizzaModifiers.type) {
            if (userText.includes(pizza_type)) {

                // deleting info  --- not to get keywords for the second time after
                userText = userText.replace(pizza_type, "");

                pizza_lst.push({type: pizza_type, size: "", sauce: "", crust: ""});

                pizza_quantity++;
                is_pizza_prop_upd = true;
            }
        }

        // SORTING [as order will be filled respectively]
        pizza_lst = bubbleSort(userTextOrig, pizza_lst, "type");

        // FILLING ORDER
        let textNoKeywords = userText; // copy for further sorting
        // get modifier keywords
        for (let pizModProperty in pizzaModifiers) {
            for (let modifyPattern of pizzaModifiers[pizModProperty]) {

                let keyword_pushed = false;
                if (textNoKeywords.includes(modifyPattern)) {
                    textNoKeywords = textNoKeywords.replace(modifyPattern, "");
                }
            }
        }

        // SORTING [as order will be filled respectively]
        keywords = bubbleSort(userText, keywords, "keyword");

        // fill in the order according to keywords found -- priority for first pizza
        for (let property in pizzaModifiers) {
            for (let keywordObj of keywords)
                if (property === keywordObj.tag)
                    for (let i = 0; i < pizza_lst.length; i++)
                        if (pizza_lst[i][property] === "") {
                            pizza_lst[i][keywordObj.tag] = keywordObj.keyword;

                            is_pizza_prop_upd = true; // better looks
                            break;
                        }
        }
    }

    // PICK MODIFIER QUESTION

    // picking next question to modify order
    for (let i = 0; i < pizza_lst.length; i++) {

        let answer_picked;
        for (let property in pizza_lst[i]) {

            answer_picked = false;
            if (pizza_lst[i][property] === "") {

                // text formatting
                if (answer !== "" && !yes_no_q)
                    answer += " ";

                // better looks
                if (is_pizza_prop_upd) {
                    let praising_list = variants.praising;
                    answer = randomizeAnswers(praising_list); // Okay! Great! etc..
                    answer += " ";
                }

                switch (property) {
                    case "size":

                        if (!answer_picked)
                            answer += randomizeAnswers(variants.size.botQuestion); // what size

                        answer_picked = true;
                        break;
                    case "sauce":
                        if (!answer_picked) {
                            let sauce_answer = randomizeAnswers(variants.sauce.botQuestion); // what sauce
                            sauce_answer = modifyAnswer("sauce", sauce_answer);
                            answer += sauce_answer;
                        }

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

    // __ADDITIONAL AGGRESSIVE QUESTION__

    // __FALLBACKS__
    if (answer === "") {
        //soft fallback
        answer = randomizeAnswers(variants.fallback)
        answer += "\"" + data + "\"";

        // hard fallback (= 4 soft fallbacks)
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