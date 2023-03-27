import { repoOptions } from "../data"
import { backspaceKey, enterKey } from "./keyboard"

const terminalElm = document.getElementById("terminal")
const cursorElem = document.getElementById("cursor")
const typingdelay = 20

const inputRegex = /^[\w\d ]$/

const removeLastChar = () => {
  terminalElm.removeChild(cursorElem);
  const last = terminalElm.lastChild
  if (last) terminalElm.removeChild(last)
  terminalElm.appendChild(cursorElem)
}

export const readLine = () => {
    return new Promise( resolve => {
      let line = ""

      const listener = (event) => {
        const key = event.key
        if ( inputRegex.test(key)){
          line += key;
          writeChar(key)
          } else if (key === enterKey && line .length > 0 ) {
            document.removeEventListener("keydown",listener);
            resolve(line)
          // TODO: need to fix for backspaceke
          } else if (key === backspaceKey && line.length > 0 ){
            event.preventDefault();
            line = line.slice(line.length - 1);
            removeLastChar();
          }
        }
      
      writeSingleLines("$ ")
      document.addEventListener("keydown", listener)

    })
  }

export const removeTerminalCursor = () => {
  if ( cursorElem.parentElement === terminalElm) {
    terminalElm.removeChild(cursorElem)
  }
}

export const chooseOption = async (repoOptions) => {
    await writelines( [...repoOptions.map((opt, index) => `${index + 1}. ${opt.label}` , " "
   
    )])

    let index = -1;

    // continues loop for incorrect options
    while (index === -1 ){
    const selectedNumber = parseInt(await readLine());

    if (selectedNumber >0 && selectedNumber <= repoOptions.length){
       index = selectedNumber-1
    } else {
      // TODO: write error logs
      await writelines( [
        " ",
        " Please choose the given number"

      ])
    }
  }
    return repoOptions[index]
}


export const  writelines = async (lines) => {

  for ( const line of lines) {
    await writeSingleLines(line)
    terminalElm.appendChild(document.createElement("br"))
  }

  terminalElm.appendChild(cursorElem)

}



const writeSingleLines = (line) => {
    return new Promise((resolve)=>{
      let index = 0;
      const interval = setInterval(() => {
        writeChar(line[index++])
        if (index === line.length){
          clearInterval(interval)
          resolve()
        }
      },typingdelay)
   
  })
}

const writeChar = (char) => {
  const span = document.createElement("SPAN");
  span.textContent= char;
  terminalElm.appendChild(span);
  terminalElm.appendChild(cursorElem);
  terminalElm.scrollTop = terminalElm.scrollHeight
}

export const clearTerminal = () => {
    terminalElm.innerHTML = ""
}
