document.getElementById('myButton').disabled = true; // If you just disable this in the HTML, it won't necessarily be disabled on page reload.

// const apiKey = fetch('netlify/functions/getEnvVar');

let apiKey;

fetch(".netlify/functions/api")
.then(response => response.json())
.then(jason => console.log(jason.myKey));

// console.log(apiKey)

// for (i of document.getElementsByTagName('input')) {
//     i.addEventListener('change',(event)=>{
//         const target = event.target;
//         if (target.value === "" || parseFloat(target.value) < target.min) {
//             target.value = target.min;
//         }
//         else if (parseFloat(target.value) > target.max) {
//             console.log('that');
//             target.value = target.max;
//         }
//     })
//     if (i.step == '1') {
//         i.addEventListener('change', (event) => {
//             const target = event.target;
//             target.value = parseInt(target.value);

//         })
//     }
// }

let output = document.getElementById('output');

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


let engine = 'text-curie-001';

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
//     r.data.forEach(i => {
//         const name = i.id;
//         if (requireStrings.every(str => name.includes(str)) && !excludeStrings.some(str => name.includes(str))) {
//             const option = document.createElement("option");
//             option.value = i.id;
//             option.text = i.id;
//             engineSelect.appendChild(option);
//         }
//     });
//     document.getElementById('myButton').disabled = false;
//     }
// )

// async function postPrompt(data, engine = 'text-curie-001') {
//     const response = await fetch(`https://api.openai.com/v1/engines/${engine}/completions`,
//         {
//             method: 'POST',
//             headers: {
//                 "Content-Type": "application/json",
//                 //Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//                 Authorization: `Bearer ${apiKey}`,
//             },
//             body: JSON.stringify(data),
//         }
//     );
//     return response.json();
// }


document.getElementById('myButton').addEventListener('click', (event)=>{
    event.preventDefault();
    const data = new Object(dataPrototype);
    Object.keys(data).forEach(key => {
        data[key] = data.parsingFunction[key](document.getElementById(key).value);            
    });
    engine = document.getElementById('engine').value;
    userSubmitPrompt(data, engine)
});

function userSubmitPrompt (data, engine) {

    postPrompt(data, engine).then(r => generateListElement(data, engine, r.choices[0].text));
}

function generateListElement (data, engine, text) {

    const mainDiv = document.createElement("div");
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
            retryButton.addEventListener('click', () => {
                postPrompt(data, engine).then(r => tResponse.textContent = r.choices[0].text);
            })
            subDivOne.appendChild(retryButton);
    
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "x";
            deleteButton.addEventListener('click', () => {
                mainDiv.remove();
            })
            subDivOne.appendChild(deleteButton);

            mainDiv.appendChild(subDivOne);

        const subDivTwo = document.createElement("div");
            let dataP = document.createElement("p");
            let dataT = document.createTextNode(`engine: ${engine}`)
            dataP.appendChild(dataT);
            subDivTwo.appendChild(dataP);
            for (property of ['temperature', 'max_tokens', 'top_p', 'frequency_penalty', 'presence_penalty']){
                let dataP = document.createElement("p");
                let dataT = document.createTextNode(`${property}: ${data[property]}`)
                dataP.appendChild(dataT);
                subDivTwo.appendChild(dataP);
            }
            mainDiv.appendChild(subDivTwo);
    
        output.appendChild(mainDiv);

}
