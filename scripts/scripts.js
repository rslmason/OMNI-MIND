document.getElementById('myButton').disabled = true; // If you just disable this in the HTML, it won't necessarily be disabled on page reload.

const maskString = 'Open the pod bay doors, Hal.';
let apiKey = deobfuscator(maskedKey, maskString);

let output = document.getElementById('output');

const cookieName = 'pastPrompts';

let promptCookie = document.cookie.split(';').find(cookie => cookie.startsWith(`${cookieName}=`));
let cookieArray = [];

if (promptCookie) {
    cookieArray = JSON.parse(promptCookie.substring(12)).filter(x => x != undefined); 
    let j = 0;
    for (let i = 0; i < cookieArray.length; i++) {
        if (cookieArray[i]) {
            let {data, engine, text} = cookieArray[i];
            generateListElement(data, engine, text, i);
        }
    }
}
function deobfuscator (strOne, strTwo) {
    let strArray = [];
    for (let i = 0; i < strOne.length; i++) {
        let j = i % strTwo.length;
        strArray.push(strOne.charCodeAt(i) - strTwo.charCodeAt(j));
    }
    return String.fromCharCode(...strArray)
}
for (input of document.getElementsByTagName('input')) {
    input.addEventListener('change',(event)=>{
        const target = event.target;
        if (target.value === "" || parseFloat(target.value) < target.min) {
            target.value = target.min;
        }
        else if (parseFloat(target.value) > target.max) {
            target.value = target.max;
        }
    })
    if (input.step == '1') {
        input.addEventListener('change', (event) => {
            const target = event.target;
            target.value = parseInt(target.value);

        })
    }
}

document.getElementById('optionButton').addEventListener ('click', ()=>{
    document.getElementById('optionPanel').classList.toggle('show');
    document.getElementById('mask').classList.toggle('show');
})

const dataPrototype = {
    prompt: 'Write a poem about a dog wearing skis',
    temperature: 1.0,
    max_tokens: 64,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
}

Object.defineProperty(dataPrototype, 'parsingFunction',{
    value: {
        prompt: x => x,
        temperature: parseFloat,
        max_tokens: parseInt,
        top_p: parseInt,
        frequency_penalty: parseInt,
        presence_penalty: parseInt,
    },
    enumerable: false,
})

async function getEngines() {
    const response = await fetch ('https://api.openai.com/v1/engines',
        {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            }
        }
    )
    return response.json();
}

let engineSelect = document.getElementById('engine');
const requireStrings = ['text'];
const excludeStrings = ['search','code','similarity','edit','insert'];

document.querySelector('.deleteButton').addEventListener('click', (event)=> {
    event.target.parentElement.classList.remove('show');
    document.getElementById('mask').classList.remove('show');
});

getEngines().then(r => {
    let j = 1;
    r.data.forEach(i => {
        const name = i.id;
        if (requireStrings.every(str => name.includes(str)) && !excludeStrings.some(str => name.includes(str))) {
            const option = document.createElement("option");
            option.value = i.id;
            option.text = `${j++}. ${i.id.toUpperCase()}`;
            engineSelect.appendChild(option);
        }
    });
    document.getElementById('myButton').disabled = false;
    }
)
// const option = document.createElement("option");
// option.value = 'text-curie-001';
// option.text = 'text-curie-001';
// engineSelect.appendChild(option);
// document.getElementById('myButton').disabled = false;

const textArea = document.querySelector('textarea');

async function postPrompt(data, engine = 'text-curie-001') {
    const response = await fetch(`https://api.openai.com/v1/engines/${engine}/completions`,
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(data),
        }
    );
    return response.json();
}

document.querySelectorAll('input').forEach(el=> el.addEventListener('keypress', (event)=>{
    console.log(event.key);
    if (event.key = "Enter") {
        event.preventDefault()
    }
}));

document.querySelectorAll('form button').forEach(el=> el.addEventListener('click', (event)=>{
    event.preventDefault();
}));

document.getElementById('myButton').addEventListener('click', (event)=>{
    const data = gatherData();
    engine = document.getElementById('engine').value;
    userSubmitPrompt(data, engine,event.target)
});

document.getElementById('suggestButton').addEventListener('click', (event)=>{
    const data = gatherData('prompt');
    data.prompt = "Generate an AI prompt.";
    engine = document.getElementById('engine').value;
    postPrompt(data, engine)
        .then(r => textArea.value = r.choices[0].text.trim());
});

function gatherData (omit = "") {
    const data = new Object(dataPrototype);
    Object.keys(data).filter(key => key != omit).forEach(key => {
        data[key] = data.parsingFunction[key](document.getElementById(key).value);            
    });
    return data;
}

function userSubmitPrompt (data, engine, sourceElement) {
    sourceElement.disabled = true;
    sourceElement.classList.add('wait');
    postPrompt(data, engine).then(r => {
        logPrompt(data, engine, r.choices[0].text)
        sourceElement.disabled = false;
        sourceElement.classList.remove('wait');
    });
}

function updateCookie() {
    let cookieString = `${cookieName}=${JSON.stringify(cookieArray)}; SameSite=None; Secure`;
    document.cookie = cookieString;
}

function logPrompt (data,engine,text) {
    cookieArray.push({data, engine, text});
    updateCookie();
    generateListElement(data,engine,text, cookieArray.length-1);
}

function generateListElement (data, engine, text, index) {

    const mainDiv = document.createElement("div");

        const deleteButton = document.createElement("button");
            deleteButton.textContent = "X";
            deleteButton.classList.add("deleteButton");
            deleteButton.addEventListener('click', () => {
                mainDiv.remove();
                delete cookieArray[index];
                updateCookie();
            })
            mainDiv.appendChild(deleteButton);

        const subDivOne = document.createElement("div");
            const pPrompt = document.createElement("p");
            const tPrompt = document.createTextNode(data.prompt || "[no prompt provided]");
            pPrompt.appendChild(tPrompt);
            subDivOne.appendChild(pPrompt);
            const pResponse = document.createElement("p");
            const tResponse = document.createTextNode(text);
            pResponse.appendChild(tResponse);
            subDivOne.appendChild(pResponse);

            const retryButton = document.createElement("button");
            retryButton.textContent = "Resubmit this prompt";
            retryButton.addEventListener('click', (event) => {
                let target = event.target;
                target.disabled = true;
                target.classList.add('wait');
                pResponse.classList.add('wait');
                postPrompt(data, engine)
                    .then(r => {
                        pResponse.textContent = r.choices[0].text;
                        cookieArray[index].text = r.choices[0].text;
                        updateCookie();
                        target.disabled = false;
                        target.classList.remove('wait');
                        pResponse.classList.remove('wait');
                    });
            })
            subDivOne.appendChild(retryButton);
    
            

            mainDiv.appendChild(subDivOne);

        const subDivTwo = document.createElement("div");
            const dataP = document.createElement("p");
            const br = document.createElement('br');
            dataP.append(`engine:`, br, engine)            
            for (property of ['max_tokens', 'temperature', 'top_p', 'frequency_penalty', 'presence_penalty']){
                const br = document.createElement("br");
                dataP.append(br, `${property.match(/(^[a-z])|(_[a-z])/g).join('')}: ${data[property]}`);
            }
            subDivTwo.appendChild(dataP);
            mainDiv.appendChild(subDivTwo);
        output.appendChild(mainDiv);

}

