// localStorage.removeItem('array');
// for (let i = 0; i < 2000; i++) {
//     localStorage.removeItem(String(i));
// }

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

// App Setup ------

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

const requireStrings = ['text'];
const excludeStrings = ['search','code','similarity','edit','insert'];

getEngines().then(r => {
    let j = 1;
    r.data.forEach(i => {
        const name = i.id;
        if (requireStrings.every(str => name.includes(str)) && !excludeStrings.some(str => name.includes(str))) {
            const option = document.createElement("option");
            option.value = i.id;
            option.text = `${j++}. ${i.id.toUpperCase()}`.padEnd(19, ' ');
            document.getElementById('engine').appendChild(option);
        }
    });
    document.getElementById('createNewButton').disabled = false;
    }
)
// const option = document.createElement("option");
// option.value = 'text-curie-001';
// option.text = 'text-curie-001';
// engineSelect.appendChild(option);
// document.getElementById('createNewButton').disabled = false;

document.getElementById('createNewButton').addEventListener('click', function (Prompt) {
    return (event) => {
        const newPrompt = new Prompt;
        newPrompt.makeHome();
        newPrompt.writeStore(event.target);
    }
    }(Prompt)
);

document.getElementById('suggestButton').addEventListener('click', function (Prompt) {
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
    }
}

const promptPrototype = {
    async getText () {
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
        this.text = json.choices[0].text.trim();
        return this.text;
    },

    async write () {
        this.hold(true);
        t = String(await this.getText());
        if (this.location.tagName == "TEXTAREA") {
            this.location.value = t;
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
        // indexArray.push(this.index);
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
            const bClose = document.createElement('button');
                bClose.textContent = 'X';
                bClose.classList.add('closeButton');
                bClose.addEventListener('click', ()=>{
                    dContainer.remove();
                    this.unStore();
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
                        this.writeStore();
                    })
                this.assocElements = [pResponse, bRetry];
            dTextContainer.append(pPrompt, pResponse, bRetry);
            const dInfoContainer = document.createElement('div');
                    const pParams = document.createElement('p');
                    pParams.append(`engine:`, document.createElement('br'), this.engine);  
                        for (property of ['max_tokens', 'temperature', 'top_p', 'frequency_penalty', 'presence_penalty']) {
                            pParams.append(document.createElement('br'), `${property.match(/(^[a-z])|(_[a-z])/g).join('').padStart(3, ' ')}: ${String(this.params[property]).padStart(4, ' ')}`);
                        };
            dInfoContainer.append(pParams);
        dContainer.append(bClose, dTextContainer, dInfoContainer);
        output.append(dContainer);
    }
}

Prompt.prototype = promptPrototype;

let indexArray = JSON.parse(localStorage.getItem('array')) || [];
let indexCounter = indexArray.length && (indexArray.at(-1) + 1);

for (i of indexArray) {
    let restorePrompt = new Prompt(JSON.parse(localStorage.getItem(String(i))));
    console.log(restorePrompt);
    restorePrompt.makeHome();
    restorePrompt.copy();
}













