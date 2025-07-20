
const newButton = document.getElementById('createNewButton');
const suggestButton = document.getElementById('suggestButton');
buttons = [newButton, suggestButton];
disableButtons(true);


const textArea = document.querySelector('textarea');
textArea.focus();
const output = document.getElementById('output');
const engineSelect = document.getElementById('engine');

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
    if (!event.key.match(/[0-9\.\-]/g) && (!event.key.startsWith('Arrow') && (!event.key.startsWith('Backs') && !event.key.startsWith('Del') && !event.key.startsWith('Tab')))) {
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

// App Functionality ------

// async function getEngines() {
//     const response = await fetch ('https://api.openai.com/v1/engines',
//         {
//             headers: {
//                 Authorization: `Bearer ${apiKey}`,
//             }
//         }
//     )
// }

// const requireStrings = [];
// const excludeStrings = [];
const engines = ['davinci-002', 'babbage-002']; 

// // deprecated--there are really just the two models now for v1/completions
// getEngines().then(r => {
//     r.data.forEach(i => {
//         const name = i.id;
//         if (requireStrings.every(str => name.includes(str)) && !excludeStrings.some(str => name.includes(str))) {
//             const option = document.createElement("option");
//             option.value = i.id;
//             option.text = i.id.toUpperCase();
//             engineSelect.appendChild(option);
//         }
//     });
//     engineSelect.lastChild.selected = true;
//     disableButtons(false);
//     }
// ).catch((error) => {
//     if (engineSelect.children.length == 0) {
//         const option = document.createElement("option");
//         option.value = 'text-curie-001';
//         option.text = 'TEXT-CURIE-001';
//         engineSelect.appendChild(option);
//         disableButtons(false);
//     }
// })
engines.forEarch(engine => {
    const option = document.createElement("option");
    option.value = engine;
    option.text = engine.toUppercase();
    engineSelect.appendChild(option)
})
engineSelect.lastChild.selected = true;
disableButtons(false);

function disableButtons (bool) {
    for (button of buttons) {
        button.disabled = bool;
        bool ? button.classList.add('wait') : button.classList.remove('wait');
    }
}

newButton.addEventListener('click', function (Prompt) {
    return (event) => {
        const newPrompt = new Prompt;
        newPrompt.makeHome();
        newPrompt.writeStore(event.target);
    }
    }(Prompt)
);

suggestButton.addEventListener('click', function (Prompt) {
    return (event) => {
        textArea.value = "Suggest an AI prompt."
        const newPrompt = new Prompt;
        newPrompt.writeTemp(textArea, [textArea, event.target]);
    }
    }(Prompt)
)

function Prompt ({params, engine, text, index} = {}) {
    if (params) {
        this.params = params;
        this.engine = engine;
        this.text = text;
        this.index = index;
    }
    else {
        this.params = {
            prompt:             String(document.getElementById('prompt').value), 
            temperature:        parseFloat(document.getElementById('temperature').value),
            max_tokens:         parseInt(document.getElementById('max_tokens').value),
            top_p:              parseFloat(document.getElementById('top_p').value),
            frequency_penalty:  parseFloat(document.getElementById('frequency_penalty').value),
            presence_penalty:   parseFloat(document.getElementById('presence_penalty').value),
        };
        this.engine = engineSelect.value;
        this.text = '...';
        this.index = indexCounter++;
    }
}

const promptPrototype = {
    async getText () {
        // try {
        //     const response = await fetch(
        //         `https://api.openai.com/v1/engines/${this.engine}/completions`,
        //         {
        //             method: 'POST',
        //             headers: {
        //                 "Content-Type": "application/json",
        //                 Authorization: `Bearer ${apiKey}`,
        //             },
        //             body: JSON.stringify(this.params),
        //         }
        //     );
        //     const json = await response.json();
        //     this.text = json.choices[0].text.trim();
        // }
        // catch {
        //     this.text = "[Error: Unable to process.]"
        // }
        try {
            const response = await fetch(
                '/.netlify/functions/machine_mind',
                { 
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        openai_params: this.params,
                        engine: this.engine 
                    })
                }
            );
            this.text = await response.text();
        } 
        catch (e) {
            this.text = "[ Error: The programmer who created my mind is an idiot ]";
            console.log(e)
        }
        return this.text;
    },

    async write () {
        this.hold(true);
        t = String(await this.getText());
        if (this.location.tagName == "TEXTAREA") {
            this.location.value = t.replace(/\n/, '');
        }
        else {
            this.location.textContent = t;
        }; 
        this.hold(false);
        return;
    },

    writeTemp (location, elements) {
        this.location = location;
        this.assocElements = elements;
        this.write()
    },

    async writeStore (source) {
        if (source) {
            this.assocElements.push(source);
        }
        await this.write();
        if (source) {
            this.assocElements.pop();
        };
        localStorage.setItem(
            String(this.index), 
            JSON.stringify({
                params: this.params,
                engine: this.engine,
                text: this.text,
                index: this.index
            })
        );
        if (!indexArray.includes(this.index)) {
            indexArray.push(this.index);
            localStorage.setItem(
                'array',
                JSON.stringify(indexArray)
            )
        }

    },

    unStore() {
        localStorage.removeItem(String(this.index));
        indexArray.splice(indexArray.indexOf(this.index),1);
        localStorage.setItem('array',JSON.stringify(indexArray))
    },

    copy () {
        this.location.textContent = this.text;
    },

    hold (bool) {
        if (bool) {
            for (el of this.assocElements) {
                el.classList.add('wait');
                if (el.tagName = 'button') el.disabled=true;
            }
        }
        else {
            for (el of this.assocElements) {
                el.classList.remove('wait');
                if (el.tagName = 'button') el.disabled=false;
            }
        }
    },

    makeHome () {
        const dContainer = document.createElement('div');
            const dTextContainer = document.createElement('div');
                const pPrompt = document.createElement('p');
                    pPrompt.append(this.params.prompt || '[no prompt provided]');
                const hr = document.createElement('hr');
                const pResponse = document.createElement('p');
                    pResponse.append(this.text);
                    this.location = pResponse;
                const bRetry = document.createElement('button');
                    bRetry.textContent = 'Resubmit this prompt';
                    bRetry.addEventListener('click', ()=>{
                        this.writeStore();
                    })
                this.assocElements = [pResponse, bRetry];
            dTextContainer.append(pPrompt, hr, pResponse, bRetry);
            const dInfoContainer = document.createElement('div');
                    const pParams = document.createElement('p');
                    pParams.append(`engine:`, document.createElement('br'), this.engine.substring(0,19));  
                        for (property of ['max_tokens', 'temperature', 'top_p', 'frequency_penalty', 'presence_penalty']) {
                            pParams.append(document.createElement('br'), `${property.match(/(^[a-z])|(_[a-z])/g).join('').padStart(3, ' ')}: ${String(this.params[property]).padStart(4, ' ')}`);
                        };
            dInfoContainer.append(pParams);
            const bClose = document.createElement('button');
                bClose.textContent = 'X';
                bClose.classList.add('closeButton');
                bClose.ariaLabel = "Remove this prompt";
                bClose.addEventListener('click', ()=>{
                    dContainer.remove();
                    this.unStore();
                })
        dContainer.append(dTextContainer, dInfoContainer, bClose);
        output.append(dContainer);
    }
}

Prompt.prototype = promptPrototype;

let indexArray = JSON.parse(localStorage.getItem('array')) || [];
let indexCounter = indexArray.length && (indexArray.at(-1) + 1);

try {
    for (i of indexArray) {
        let restorePrompt = new Prompt(JSON.parse(localStorage.getItem(String(i))));
        restorePrompt.makeHome();
        restorePrompt.copy();
    }
}
catch {
    localStorage.clear();
}













