// Przyciski i pola
const display = document.getElementById("display")
const clear = document.getElementById("clear")
const back = document.getElementById("back")
const off = document.getElementById("off")
const operations = {
    "+":document.getElementById("add"),
    "-":document.getElementById("subtract"),
    "*":document.getElementById("multiply"),
    "/":document.getElementById("divide"),
    ".":document.getElementById("dot"),
    "=":document.getElementById("equals")
}
const number = []
for (let index = 0; index <= 9; index++) {
    number.push(document.getElementById(String(index)))
}

// Zmienne
let ondisplay = []
let current = ""
let isOn = true
let mathError = false
let isResult = false

// Funkcje pomocnicze
const digits_only = string => string.split("").every(c => '0123456789'.includes(c));
const operators_only = string => string.split("").every(c => '+-*/.'.includes(c));
const nothing_in_memory = () => ondisplay.length==0 && current.length==0;

// Wyświetlanie
function renderDisplay(text=""){
    if (mathError) {
        display.textContent="Error"
        isOn=false
    } else if (!isOn){
        display.innerHTML="&nbsp;"
        return
    } else if (isOn && nothing_in_memory()) { 
        display.textContent="0"
    } else if (text.length>0) {
        display.textContent=text
        return
    } else {
        display.textContent=((ondisplay.join(" ") ?? "")+(" "+current ?? "")).replaceAll(" . ", ".")
    }
}

// TODO:
// - rozbijanie liczb ujemnych w wyniku
// - 0.1+0.2==0.3000000
// - na githubie nie dziala

// Input
function handleInput(input){
    let last = ondisplay[ondisplay.length-1] ?? ''
    if (!isOn) return
    if (current=='') isResult=false 

    // liczba
    if (digits_only(input)) {
        if (isResult) {
            ondisplay=[]
            current=''
            isResult=false
        }
        current+=input

    // minus jako pierwszy
    } else if (input=="-" && nothing_in_memory()) {
        ondisplay.push("0")
        ondisplay.push("-")

    //backspace
    } else if (input=="back") {
        // gdy nie ma nic do usunięcia
        if (nothing_in_memory()){
            return
        //gdy mamy liczbe obecna
        } else if (current.length>0) {
            current = current.substring(0,Math.max(current.length-1, 0))
        
        // gdybysmy mieli liczbe jako ostatnia
        } else if (digits_only(last) && current.length==0) {
            current = ondisplay.pop()
            current = current.substring(0,Math.max(current.length-1, 0))
        // gdybysmy mieli operator ostatni
        } else if (operators_only(last) || last=="."){
            ondisplay.pop()
            current=ondisplay.pop()
        }
    // unikamy dwóch kropek
    } else if (input=="." && (last.includes(".") || current.includes(".") )) {
        return
    // nie pozwalamy na operator jako pierwszy
    } else if (operators_only(input) && nothing_in_memory()) {
        return
    // gdy dajemy operator i mamy liczbe
    } else if (operators_only(input) && current.length>0) {
        ondisplay.push(current)
        ondisplay.push(input)
        current=""
    // podmiana operatora (ale nie kropki)
    } else if (operators_only(input) && operators_only(last) && input!=".") {
        ondisplay.pop()
        ondisplay.push(input)
    
    // gdy chcemy wynik
    } else if (input=="="){
        if (current.length>0) ondisplay.push(current)
        if (current.length==0 && operators_only(last)) ondisplay.pop()
        current=""
        Calculate()
    }

    renderDisplay()
}

// Obliczanie wyniku
function Calculate(){
    [".","/","*","-","+"].forEach(op => {
        for (let i = 0; i < ondisplay.length; i++) {
            if (!isOn || mathError) return
            if (ondisplay[i]==op){
                ondisplay[i]=(SingleCalculation(ondisplay[i-1], ondisplay[i+1], ondisplay[i])).toString()
                ondisplay.splice(i+1,1)
                ondisplay.splice(i-1,1)
                i-=2
            }
        }
    })
    isResult=true
    if (ondisplay[0].includes(".")){
            temp = ondisplay[0].split(".")
            ondisplay=[]
            ondisplay.push(temp[0])
            ondisplay.push(".")
            current=temp[1].substring(0,Math.min(temp[1].length,8))
        } else {
            current=ondisplay.pop()
        }
}

function SingleCalculation(value1, value2, op){
    if (op==".") return parseFloat(value1+op+value2)
    if (op=="/" && value2=="0"){
        mathError = true
        return ''
    }
    if (op=="/") return parseFloat(value1)/parseFloat(value2)
    if (op=="*") return parseFloat(value1)*parseFloat(value2)
    if (op=="-") return parseFloat(value1)-parseFloat(value2)
    if (op=="+") return parseFloat(value1)+parseFloat(value2)
    
}

// Listener'y dla przycisków
back.addEventListener("click", ()=>{
    handleInput("back")
})
off.addEventListener("click", ()=>{
    ondisplay=[]
    current=""
    isOn=false
    renderDisplay()
})
clear.addEventListener("click", ()=>{
    ondisplay=[]
    current=""
    isOn=true
    mathError=false
    renderDisplay("0")
})
Object.entries(operations).forEach(([key, item])=>{
    item.addEventListener("click", () =>{
        handleInput(key)
    })
})
number.forEach((item)=>item.addEventListener("click", (event)=>{
    const element = event.currentTarget;
    handleInput(element.id)
}))
