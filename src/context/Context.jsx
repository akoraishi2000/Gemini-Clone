import { createContext, useState } from "react";
import run from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  const delayPara = (index, nextWord) => {
    setTimeout(() => {
      setResultData((prev) => prev + nextWord);
    }, 10 * index);
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
  };

  const processResponse = async (prompt) => {
    const response = await run(prompt);
    let responseArray = response.split("**");
    let newResponse = [];

    for (let i = 0; i < responseArray.length; i++) {
      if (i % 2 === 1) {
        newResponse.push("<b>" + responseArray[i] + "</b>");
      } else {
        newResponse.push(responseArray[i]);
      }
    }

    let newResponseString = newResponse.join("");
    newResponseString = newResponseString.split("*").join("<br>");

    let newResponseArray = newResponseString.split("");
    for (let i = 0; i < newResponseArray.length; i++) {
      const nextWord = newResponseArray[i];
      delayPara(i, nextWord);
    }
  };

  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);

    let finalPrompt;
    if (prompt !== undefined) {
      finalPrompt = prompt;
      setRecentPrompt(prompt);
    } else {
      setPrevPrompts((prev) => [...prev, input]);
      finalPrompt = input;
      setRecentPrompt(input);
    }

    await processResponse(finalPrompt);
    setLoading(false);
    setInput("");
  };

  const handleRecentPromptClick = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);
    setRecentPrompt(prompt);
    await processResponse(prompt);
    setLoading(false);
  };

  const contextValues = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    handleRecentPromptClick,
    newChat,
  };

  return (
    <Context.Provider value={contextValues}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
