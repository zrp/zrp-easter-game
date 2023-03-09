import { useEffect, useRef, useState } from "react";

const TYPE_SPEED = 50;

const getTextDynamicGroups = (text, onClick, interactive = false) => (text.match(/\$(.*?)\$/gmi) ?? []).map((word, index) => {
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

  useEffect(() => {
    if (!ref.current) return;

    const letters = ref.current.querySelectorAll('span:not(.word)');

    if (animate) {
      if (isAnimating) return;

      setIsAnimating(true);

      letters?.forEach((letter, index) => {
        letter.style.display = 'none';

        setTimeout(() => letter.style.display = 'inline', (index + 1) * TYPE_SPEED);
      });
      setTimeout(() => {
        afterRender?.();
        setIsAnimating(false);
      }, (letters.length + 1) * TYPE_SPEED)
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

  // Rewrite text into spans
  newText = newText.split(' ').map((_text, index) => {
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
  });

  return (
    <div className="flex mb-6">
      <span onClick={() => { who && whoIs?.(who?.id) }} className={`mr-4 h-full ${who ? 'cursor-pointer' : ''}`}>
        <b className={who?.color ?? "text-pink-400"}>{who?.name ? who.name + ":" : ">"}</b>
      </span>
      <div className={`flex flex-wrap opacity-0`} ref={ref}>{newText}</div>
    </div>
  )
}
