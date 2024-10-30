import React, { useEffect, useState, useCallback, useRef } from 'react';
import './App.css';

const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

let timeSeconds = 30;
let totalInputs = 0;
let totalCorrectInputs = 0;
let netWPM = 0;
let rawWPM = 0;
let accuracy = 0;

let isControlHeld = false;

//list all possible words
const wordList = ["the", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "i", "with", "as", "not","on", "she", "at", "by", "this", "we", "you", "do", "but", "from", "or", "which", "one", "would","all", "will", "there", "say", "who", "make", "when","can", "more", "if", "no", "man", "out", "other","so", "what", "time", "up", "go", "about", "than","into", "could", "state", "only", "new", "year", "some", "take", "come", "these", "know", "see", "use", "get", "like", "then", "first", "any", "work","now", "may", "such", "give", "over", "think", "most","even", "find", "day", "also", "after", "way", "many", "must", "look", "before", "great", "back", "through", "long", "where", "much", "should", "well", "people", "down", "own", "just", "because", "good","each", "those", "feel", "seem", "how", "high", "too", "place", "little", "world", "very", "still","nation", "hand", "old", "life", "tell", "write", "become", "here", "show", "house", "both", "between", "need", "mean", "call", "develop", "under", "last", "right", "move", "thing", "general", "school", "never", "same", "another", "begin", "while", "number", "part", "turn", "real", "leave", "might", "want", "point", "form", "off", "child", "few", "small", "since", "against", "ask", "late", "home", "interest", "large", "person", "end", "open", "public", "follow", "during", "present", "without", "again", "hold", "govern", "around", "possible", "head", "consider", "word", "program", "problem", "however", "lead", "system", "set", "order", "eye", "plan", "run", "keep", "face", "fact", "group", "play", "stand", "increase", "early", "course", "change", "help", "line"];

shuffleArray(wordList);
let sampleTextArray = wordList.slice(0, 100); //return 40 random words from array and print to sampleTextArray

const App = () => {
  const [typedText, setTypedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeSeconds); // n seconds timer
  const sampleWordsRef = useRef(null);
  const [stats, setStats] = useState({ netWPM: 0, rawWPM: 0, accuracy: 0 });
  const [showStats, setShowStats] = useState(false);
  const [showInvalid, setShowInvalid] = useState(false);


  let sampleText = sampleTextArray.join(' ');

  const lowerCaseLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ';', ',', '.', "'", '"', '/', '\\', ':'];
  const upperCaseLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  const isValidKey = (key) => {
    return lowerCaseLetters.includes(key) || upperCaseLetters.includes(key); //check if a key input is valid
  };

  const handleFocus = () => {
    isControlHeld = false;
  }

  const reset = () => {
    fadeOutTypeArea();
    setTimeout(() => {
      shuffleArray(wordList);
      sampleTextArray = wordList.slice(0, 100);
      setTypedText('');
      setCurrentWordIndex(0);
      setTimerStarted(false);
      setTimeLeft(timeSeconds);
      setStats({ netWPM: 0, rawWPM: 0, accuracy: 0 });
      setShowStats(false);
      setShowInvalid(false);
      totalInputs = 0;
      totalCorrectInputs = 0;
      clearWordStyling();
      fadeInTypeArea()
    }, 200);

    const backgroundScreen = document.getElementById('backgroundScreen');
    if (backgroundScreen) {
      backgroundScreen.style.opacity = 0;
      backgroundScreen.style.zIndex = -1;
    }
  };


  const handleKeyPress = useCallback((event) => {
    const { key } = event;
    
    // Check if the timer has expired
    if (timeLeft === 0) {
      if (key === 'Enter') {
        reset();
      }
      return; // Exit the function early if the timer is up
    }

    if (!timerStarted) {
      setTimerStarted(true); //start timer on first input
    }

    if (key === 'Control') {
      isControlHeld = true;
    }
    if (!isControlHeld) {
      if (isValidKey(key) && typedText.length < 15) {
        setTypedText(prevText => prevText + key);
      } else if (key === ' ') {
        submitWord();
      } else if (key === 'Backspace') {
        setTypedText(prevText => prevText.slice(0, -1));
      } else if (key === 'Enter') {
        reset();
      }
    } else if (key === 'Backspace') {
      setTypedText('');
    }
  }, [timerStarted, typedText, timeLeft]);

  const handleKeyUp = useCallback((event) => {
    const { key } = event;
    if (key === 'Control') {
      isControlHeld = false;
    }
  }, []);

  const submitWord = () => {
    if (typedText !== '') {
      let word = typedText;
      let wordSpan = document.getElementById('sampleWord' + currentWordIndex);
      setTypedText(''); // Clear typed text after submitting
      if (word === sampleTextArray[currentWordIndex]) {
        wordSpan.style.color = 'white';
      } else {
        wordSpan.style.color = 'rgb(235, 79, 68)';
      }
      wordSpan.style.backgroundColor = 'transparent';
      
      totalInputs += (1+ word.length);
      totalCorrectInputs += correctChars(word, sampleTextArray[currentWordIndex])

      const isLineComplete = checkLineCompletion();
      setCurrentWordIndex(prevIndex => prevIndex + 1);

      if (isLineComplete) {
        sampleTextArray = sampleTextArray.slice(currentWordIndex + 1, sampleTextArray.length)
        sampleText = sampleTextArray.join(' ');
        clearWordStyling();
      }
    }
  };

  const checkLineCompletion = () => {
    const container = sampleWordsRef.current;
    if (!container) return false;

    const words = container.children;
    let currentWordTop = words[currentWordIndex].offsetTop;
    let nextWordTop = words[currentWordIndex + 1]?.offsetTop;

    // Check if it's the last word
    if (currentWordIndex === sampleTextArray.length - 1) {
      return true;
    }

    // Check if the next word is on a new line or if it's undefined (last word)
    return nextWordTop > currentWordTop || nextWordTop === undefined;
  };

  const clearWordStyling = () => {
    const words = document.querySelectorAll('.sampleWordSpan');
    words.forEach(word => {
      word.style.color = '#636770'; // Set the color for all words to grey
      word.style.backgroundColor = 'transparent';
    });
    setCurrentWordIndex(0);
    document.getElementById('sampleWord0').style.backgroundColor = '#20242b'
  };

  const fadeOutTypeArea = () => {
    document.getElementById('typing-container').style.opacity = 0;
  }
  const fadeInTypeArea = () => {
    document.getElementById('typing-container').style.opacity = 1;
  }

  // determine how many correct letters per word
  const correctChars = (word, correctWord) => {
    let wordString = word.split('');
    let correctWordString = correctWord.split('');
    let numCorrectCharacters = 1;
    for (let i = 0; i < correctWord.length; i++) {
      if (wordString[i] === correctWordString[i]) {
        numCorrectCharacters += 1;
      }
    };
    return numCorrectCharacters;
  };

  useEffect(() => {
    if (currentWordIndex < sampleTextArray.length) {
      const nextWord = document.getElementById('sampleWord' + currentWordIndex);
      if (nextWord) {
        nextWord.style.backgroundColor = '#20242b'; // set highlight for current word
      }
    }
  }, [currentWordIndex]);

  useEffect(() => { // add event listeners
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => { // countdown timer logic
    let timer;
    if (timerStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      // Calculate stats:
      totalCorrectInputs += (correctChars(typedText, sampleTextArray[currentWordIndex]) - 1)
      totalInputs += (typedText.length);
      console.log(correctChars(typedText, sampleTextArray[currentWordIndex]) - 1)
      rawWPM = (totalInputs/5)/(timeSeconds/60)
      netWPM = (totalCorrectInputs/5)/(timeSeconds/60)
      accuracy = (totalCorrectInputs/totalInputs)*100

      
      setStats({
        netWPM: Math.round(netWPM),
        rawWPM: Math.round(rawWPM),
        accuracy: (Math.round(accuracy * 10) / 10) //round to 1 decimal placef
      });
      if (accuracy < 25) {
        setShowInvalid(true)
      }
      setShowStats(true);

      // end screen:
      document.getElementById('backgroundScreen').style.opacity = 0.8;
      document.getElementById('backgroundScreen').style.zIndex = 2;
    }
    return () => clearInterval(timer);
  }, [timerStarted, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div>
      <div className='profileIcon' onClick={() => fadeOutTypeArea()}>Username</div>
<div className='backgroundScreen' id='backgroundScreen'>
  {showStats && (
    <div className='stats-container'>
      <div className='spacer'></div>
      {showInvalid && (
      <div className='stats, invalidText' id='invalidText'><text className='redText'>invalid</text> - <text className='yellowText, forty'>accuracy</text></div>
      )}

      <div className='stats'><text className='yellowText'>{stats.netWPM}</text> wpm</div>
      <div className='stats'><text className='yellowText'>{stats.rawWPM}</text> raw</div>
      <div className='stats'><text className='yellowText'>{stats.accuracy}%</text> acc</div>
      <div className='resetButton' onClick={() => reset()}>next test</div>
    </div>
  )}
</div>
    <div className="typing-container" id='typing-container'>
      <div className='timer' id='timer'>
        {formatTime(timeLeft)}
      </div>
      <div className="sample-words" ref={sampleWordsRef}>
        {sampleTextArray.map((word, index) => (
          <span key={index} id={`sampleWord${index}`} className='sampleWordSpan'>
            {word}{' '}
          </span>
        ))}
      </div>
      <br />
      <div className="typed-text">
        {typedText}<span className='cursor'>|</span>
      </div>
    </div>
    </div>
  );
};

export default App;