let startTime;
let started = false;

const usedParagraphs = [];
const paragraphsSection = document.getElementById('paragraphs');
const paragraphs = [];

let characterIndex = 0;
let paragraphIndex = 0;

let currentParagraph;

let correct = 0;
let errors = 0;
let words = 0;

const highlight_color = 'green';

Array.prototype.random = function(used = []) {
    const index = Math.floor((Math.random() * this.length));

    return used.includes(index) ? this.random(used) : this[index];
}

fetch('paragraphs.json', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    },
    mode: 'no-cors',
    cache: 'default'
})
.then(response => {
    return response.json();
})
.then(obj => {
    paragraphs.push(...obj.data);
    return createNewParagraph();
})
.then(paragraphElement => {
    const start = document.getElementById('start');
    const stop = document.getElementById('stop');
    const reset = document.getElementById('reset');

    paragraphElement.getElementsByClassName('char-0')[0].style.color = highlight_color;
    paragraphElement.getElementsByClassName('char-0')[0].style.fontWeight = 'bold';

    document.addEventListener('keydown', handleKeyDown);

    start.addEventListener('click', () => {
        if(started) return;
        started = true;

        startTime = Date.now();
        paragraphsSection.style.display = 'block';
        start.style.display = 'none';
        stop.style.display = 'block';
    });

    stop.addEventListener('click', () => {
        document.removeEventListener('keydown', handleKeyDown);
        stop.style.display = 'none';
        reset.style.display = 'block';
    });

    reset.addEventListener('click', () => {
        location.reload(0);
    });
});

function createNewParagraph() {
    return new Promise(resolve => {
        const paragraph = paragraphs.random(usedParagraphs).paragraph;
        currentParagraph = paragraph;

        const paragraphElement = document.createElement('p');

        for(let i = 0; i < paragraph.length; i++) {
            const character = document.createElement('span');
            character.innerText = paragraph.charAt(i);
            character.classList.add(`char-${i}`);
            paragraphElement.appendChild(character);
        }

        paragraphsSection.appendChild(paragraphElement);

        resolve(paragraphElement);
    });
}

function generateResults() {
    const timeDist = (Date.now() - startTime) / 6e4;

    console.log(`words: ${words}\ndist: ${timeDist}\nstartTime: ${startTime}\nnow: ${Date.now()}\n--------`);

    document.getElementById('wpm').innerText = Math.round(words / timeDist);
    document.getElementById('accuracy').innerText = Math.round((correct / (correct + errors)) * 100);
}

function handleKeyDown(event) {
    const key = event.key;
    if(key.length != 1) return;

    currentParagraphElement = document.getElementsByTagName('p')[paragraphIndex];

    const charStyleSet = (i, prop, value) => currentParagraphElement.getElementsByClassName(`char-${i}`)[0].style[prop] = value;
    const set = color => charStyleSet(characterIndex, 'color', color);

    if(key != currentParagraph.charAt(characterIndex)) {
        errors++;
        charStyleSet(characterIndex, 'textDecoration', 'underline');
        set('red');
        generateResults();
        return;
    }

    if(key == ' ' && currentParagraph.charAt(characterIndex) != '-') words++;

    set('black');
    charStyleSet(characterIndex, 'fontWeight', 'normal');

    correct++;
    characterIndex++;
    generateResults();

    if(characterIndex == currentParagraph.length) {
        paragraphIndex++;
        words++;
        characterIndex = 0;

        createNewParagraph().then(paragraphElement => {
            paragraphElement.getElementsByClassName('char-0')[0].style.color = highlight_color;
            paragraphElement.getElementsByClassName('char-0')[0].style.fontWeight = 'bold';
        });

        generateResults();
        return;
    }

    set(highlight_color);
    charStyleSet(characterIndex, 'fontWeight', 'bold');
}