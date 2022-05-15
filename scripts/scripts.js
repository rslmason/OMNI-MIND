document.getElementById('createNewButton').disabled = true; // If you just disable this in the HTML, it won't necessarily be disabled on page reload.
const textArea = document.querySelector('textarea');

const maskString = 'Open the pod bay doors, Hal.';
const apiKey = deobfuscator(maskedKey, maskString);
function deobfuscator (strOne, strTwo) {
    let strArray = [];
    for (let i = 0; i < strOne.length; i++) {
        let j = i % strTwo.length;
        strArray.push(strOne.charCodeAt(i) - strTwo.charCodeAt(j));
    }
    return String.fromCharCode(...strArray)
}

const output = document.getElementById('output');

const cookieName = 'pastPrompts';
let promptCookie = document.cookie.split(';').find(cookie => cookie.startsWith(`${cookieName}=`));
let cookieArray = [];


if (promptCookie) {
    cookieArray = JSON.parse(promptCookie.substring(12)).filter(x => x != undefined); 
    for (let i = 0; i < cookieArray.length; i++) {
        if (cookieArray[i]) {
            let {data, engine, text} = cookieArray[i];
            generateListElement(data, engine, text, i);
        }
    }
}

// form functionality
for (input of document.getElementsByTagName('input')) {
    input.addEventListener('change',(event)=>{
        target = event.target;
        if (target.value == "" || (parseFloat(target.value) < parseFloat(target.min))) {
            target.value = parseFloat(target.min);
        }
        else if (parseFloat(target.value) > parseFloat(target.max)) {
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

document.getElementById('optionButton').addEventListener ('click', toggleShowById('optionPanel', 'mask'))

document.getElementById('mask').addEventListener ('click', toggleShowById('optionPanel', 'mask'))

function toggleShowById (...args) {
    return ()=>{
        for (id of args) {
            document.getElementById(id).classList.toggle('show');
        }
    }
}

function toggleShowElements (...args) {
    return ()=>{
        for (el of args) {
            el.classList.toggle('show');
        }
    }
}


document.getElementById('optionsCollapseButton').addEventListener('click', toggleShowElements(...document.querySelectorAll('.options label, .options select, .options input')))
document.getElementById('optionsCollapseButton').addEventListener('click', (event)=>{
    if (event.target.textContent == "▼") {
        event.target.textContent = "▲";
    }
    else {
        event.target.textContent = "▼";
    }
})

// let indexArray = [];
//  localStorage.getItem('indexArray').json().then(stored =>
//     if (stored) {

//     }
// ) || 0;

// let indexArray = localStorage.getItem('indexArray') || [];
let indexArray = [];
// indexArray = [3, 4, 5];
let indexCounter = indexArray.length && (indexArray[indexArray.length - 1] + 1);


function Prompt ({params, engine, text, index} = {}) {
    if (params && engine && text && index) {
        console.log('creating prompt from existing object')
        this.params = params;
        this.engine = engine;
        this.text = text;
        this.index = index;
    }
    else {
        // this.getParams = function () {
        //     return {
        this.params = {
            prompt: String(document.getElementById('prompt').value), // why do I need String() here?
            temperature: parseFloat(document.getElementById('temperature').value),
            max_tokens: parseInt(document.getElementById('max_tokens').value),
            top_p: parseFloat(document.getElementById('top_p').value),
            frequency_penalty: parseFloat(document.getElementById('frequency_penalty').value),
            presence_penalty: parseFloat(document.getElementById('presence_penalty').value),
        };
        this.text = '...';
        this.engine = document.getElementById('engine').value;
        this.index = indexCounter++;
        indexArray.push(this.index);
    }

    this.getText = async function () {
        console.log('getText attempt');
        const response = await fetch(
            `https://api.openai.com/v1/engines/${this.engine}/completions`,
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify(this.params),
            }
        );
        const json = await response.json();
        this.text = json.choices[0].text;
        // localStorage.setItem(this.index, JSON.stringify({this.params, this.engine, this.text, this.index}));
        return this.text
    };
}

document.getElementById('createNewButton').addEventListener('click', function (Prompt) {
        return (event) => {
            putPromptOnPage(event.target, new Prompt);
            console.log(Prompt)
        }
        
    }(Prompt) 
);

document.getElementById('suggestButton').addEventListener('click', function (Prompt) {
    
    return (event) => {
        textArea.value = "Suggest an AI prompt."
        writePromptToElement(textArea, [event.target, textArea], new Prompt)
        // pResponse, retryButton, promptObj
    }
    }(Prompt)
)

// document.getElementById('suggestButton').addEventListener('click', (event)=>{
//     event.target.classList.add('wait');
//     const data = gatherData('prompt');
//     data.prompt = "Generate an AI prompt.";
//     engine = document.getElementById('engine').value;
//     postPrompt(data, engine)
//         .then(r => {
//             textArea.value = r.choices[0].text.trim()
//             event.target.classList.remove('wait');
//         });
// });

function putPromptOnPage(target, promptObj){
    const mainDiv = document.createElement("div");

        const deleteButton = document.createElement("button");
            deleteButton.textContent = "X";
            deleteButton.classList.add("deleteButton");
            deleteButton.addEventListener('click', () => {
                mainDiv.remove();
                //delete cookieArray[index];
                //updateCookie();
                // localStorage.removeItem(indexArray[splice(promptObj.index,1)[0]]);

            })
            mainDiv.appendChild(deleteButton);
        
        const subDivOne = document.createElement("div");
            const pPrompt = document.createElement("p");
            const tPrompt = document.createTextNode(promptObj.params.prompt || "[no prompt provided]");
            pPrompt.appendChild(tPrompt);
            subDivOne.appendChild(pPrompt);

            const pResponse = document.createElement("p");
            const tResponse = document.createTextNode(promptObj.text);
            pResponse.appendChild(tResponse);
            subDivOne.appendChild(pResponse);

        const retryButton = document.createElement("button");
        retryButton.textContent = "Resubmit this prompt";


        retryButton.addEventListener('click', ()=>{writePromptToElement(pResponse, [retryButton], promptObj)});
        subDivOne.appendChild(retryButton);

            mainDiv.appendChild(subDivOne)


            const subDivTwo = document.createElement("div");
            const dataP = document.createElement("p");
            const br = document.createElement('br');
            dataP.append(`engine:`, br, promptObj.engine)            
            for (property of ['max_tokens', 'temperature', 'top_p', 'frequency_penalty', 'presence_penalty']){
                const br = document.createElement("br");
                dataP.append(br, `${property.match(/(^[a-z])|(_[a-z])/g).join('').padStart(3, ' ')}: ${promptObj.params[property]}`);
            }
            subDivTwo.appendChild(dataP);
            mainDiv.appendChild(subDivTwo);

        output.append(mainDiv);

        writePromptToElement(pResponse, [target], promptObj);
}

function writePromptToElement (element, targetArray, promptObj) {
    targetArray.forEach(tar => {
        tar.disabled = true;
        tar.classList.add('wait');
    });
    element.classList.add('wait');
    promptObj.getText().then(t => {
        element.tagName == 'P'? element.textContent = t.trim() : element.value = t.trim();
        targetArray.forEach(tar => {
            tar.disabled = false;
            tar.classList.remove('wait');
        });
        element.classList.remove('wait');
    })
}

// let writePromptToDiv = (promptObj, source, target) => {
//     console.log('did');
//     element.disabled = true;
//     element.classList.add('wait');
//     pResponse.classList.add('wait');
//     promptObj.getText().then(t => {
//         pResponse.textContent = t;
//         retryButton.disabled = false;
//         retryButton.classList.remove('wait');
//         pResponse.classList.remove('wait');
//         console.log('dad');
//     });
// }
 // p tag!



    // const myNewData = new Prompt(
    //     {
    //         prompt: 'Write a poem about a dog wearing skis',
    //         temperature: 1.0,
    //         max_tokens: 64,
    //         top_p: 1.0,
    //         frequency_penalty: 0.0,
    //         presence_penalty: 0.0,
    //     },
    //     'text-curie-001',
    //     indexCounter++,
    // )

// myNewData.getText();

// console.log(myNewData.getText())


// function Prompt (data, engine, index, text) {
//     for (key of this.prototype.parsingFunction.keys()) {
//         this.data[key] = document.getElementById[key];
//     }
//     this.data = data;
//     this.engine = engine;
//     this.index = index
//     if (text) this.text = text;
//     // this.text
// }

// ---------------

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
        top_p: parseFloat,
        frequency_penalty: parseFloat,
        presence_penalty: parseFloat,
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

// getEngines().then(r => {
//     let j = 1;
//     r.data.forEach(i => {
//         const name = i.id;
//         if (requireStrings.every(str => name.includes(str)) && !excludeStrings.some(str => name.includes(str))) {
//             const option = document.createElement("option");
//             option.value = i.id;
//             option.text = `${j++}. ${i.id.toUpperCase()}`;
//             engineSelect.appendChild(option);
//         }
//     });
//     document.getElementById('createNewButton').disabled = false;
//     }
// )
const option = document.createElement("option");
option.value = 'text-curie-001';
option.text = 'text-curie-001';
engineSelect.appendChild(option);
document.getElementById('createNewButton').disabled = false;



async function postPrompt(data, engine = 'text-curie-001') {
    delete data.parsingFunction;
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

document.querySelectorAll('input').forEach(el=> el.addEventListener('keydown', (event)=>{
    if (!event.key.match(/[0-9\.\-]/g) && (!event.key.startsWith('Arrow') && (!event.key.startsWith('Backs') && !event.key.startsWith('Del')))) {
        event.preventDefault()
    }
}));

document.querySelectorAll('form button').forEach(el=> el.addEventListener('click', (event)=>{
    event.preventDefault();
}));





