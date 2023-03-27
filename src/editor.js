import { backspaceKey, enterKey, tabKey } from "./keyboard"

const editorElm = document.getElementById("editor")
const statusElm = document.getElementById("stats")


const whitespaceRegex = /\s/;
const cursorClassName = "cursor"
const nextClassName = "next"
const wrongClassName = "wrong"
const typingTotalTime = 45000;
const linesPerPage = 3;


const separatorLine = "------------------------------------------------";


const printCode = (lines) => {
    editorElm.innerHTML = "";
    
    let index = 0;

    for (const line of lines) {
        for (const  character of line){
            const span = document.createElement("SPAN")
            span.innerText = character
        
            if (index > 0) {
                span.classList.add("next")
            }
            if (whitespaceRegex.test(character)){
                span.setAttribute("data-whitespace","true")
            }
            editorElm.appendChild(span);
            index++;
        }

            editorElm.appendChild(document.createElement("br"));
    }

    const firstElement = editorElm.firstChild;
    firstElement.classList.add(cursorClassName);

    return firstElement;
}


const normalizeCode = (code) => {
    return code.replace(/\t/g,"  ");
}

const printStatus = (result) => {

    const secondsLeft = ((typingTotalTime - result.totalTime)/1000).toFixed(0)
    statusElm.innerHTML = [
        "",
        separatorLine,
         `Time left: ${secondsLeft} seconds`,
         `Character typed : ${result.totalCharacters}`,
         `Errors : ${result.totalCharacters - result.correctCharacters}`
    ].join("<br/>")

}

export const clearEditor = () => {
    editorElm.innerHTML = ""
    statusElm.innerHTML = ""
}


export const typeCode = (code) =>{

    code = normalizeCode(code)
    
    return new Promise(async (resolve) => {
        let firstLineIndex = 0
        let lineIndex = 0;
        let startTime = 0;
        let timeoutHandle = 0;
        let statsIntervalHandle = 0;
        let correctCharacters = 0;
        let totalCharacters = 0;

        let lineCorrectness = [];

        const allLines = code.split(/[ \t]*\r?\n/)
                .filter(l => l.trim().length > 0)
                .map(l => l + " ");


        let pageLines = allLines.slice(firstLineIndex, linesPerPage);
        let line = pageLines[lineIndex];
        let element = printCode(pageLines);
        let charIndex = 0;

        const beginTyping = () => {
            startTime = new Date().valueOf();
            timeoutHandle = setTimeout(endTyping, typingTotalTime)
            statsIntervalHandle = setInterval(() => printStatus(getResult(), 1000)); 
        }

        const getResult = () => {

            const now = new Date().valueOf()
            const totalTime = now - startTime

            return {
                totalCharacters: totalCharacters,
                correctCharacters: correctCharacters,
                reachedTheEnd: totalTime <= startTime,
                totalTime: totalTime,
            }
        }

        const changeColor = (isCorrect) => {
            element.classList.remove(cursorClassName)
            if (!isCorrect) element.classList.add(wrongClassName);
            element = element.nextElementSibling

            element.classList.remove(nextClassName)
            element.classList.add(cursorClassName)
            lineCorrectness.push(isCorrect)
            charIndex++
        }

        const backspaceHandler = () => {
            element.classList.remove(cursorClassName)
            element.classList.add(nextClassName)
            element = element.previousElementSibling
            element.classList.remove(wrongClassName)
            element.classList.add(cursorClassName);
        
            charIndex--;
            if (lineCorrectness[charIndex]){
                correctCharacters--
            }
            lineCorrectness = lineCorrectness.splice(0,-1)

        }

        const enterKeyHandler =() => {
            line = pageLines[++lineIndex];
            charIndex = 0
            element.classList.remove(cursorClassName);
            element = element.nextElementSibling?.nextElementSibling
            element.classList.remove(nextClassName);
            handleWhiteSpace()

            
        }

        const handleWhiteSpace = () => {
            let count = 0;
            while(charIndex + count < line.length - 1 && whitespaceRegex.test(line[charIndex + count])){
                changeColor(true)
            }
        }

        const moveToNextPage = ()=> {
            firstLineIndex += pageLines.length;
            pageLines = allLines.slice(firstLineIndex , firstLineIndex + linesPerPage);
            lineIndex = 0;
            charIndex = 0;
            line = pageLines[lineIndex]
            element = printCode(pageLines)
            handleWhiteSpace();
        }

        const processKey = (key) =>{
            console.log(key.length)
            
            // only one key at time
            // need to fix space which key is ' '
            if (key.length === 1 && charIndex < line.length -1) {
                if (startTime === 0) beginTyping();
                const isCorrect = key === line[charIndex];

                changeColor(isCorrect)
                correctCharacters += isCorrect ? 1 : 0 
                totalCharacters++

                if (charIndex === line.length -1 && lineIndex === pageLines.length -1) {
                    if (firstLineIndex < allLines.length -1){
                        moveToNextPage()
                    } else {
                        endTyping();
                    }
                }
                
            }

            else if (charIndex > 0 && key === backspaceKey) {
                console.log("backspace handle")
                backspaceHandler()
            }

            else if (charIndex === line.length -1 && key === enterKey ){
               totalCharacters++
               correctCharacters++
               if(lineIndex < pageLines.length -1) {
                enterKeyHandler()
               }
            }
            else {
                return;
            }

            printStatus(getResult());
        }

        const listener = (event) => {
            const key = event.key
            if (key === tabKey) {
                processKey(" ");
                processKey(" ")
                event.preventDefault();
                event.stopPropagation()

            } else {
                processKey(key)
            }
            
        }

        const endTyping = () => {
            document.removeEventListener("keydown", listener)
            clearTimeout(timeoutHandle);
            clearInterval(statsIntervalHandle);
            resolve(getResult())
        }

        document.addEventListener("keydown", listener)

    }); //return
};

