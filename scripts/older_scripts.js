document.getElementById('createNewButton').disabled = true; // If you just disable this in the HTML, it won't necessarily be disabled on page reload.
const textArea = document.querySelector('textarea');
const output = document.getElementById('output');

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

// Form/page functionality ------

document.querySelectorAll('input').forEach(el=> el.addEventListener('keydown', (event)=>{
    if (!event.key.match(/[0-9\.\-]/g) && (!event.key.startsWith('Arrow') && (!event.key.startsWith('Backs') && !event.key.startsWith('Del')))) {
        event.preventDefault()
    }
}));

document.querySelectorAll('form button').forEach(el=> el.addEventListener('click', (event)=>{
    event.preventDefault();
}));

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

document.querySelector('.closeButton').addEventListener('click', (event)=> {
    event.target.parentElement.classList.remove('show');
    document.getElementById('mask').classList.remove('show');
});

// App functionality ------


// let indexArray = JSON.parse(localStorage.getItem('array')) || [];
// localStorage.removeItem('array');

// let loadedup = localStorage.getItem('array');
let indexArray = [];
// if (loadedup) {
//     console.log('here');
//     indexArray = JSON.parse(loadedup);
//     console.log(indexArray);
// }
// else {
//     console.log('har');
// }

localStorage.removeItem('array');
for (let i = 0; i < 2000; i++) {
    localStorage.removeItem(String(i));
}
localStorage.removeItem('array');

// let stored = localStorage.getItem('1');
// console.log(stored);

let indexCounter = indexArray.length && (indexArray[indexArray.length - 1] + 1);

// console.log(indexArray);


function Prompt ({params, engine, text, index} = {}) {
    if (params && engine && text && index) {
        this.params = params;
        this.engine = engine;
        this.text = text;
        this.index = index;
    }
    else {
        this.params = {
            prompt:             String(document.getElementById('prompt').value), // why do I need String() here?
            temperature:        parseFloat(document.getElementById('temperature').value),
            max_tokens:         parseInt(document.getElementById('max_tokens').value),
            top_p:              parseFloat(document.getElementById('top_p').value),
            frequency_penalty:  parseFloat(document.getElementById('frequency_penalty').value),
            presence_penalty:   parseFloat(document.getElementById('presence_penalty').value),
        };
        this.engine = document.getElementById('engine').value;
        this.text = '...';
        this.index = indexCounter++;
        console.log('counting up');
        indexArray.push(this.index);
        localStorage.setItem('array',JSON.stringify(indexArray));
    }
}

const promptPrototype = {
    async getText () {
        console.log('getText attempt');
        console.log(`https://api.openai.com/v1/engines/${this.engine}/completions`);
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
        return this.text
    },

    unWrite() {
        // remove from localStorage and Array
    },

    reWrite (source) {
        if (source) {
            this.assocElements.push(source);
        }
        this.hold(true)
        console.log('firing');
        this.getText().then(t => {
            // console.log('resolving', this.location);
            // console.log(this.location.tagName)
            if (this.location.tagName == "TEXTAREA") {
                this.location.value = t;
            }
            else {
                console.log('writing to paragraph');
                this.location.textContent = t;
            };
            this.hold(false);
            if (source) {
                this.assocElements.pop();
            };
        })
    },
    
    copy () {
        this.location.textContent = t;
    },

    hold (bool) {
        console.log(this.assocElements)
        if (bool) {
            for (el of this.assocElements) {
                console.log(`adding ${el}`);
                el.classList.add('wait');
                if (el.tagName = 'button') el.disabled=true;
            }
        }
        else {
            for (el of this.assocElements) {
                console.log(`removing ${el}`);
                el.classList.remove('wait');
                if (el.tagName = 'button') el.disabled=false;
            }
        }

    },

    makeHome () {
        const dContainer = document.createElement('div');
            const bClose = document.createElement('button');
                bClose.textContent = 'X';
                bClose.classList.add('closeButton');
                bClose.addEventListener('click', ()=>{
                    dContainer.remove();
                    this.unWrite();
                })
            const dTextContainer = document.createElement('div');
                const pPrompt = document.createElement('p');
                    pPrompt.append(this.params.prompt || 'no prompt provided')
                const pResponse = document.createElement('p');
                    pResponse.append(this.text);
                    this.location = pResponse;
                const bRetry = document.createElement('button');
                    bRetry.textContent = 'Resubmit this prompt';
                    bRetry.addEventListener('click', ()=>{
                        this.reWrite();
                    })
                console.log(this);
                this.assocElements = [pResponse, bRetry];
            dTextContainer.append(pPrompt, pResponse, bRetry);
            const dInfoContainer = document.createElement('div');
                    const pParams = document.createElement('p');
                    pParams.append(`engine:`, document.createElement('br'), this.engine);  
                        for (property of ['max_tokens', 'temperature', 'top_p', 'frequency_penalty', 'presence_penalty']) {
                            pParams.append(document.createElement('br'), `${property.match(/(^[a-z])|(_[a-z])/g).join('').padStart(3, ' ')}: ${this.params[property]}`);
                        }
        dContainer.append(bClose, dTextContainer, dInfoContainer);
        output.append(dContainer);
    }
}

Prompt.prototype = promptPrototype;

document.getElementById('createNewButton').addEventListener('click', function (Prompt) {
    return (event) => {
        const newPrompt = new Prompt;
        console.log()
        newPrompt.makeHome();
        newPrompt.reWrite(event.target);
    }
    }(Prompt)
);

document.getElementById('suggestButton').addEventListener('click', function (Prompt) {
    return (event) => {
        textArea.value = "Suggest an AI prompt."
        const newPrompt = new Prompt;
        newPrompt.location = textArea;
        newPrompt.assocElements = [textArea, event.target]
        newPrompt.reWrite();
    }
    }(Prompt)
)

function putPromptOnPage(target, promptObj){
    const mainDiv = document.createElement("div");

        const deleteButton = document.createElement("button");
            deleteButton.textContent = "X";
            deleteButton.classList.add("deleteButton");
            deleteButton.addEventListener('click', () => {
                mainDiv.remove();
                localStorage.removeItem(indexArray.splice(indexArray.length-1,1));
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


        retryButton.addEventListener('click', ()=>{
            let element = pResponse;
            let targetArray = [retryButton];
            writePromptToElement({element, targetArray, promptObj});
        });
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
        let element = pResponse;
        let targetArray;
        target ? targetArray = [target] : targetArray = []; 
        return {element, targetArray, promptObj};
        //writePromptToElement(pResponse, [target], promptObj);
}

// function writePromptToElement ({element, targetArray, promptObj}) {
//     targetArray.forEach(tar => {
//         tar.disabled = true;
//         tar.classList.add('wait');
//     });
//     element.classList.add('wait');
//     promptObj.getText().then(t => {
//         element.tagName == 'P'? element.textContent = t.trim() : element.value = t.trim();
//         targetArray.forEach(tar => {
//             tar.disabled = false;
//             tar.classList.remove('wait');
//         });
//         element.classList.remove('wait');
//         localStorage.setItem(String(promptObj.index), JSON.stringify(promptObj));
//     })
// }


// for (i of indexArray) {
//     console.log(i);
//     console.log(new Prompt(JSON.parse(localStorage.getItem(String(i)))));
//     putPromptOnPage(null, new Prompt(JSON.parse(localStorage.getItem(String(i)))));
// }


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



// getEngines().then(r => {
//     let j = 1;
//     r.data.forEach(i => {
//         const name = i.id;
//         if (requireStrings.every(str => name.includes(str)) && !excludeStrings.some(str => name.includes(str))) {
//             const option = document.createElement("option");
//             option.value = i.id;
//             option.text = `${j++}. ${i.id.toUpperCase()}`.padEnd(19, ' ');
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






