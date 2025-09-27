function viewInteractManager(thresholdd, classN, onInit, onLoad, onUnload){ //eh name
    const DOMTargets = document.getElementsByClassName(classN);
    const loadObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.intersectionRatio >= thresholdd){
                onLoad(entry.target);
            }
            else{
                onUnload(entry.target);
            }
        });
    }, {threshold: [0.0, thresholdd]});
    
    [...DOMTargets].forEach(element => {
        loadObs.observe(element);
        onInit(element);
    });

    //to return a cleanup function
    return () => {
        loadObs.disconnect();
    };
}

//-------------------------
let sourceText;
fetch('data.json').then(response => response.json())
    .then(data => sourceText = data.test.split(''));

function eval_unnormal(f, start, end, len, index){
    return f((start+(index/(len-1))*(end-start)));
}

function interpArr(func, start, end, len){
        const f = func;
        const range = [];
        for (let i=0;i<len;i++){
            range[i] = eval_unnormal(f, start, end, len, i);
        }
        //console.log(range);
        const max = Math.max(...range);//last..

        return range.map(x => x/max);
}

class undoRepos{
    constructor(){
        this.entryList = [];
    }

    addEntry(element){
        this.entryList.push(element);
    }

    fixPos(flag){
        this.entryList.forEach((entry) => {
            entry.style.top = entry.dataset.itop;
            entry.style.left = entry.dataset.ileft;
            if(entry.dataset.isColdSpan!='true'){
                entry.style.visibility = 'visible';
            }
        });
    }
};

function storeCoordsSub(element, refEm, resetP){
    const rRect = refEm.getBoundingClientRect();
    const emRect = element.getBoundingClientRect();

    //console.log(element.offsetParent);

    //console.log(rRect.height, emRect.height);
    if (element.dataset.isColdSpan=='true'){//???????????
        element.dataset.itop = 0+'px';
        element.dataset.ileft = 0+'px';
    }
    else{
    element.dataset.itop = rRect.height - emRect.height + 'px';
    element.dataset.ileft = rRect.width + 'px';
    }

    resetP.addEntry(element);
}

function genCh(coldSpan, sourceText, index, resetP){
    const character = sourceText[index];

    const chEm = coldSpan.cloneNode(false);
    chEm.style.visibility = 'hidden';
    chEm.textContent = character;
    chEm.dataset.isColdSpan = 'false';


    const refEm = coldSpan.previousElementSibling;

    if (index>0){
        refEm.textContent +=
            sourceText[index-1];
        resetP.fixPos();
    }

    requestAnimationFrame(() => {
        chEm.classList.add('addChar');
    });

    chEm.addEventListener('animationend', (event) => {
        if(coldSpan.style.visibility=='hidden'){
            coldSpan.textContent = character;
            console.log(coldSpan.textContent);
            coldSpan.style.visibility = 'visible';
            console.log('should become vsible by now!');
        }
        else{
            coldSpan.textContent+=character;
        }
        //console.log('REMOVE!!!!');
        chEm.remove();
    });

    coldSpan.after(chEm);//not self?

    if (sourceText.length-1 == index){
        //requestAnimationFrame(() => {
            storeCoordsSub(chEm, refEm, resetP);
            resetP.fixPos();
        //});
    }
    else{
         //requestAnimationFrame(() => {
            storeCoordsSub(chEm, refEm, resetP);
         //});
    }
    //setTimeout(() => {storeCoordsSub(chEm, resetP);}, 100);
}

function typeWriteAnim(element, resetP, sourceText){
    const resArr = interpArr(x => Math.sqrt(x), 10, 20, sourceText.length);
    for(let i=0, character=''; i<sourceText.length;i++){
        setTimeout(() => genCh(element.nextElementSibling,
            sourceText, i, resetP), resArr[i]*4000);
    }//console.log(resArr);
}

{
    const resetP = new undoRepos();
    //a note: a span with a space, or just p, depending on desired behaviour
    viewInteractManager(0.7, 'typeWrite',
        (element) => {
            element.textContent = 'K';

            const emOpacity = element.style.opacity;
            element.style.opacity = 0;

            const visibleEm = element.cloneNode(false);
            visibleEm.classList.remove('typeWrite');
            //visibleEm.style.position = 'static'; //'absolute';
            visibleEm.style.opacity = emOpacity;
            visibleEm.textContent = 'l';
            visibleEm.style.visibility = 'hidden';
            visibleEm.dataset.isColdSpan = 'true';

            element.after(visibleEm);

            // make the browser to position the character
            void visibleEm.offsetWidth; 
            storeCoordsSub(visibleEm, element, resetP);
        },
        (element) => {
            if (element.dataset.observed != '1'){
                element.dataset.observed = '1';
                typeWriteAnim(element, resetP, sourceText);
            }
        },
        () => {}
    );
}