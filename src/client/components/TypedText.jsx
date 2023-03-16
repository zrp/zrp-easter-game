import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocalStorage } from "../hooks/storage";

const TYPE_SPEED = 1;

const getTextDynamicGroups = (text, onClick, interactive = false) => (text.match(/\$(.*?)\$/gmi) ?? []).map((word, index) => {
  try {
    const text = word.match(/\[(.*?)\]/mi)[1];
    const [ev, extra] = (word.match(/\((.*?)\)/)[1]).split(',');
    const token = `$${index}`;

    const children = text.split('').map(LetterToElement);

    let rendered = children;

    if (interactive) {
      rendered = <b className="text-blue-500 cursor-pointer word" onClick={() => onClick?.({ ev, text, extra })}>{children}</b>
    }

    return {
      word,
      token,
      rendered
    }
  } catch (err) {
    console.error(`Error parsing text`, { text, word });
  }
});

const LetterToElement = (letter, index) => {
  if (letter == '\n') {
    return '\n';
  } else {
    return <span key={index}>{letter}</span>;
  }
}

export default function TypedText(props = { text: "", animate: false, interactive: false }) {
  const ref = useRef(null);
  const { text, onClick, afterRender, animate, interactive, who, whoIs } = props;
  const [isAnimating, setIsAnimating] = useState(false);
  const [dense] = useLocalStorage('layout:dense', false);
  const [fontSizeSm] = useLocalStorage('layout:font-sm', false);
  const [typeSpeed] = useLocalStorage('layout:typeSpeed', 50);

  useEffect(() => {
    if (!ref.current) return;

    const letters = ref.current.querySelectorAll('span:not(.word)');

    if (animate) {
      if (isAnimating) return;

      setIsAnimating(true);

      letters?.forEach((letter, index) => {
        letter.style.display = 'none';

        setTimeout(() => letter.style.display = 'inline', (index + 1) * typeSpeed);
      });
      setTimeout(() => {
        afterRender?.();
        setIsAnimating(false);
      }, (letters.length + 1) * typeSpeed)
    } else {
      letters.forEach(l => l.style.display = 'inline');

      afterRender?.();
    }

    ref.current.style.opacity = 1;
  }, [ref.current, animate]);

  // Creates a copy of the original text
  let newText = text;

  // Finds dynamic groups in text
  const dynamicGroups = getTextDynamicGroups(text, onClick, interactive);

  // Replace dynamic groups with tokens
  for (const group of dynamicGroups) {
    newText = newText.replace(group.word, group.token);
  }

  const onWhoClick = who && who.showName ? (e) => {
    e.preventDefaul();
    if (who) whoIs?.(who?.id)
  } : null;

  // Rewrite text into spans
  newText = newText.split('\n').map((line, index) => {
    return <div key={`line-${index}`} className="line w-full flex flex-wrap pb-2">
      {line.split(' ').map((_text, index) => {
        let text = _text;

        // text that starts with $ is a token of a group, so we must used the rendered group
        if (_text.startsWith('$')) {
          const token = _text.match(/\$(\d*)/gmi)[0]

          const group = dynamicGroups.find(group => group.token == token);

          text = text.replace(token, group?.rendered);

          // We replace the _text twice because some characters
          // may appear after the token, like , and ?
          return <span key={index} className="mr-2 word flex flex-wrap">
            {group.rendered}
            {_text.replace(token, '').split('').map(LetterToElement)}
          </span>;
        } else {
          // else if text does not start with $ it's just a common word,
          // so we just split each letter into spans
          return <span key={index} className="mr-2 word flex flex-wrap">
            {text.split('').map(LetterToElement)}
          </span>;
        }
      })}
    </div>;
  });

  return <div className={`flex ${fontSizeSm ? 'text-base' : ''} ${dense ? 'p-0 mb-4' : 'p-3 mb-6 bg-black bg-opacity-20 rounded-xl'}`}>
    <span onClick={onWhoClick} className={`mr-4 h-full ${who ? 'cursor-pointer' : ''}`}>
      <b className={who?.color}>{who && who.showName ? who.name + ":" : ">"}</b>
    </span>
    <div className={`flex flex-wrap opacity-0 flex-grow`} ref={ref}>{newText}</div>
  </div>
}
