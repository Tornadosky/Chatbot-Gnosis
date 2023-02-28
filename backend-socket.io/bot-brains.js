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
