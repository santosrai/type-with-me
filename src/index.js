import { writelines,readLine, clearTerminal, chooseOption,removeTerminalCursor} from "./terminal"

import { typeCode, clearEditor } from "./editor"

import { repoOptions} from "../data"


const separatorLine = "------------------------------------"


const checkPrompt = ()=>{
    return false
}

const showResult = async (result) => {
    const errors = result.totalCharacters - result.correctCharacters;
    const accuracy = result.totalCharacters > 0 ?
        (result.correctCharacters / result.totalCharacters) * 100
        : 0
    const correctCharPerMin = (result.correctCharacters / result.totalTime) * 1000 * 60;
    const lines = [
        "Result",
        separatorLine,
        result.reachedTheEnd ? "You have completed all" : "Time out",
        `Correct Characters per minute: ${correctCharPerMin.toFixed(2)}`,
        `Total Errors : ${errors > 0 ? errors : "No errors"}`,
        `Accuracy : ${accuracy.toFixed(2)}%`,
        " ",
        separatorLine,
        "Do you want to play again? (y , n)",
        " "

    ]
    await writelines(lines);
}

const promptTyping = async (repo, typingCode) => {
    clearTerminal();

    const promptLines = [
        `You have selected ${repo.label}`,
        `Repo: ${repo.url}`,
        `File: ${repo.url}`,
        " ",
        "When you are ready, start typing",
        separatorLine,
        " ",
    ]

    await writelines(promptLines);
}

const playGame = async () => {

    let round = 1;
    let playAgain = true;

    const lines = [
        "Please select to practice:",
        " "
    ]

    while(playAgain) {

        clearTerminal();
       // clearEditor();
        
        await writelines(lines);

        const repo = await chooseOption(repoOptions)

        const typingCode = repo.files[Math.floor(Math.random() * repo.files.length)]

        await promptTyping(repo)
        removeTerminalCursor()

        const result = await typeCode(typingCode.code);
        
        clearEditor()
        clearTerminal();
        await showResult(result)
        playAgain = (await readLine()) === "y"
        round++

    }

}

playGame();