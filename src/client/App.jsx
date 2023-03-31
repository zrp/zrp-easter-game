import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'

import TypedText from './components/TypedText';
import Modal from './components/Modal';
import SideView from './components/SideView';

// UI
// import uiSound from './assets/sounds/ui/wind1.wav';
import alertSvg from './assets/icons/alert.svg';
import zrpSvg from './assets/icons/zrp.svg';
import compass from './assets/icons/compass.png';

// rxjs
import { of, fromEvent, Observable, Subscriber } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, pairwise, skipWhile, tap } from 'rxjs/operators';

// Services
import socket from './services/socket';
import shortcuts from './services/shortcuts';
import _ from 'lodash';

import ResizeObserver from 'resize-observer-polyfill';
import { useLocalStorage } from './hooks/storage';

function resizeObserver(...elements) {
  return new Observable((subscriber) => {
    const resizeObserver = new ResizeObserver(
      (entries) => subscriber.next(entries)
    );

    elements.forEach(elem => resizeObserver.observe(elem));

    return () => resizeObserver.disconnect();
  });
}


function App({ onLoaded } = { onLoaded: async () => { } }) {
  const [isConnected, setIsConnected] = useState(socket.connected);

  const [modalOpen, setModalOpen] = useState(false);
  const [sideViewOpen, setSideViewOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState();
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState({ message: '', timeout: null });
  const [rendering, setRendering] = useState(false);
  const [world, setWorld] = useState([]);
  const [worldQueue, setWorldQueue] = useState([]);
  const [location, setLocation] = useState('');
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [shortcut, setShortcut] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const [showWindRoses] = useLocalStorage('layout:windRoses', false);

  // Refs
  const terminalRef = useRef(null);
  const typingRef = useRef(null);
  const promptInputRef = useRef(null);
  const uiSoundRef = useRef(null);

  const loadingEffect = () => {
    const interval = setInterval(() => {
      if (!typingRef.current) return;

      const htmlEl = typingRef.current;
      const span = htmlEl.getElementsByTagName('span')[0];

      if (span.innerHTML == '...') {
        span.innerHTML = '';
      } else {
        span.innerHTML += '.';
      }

    }, 500)

    return () => clearInterval(interval);
  }

  const onTipClick = ({ ev, text, extra }) => {
    switch (ev) {
      case "ui:who_is":
        whoIs(extra);
        break;
      case "ui:tip":
        tip(extra);
        break;
      default:
        socket.emit(ev);
    }
  }

  const tip = (name) => {
    socket.io.emit('ui:tip', { name });
  }

  const whoIs = (id) => {
    socket.io.emit(`ui:who_is`, { id });
  }

  const scrollToBottom = (animate = true) => {
    if (!document.getElementById('root')) return;

    const root = document.getElementById('root');

    root.scrollTo({ left: 0, top: root.scrollHeight + 400, behavior: animate ? 'smooth' : 'auto' });
  }

  const handleChange = (ev) => {
    setPrompt(ev.target.value);

    ev.preventDefault();
    ev.stopPropagation();
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    if (prompt == '') return;

    try {
      const response = await socket.io.timeout(30000).emitWithAck('prompt', { prompt });
      console.log(`received ${response}`);
    } catch (err) {
      console.error(`server did not ack`, err);
    }

    setPrompt('');

    promptInputRef.current?.focus();
    scrollToBottom();
  }

  const handleShortcut = (key) => {
    {
      const next = shortcuts.getShortcut(key);

      if (!next) return;

      const isOpen = (next.mode == 'Modal' && modalOpen || next.mode == 'SideView' && sideViewOpen);


      if (shortcut?.name == next.name && isOpen) {
        console.log(`Shortcut "${shortcut?.name}" was already open, closing...`);

        setSideViewOpen(false);
        setModalOpen(false);
        setShortcut(null);
        return;
      }

      console.log(`Shortcut was "${shortcut?.name ?? "(empty)"}", going to "${next.name}"`);

      setShortcut(next);

      if (next.mode == 'SideView') setSideViewOpen(true);
      if (next.mode == 'Modal') setModalOpen(true);
    }
  }

  const onAnswerSubmit = async (ev) => {
    ev.preventDefault();

    if (answer == '') return;

    try {
      const response = await socket.io.timeout(30000).emitWithAck('game:challenge-response', { answer });
      console.log(`received ${response}`);
    } catch (err) {
      console.error(`server did not ack`, err);
    }

    setQuestion(null);
    setAnswer(null);

    promptInputRef.current?.focus();
    scrollToBottom();
  }

  // Initial effects
  useEffect(() => {
    const cancelConnect = socket.onConnect(() => setIsConnected(true));

    const cancelDisconnect = socket.onDisconnect(() => setIsConnected(false));

    const cancelGameLoaded = socket.onGameLoaded(async ({ user, world }) => {
      onLoaded().finally(() => {
        setUser(user);
        setWorld(world);
        promptInputRef?.current?.focus();
      });
    });

    const cancelUsersUpdated = socket.onUsersUpdated(setUsers)
    const cancelLocationChange = socket.onLocationChange(setLocation)
    const cancelChallenge = socket.onChallenge(q => {
      setQuestion({ ...q, options: _.shuffle(q.options) });
    });

    const cancelLoadingEffect = loadingEffect();


    return () => {
      cancelConnect();
      cancelChallenge();
      cancelDisconnect();
      cancelGameLoaded();
      cancelUsersUpdated();
      cancelLoadingEffect();
      cancelLocationChange();
    };
  }, [])

  useEffect(() => {
    if (!terminalRef.current) return;

    let resizing = false;

    const resizing$ = fromEvent(window, 'resize').pipe(
      debounceTime(10),
      map(() => ({ w: window.innerWidth, h: window.innerHeight })),
      pairwise(),
      map(([prev, curr]) => prev.w !== curr.w || prev.h !== curr.h),
      debounceTime(100),
    ).subscribe(val => {
      console.log(`Detected window is ${val ? 'not ' : ''}resizing`);
      resizing = val;
    });

    const resize$ = resizeObserver(terminalRef.current).pipe(
      map(() => terminalRef.current?.scrollHeight),
      skipWhile(() => resizing),
      distinctUntilChanged(),
      tap(y => console.log(`New scroll height: ${y}`)),
      map(() => true)
    ).subscribe(scrollToBottom);

    return () => {
      resizing$.unsubscribe();

      resize$.unsubscribe();
    }
  }, [terminalRef.current])

  // Shortcut Effects
  useEffect(() => {
    const cancelShortcuts = shortcuts.onShortcutChange(({ key }) => handleShortcut(key));

    return () => {
      cancelShortcuts();
    }
  }, [shortcut, modalOpen, sideViewOpen])


  // Game response effects
  useEffect(() => {
    const cancelGameEvent = socket.onGameEvent((add) => {
      console.log(`Buffer:`, add);
      let nextWorld = [...worldQueue, ...add];

      nextWorld = add.map((v, index) => {
        v.afterRender = () => {
          setWorldQueue(nextWorld.slice(index + 1));
        };
        return v;
      });

      setWorldQueue(nextWorld);
      scrollToBottom();
    })

    return () => {
      cancelGameEvent();
    }
  }, [worldQueue]);

  useEffect(() => {
    const cancelGameError = socket.onGameError(({ message }) => {
      if (error?.timeout) clearTimeout(error?.timeout);

      const timeout = setTimeout(() => setError({ message: '', timeout: null }), 3000);
      setError({ message, timeout });
    });

    return () => {
      cancelGameError();
    }
  }, [error])

  useLayoutEffect(() => {
    const addToWorld = (next, afterRender) => {
      const newWorld = [...world, {
        ...next, afterRender,
      }];

      setWorld(newWorld);
      scrollToBottom();
    };

    scrollToBottom(false);
    promptInputRef?.current?.focus();

    if (worldQueue.length == 0 || rendering) {
      return;
    };

    setRendering(true);

    const [next, ...nextWorldQueue] = worldQueue;

    setWorldQueue(nextWorldQueue);

    addToWorld(next, () => {
      setRendering(false);
    })


    return () => {
    }
  }, [world, worldQueue, rendering])

  // useEffect(() => {
  //   if (!uiSoundRef.current) retur     n;

  //   uiSoundRef.current.play();

  // }, [uiSoundRef])

  return <>
    {/* <audio src={uiSound} ref={uiSoundRef}></audio> */}
    <div className="text-xl w-full h-full relative font-mono mx-auto">
      <div id="game" className='w-full h-100 flex flex-col min-h-full top-0 left-0 text-white bg-gray-900'>
        <nav className='text-base  sticky top-0 z-50 bg-gray-900'>
          <div className="w-full h-12 flex border-b border-gray-700 items-center justify-around">
            <div className="text-center h-full mr-auto items-center justify-center ml-2 text hidden md:flex">
              <img src={zrpSvg} className='h-full w-full p-3'></img>
            </div>
            <div className="flex h-full ml-auto">
              <button onClick={() => handleShortcut('Z')} className='relative px-3 my-2 mx-2 flex text-center bg-black rounded-xl  items-center justify-center hover:bg-orange-400 hover:text-black'>
                <div className='relative flex items-center justify-center'>
                  <span className='z-10 relative'>ZRP</span>
                  <span className="text-xs px-2 py-1 mx-2 hidden md:flex rounded-xl bg-black text-white tracking-tighter">Ctrl + Z</span>
                  <span className={`absolute right-0 top-0 transform-gpu translate-x-0 h-3 translate-y-1 w-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-orange-400'}`}></span>
                </div>
              </button>

              <button onClick={() => handleShortcut(',')} className='px-3 my-2 mx-2 flex text-center bg-black rounded-xl  items-center justify-center hover:bg-gray-300 hover:text-black'>
                Configurações <span className="text-xs px-2 py-1 mx-2 hidden md:flex rounded-xl bg-black text-white tracking-tighter">Ctrl + ,</span>
              </button>
            </div>
          </div>


          <nav className='w-full text-base h-8 flex border-b border-gray-700 items-center justify-between bg-gray-900'>
            <span className='ml-4 text-base font-medium font-mono text-gray-400'>{location}</span>
            <div className="flex h-full ml-auto">
              <button onClick={() => handleShortcut('I')} className='px-3 h-full flex text-center border-l border-l-gray-700 items-center justify-center hover:bg-pink-400 hover:text-black'>
                Inventário <span className="text-xs px-2 py-1 mx-2 hidden md:flex rounded-xl bg-black text-white tracking-tighter">Ctrl + I</span>
              </button>
              <button onClick={() => handleShortcut('P')} className='px-3 h-full flex text-center border-l border-l-gray-700 items-center justify-center hover:bg-yellow-400 hover:text-black'>
                Progresso <span className="text-xs px-2 py-1 mx-2 hidden md:flex rounded-xl bg-black text-white tracking-tighter">Ctrl + P</span>
              </button>
            </div>
          </nav>
        </nav>

        {showWindRoses ? <img src={compass} className='w-32 h-32 fixed right-8 top-24 z-50 invert' /> : <></>}


        <div id="terminal" ref={terminalRef} className='p-4 min-h-full flex-grow relative cursor-pointer' onClick={() => promptInputRef?.current?.focus()} disabled={question}>
          {world.map((prompt, index) => {
            if (!prompt) return;

            return <TypedText
              key={index}
              text={prompt.prompt}
              onClick={onTipClick}
              animate={prompt.animate}
              interactive={prompt.interactive}
              who={prompt.who}
              whoIs={whoIs}
              afterRender={prompt?.afterRender}
            />
          })}
          {!rendering && !question ? <form onSubmit={handleSubmit} className='h-12 bg-gray-900 sticky bottom-0 z-50 left-0 w-full flex items-center justify-center'>
            <span className="flex mr-4 h-full items-center ml-0"><b className="text-orange-400">&gt;</b></span>
            <input ref={promptInputRef} type="text" name="prompt" value={prompt} onChange={handleChange} disabled={worldQueue.length > 0} className="w-full bg-transparent font-mono text-white outline-none" />
            <button type="submit" className='sr-only'></button>
          </form> : <></>}
          {question ?
            <form className='p-4 bg-blue-500 bg-opacity-10 rounded-xl' noValidate autoComplete='off' onSubmit={onAnswerSubmit}>
              <h1 className="text-xl mb-4">{question.question}</h1>
              <ul>
                {question.options.map((option) => {
                  return <li class="w-full border-gray-200 rounded-t-lg dark:border-gray-600">
                    <div class="flex items-center ml-1">
                      <input type="checkbox" value={option} checked={answer == option} onChange={(e) => setAnswer(e.target.value)} name="answer" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 " />
                      <label for="vue-checkbox" class="w-full py-3 ml-3 text-lg font-medium text-gray-200">{option}</label>
                    </div>
                  </li>
                })}
              </ul>
              <button className={`text-sm font-medium text-center bg-black py-3 px-8 rounded-xl mt-4 mb-4 ${answer ? 'hover:bg-green-400 hover:text-black' : 'opacity-25'}`} disabled={!answer}>
                Validar resposta
              </button>
            </form>
            : <></>}
        </div>

        {worldQueue.length > 0 && rendering ? <div ref={typingRef} className='text-xs ml-4 mb-2 bg-gray-900 text-gray-100 rounded-md w-24 text-left p-1 px-2 '>Digitando<span></span></div> : <></>}

        <div className={`z-50 flex items-top transition-all fixed p-4 rounded-xl bg-red-500 w-2/5 top-20 mt-2 right-4 ${error?.message == '' ? '-translate-y-40' : 'translate-y-0'}`}>
          <img src={alertSvg} className='w-6 h-6 mr-4' />
          <p className='text-sm'>{error?.message}</p>
        </div>



        {
          shortcut?.mode ? (
            shortcut?.mode == 'Modal' ?
              <Modal open={modalOpen} onClose={() => setModalOpen(false)} {...shortcut.extraProps}>
                {shortcut.render({ socket, user, users })}
              </Modal>
              : <SideView open={sideViewOpen} onClose={() => setSideViewOpen(false)} {...shortcut.extraProps}>
                {shortcut.render({ socket, user, users })}
              </SideView>
          ) : <></>
        }
      </div>
    </div >
  </>
}

export default App
