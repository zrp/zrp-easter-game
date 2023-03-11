import { useEffect, useRef, useState } from 'react'

import TypedText from './components/TypedText';
import Modal from './components/Modal';
import SideView from './components/SideView';

// Pages
import ZRP from './pages/ZRP';
import Settings from './pages/Settings';

// UI
import uiSound from './assets/sounds/ui/wind1.wav';
import sendSvg from './assets/send.svg';
import alertSvg from './assets/alert.svg';

// rxjs
import { of, fromEvent, from } from 'rxjs';
import { bufferTime, filter, switchMap, tap, map, buffer } from 'rxjs/operators';

// Services
import socket from './socket';
import _ from 'lodash';

const Shortcuts = {
  "Z": {
    name: "ZRP",
    render: (props) => <ZRP {...props}></ZRP>,
    mode: "SideView",
    extraProps: {}
  },
  "P": {
    name: "Progresso",
    render: (props) => <Settings {...props}></Settings>,
    mode: "SideView",
    extraProps: {}
  },
  "M": {
    name: "Mapa",
    render: (props) => <Settings {...props}></Settings>,
    mode: "Modal",
    extraProps: {}
  },
  ",": {
    name: "Configurações",
    render: (props) => <Settings {...props}></Settings>,
    mode: "SideView",
    extraProps: {}
  },
}


function App({ onLoaded } = { onLoaded: async () => { } }) {
  const [isConnected, setIsConnected] = useState(socket.connected);

  const [qModalOpen, setQModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sideViewOpen, setSideViewOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState();
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState({ message: '', timeout: null });
  const [rendering, setRendering] = useState(false);
  const [world, setWorld] = useState([]);
  const [worldQueue, setWorldQueue] = useState([]);

  const [shortcut, setShortcut] = useState(null);

  // Refs
  const terminalRef = useRef(null);
  const typingRef = useRef(null);
  const promptInputRef = useRef(null);
  const uiSoundRef = useRef(null);

  const typingEffect = () => {
    return setInterval(() => {
      if (!typingRef.current) return;

      const htmlEl = typingRef.current;
      const span = htmlEl.getElementsByTagName('span')[0];

      if (span.innerHTML == '...') {
        span.innerHTML = '';
      } else {
        span.innerHTML += '.';
      }

    }, 500)
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
    socket.emit('ui:tip', { name });
  }

  const whoIs = (id) => {
    socket.emit(`ui:who_is`, { id });
  }

  const scrollToBottom = (animate = true) => {
    if (!document.getElementById('root')) return;

    const root = document.getElementById('root');

    root.scrollTo({ left: 0, top: root.scrollHeight + 100, behavior: animate ? 'smooth' : 'auto' });
  }

  const handleShortcut = (ev) => {
    const key = ev.key.toUpperCase();

    const nextShortcut = Shortcuts[key]

    if (!nextShortcut) return;

    if (!ev.ctrlKey) return;

    ev.preventDefault();

    const isOpen = (nextShortcut.mode == 'Modal' && modalOpen || nextShortcut.mode == 'SideView' && sideViewOpen);

    if (shortcut?.name == nextShortcut.name && isOpen) {
      setSideViewOpen(false);
      setModalOpen(false);
      setShortcut(null);
    } else {
      openView(nextShortcut);
    };
  };

  const handleChange = (ev) => {
    setPrompt(ev.target.value);

    ev.preventDefault();
    ev.stopPropagation();
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    if (prompt == '') return;

    try {
      const response = await socket.timeout(15000).emitWithAck('prompt', { prompt });
      console.log(`received ${response}`);
    } catch (err) {
      console.error(`server did not ack`, err);
    }

    setPrompt('');

    promptInputRef.current?.focus();
    scrollToBottom();
  }

  const openView = (shortcut) => {
    setShortcut(shortcut);

    if (shortcut.mode == 'SideView') {
      setSideViewOpen(true);
    }

    if (shortcut.mode == 'Modal') {
      setModalOpen(true);
    }
  }

  // Initial socket effects
  useEffect(() => {
    socket.on('connect', () => {
      console.log(`connected to socket id ${socket.id}`)
      socket.emit('game:start');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('game:loaded', async (data) => {
      setIsConnected(true);

      console.log(`Game loaded with data`, data)

      const { user, world } = data;

      setUser(user);
      setWorld(world);

      await onLoaded();
    });

    socket.on('ui:user_list', (users) => {
      setUsers(users);
    })

    const interval = typingEffect();

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('game:loaded');
      socket.off('ui:user_list');
      clearInterval(interval);
    };
  }, [])

  // Shortcut effects
  useEffect(() => {
    window.addEventListener('keydown', handleShortcut)

    return () => {
      window.removeEventListener('keydown', handleShortcut);
    }
  }, [sideViewOpen, modalOpen, shortcut])

  // Game response effects
  useEffect(() => {
    const sub$ = of(socket).pipe(
      switchMap(socket => fromEvent(socket, 'game:response')),
      switchMap(([data, callback]) => {
        callback("SYN_CLIENT");
        return of(data);
      }),
      tap(data => {
        if (data.error) {
          if (error?.timeout) clearTimeout(error?.timeout);

          const { message } = data.error;

          const timeout = setTimeout(() => setError({ message: '', timeout: null }), 3000);
          setError({ message, timeout });
        }
      }),
      filter(data => !!data?.worldAdd?.prompt),
      map(data => data.worldAdd),
    ).subscribe((data) => {
      console.log(`Appending data to world`, data);
      setWorld([...world, data]);
      scrollToBottom();
    });

    return () => {
      sub$.unsubscribe();
    }
  }, [error, world]);

  // useEffect(() => {
  //   const addToWorld = (next, afterRender) => {
  //     const newWorld = [...world, {
  //       ...next, afterRender,
  //     }];

  //     setWorld(newWorld);
  //     scrollToBottom();
  //   };

  //   scrollToBottom(false);


  //   if (worldQueue.length == 0) {
  //     promptInputRef?.current?.focus();
  //   }

  //   if (worldQueue.length == 0 || rendering) {
  //     return;
  //   };

  //   setRendering(true);

  //   const [next, ...nextWorldQueue] = worldQueue;

  //   setWorldQueue(nextWorldQueue);

  //   addToWorld(next, () => {
  //     setRendering(false);
  //   })


  //   return () => {
  //   }
  // }, [world, worldQueue, rendering])

  // useEffect(() => {
  //   if (!uiSoundRef.current) retur     n;

  //   uiSoundRef.current.play();

  // }, [uiSoundRef])

  return <>
    {/* <audio src={uiSound} ref={uiSoundRef}></audio> */}
    <div className="text-xl w-full h-full relative font-mono mx-auto">
      <div id="game" className='w-full h-100 flex flex-col min-h-full top-0 left-0 text-white bg-gray-900'>
        <nav className='w-full h-10 flex border-b border-gray-50 items-center justify-around sticky top-0 z-50 bg-gray-900'>
          <div className="text-center h-full mr-auto items-center justify-center ml-2 text-sm hidden md:flex">
            Páscoa/23
          </div>
          <div className="flex h-full ml-auto">
            <button onClick={() => openView(Shortcuts['Z'])} className='relative px-3 h-full flex text-center border-l border-l-gray-50 items-center justify-center hover:bg-green-300 hover:text-black'>
              <div className='relative flex items-center justify-center'>
                <span className='z-10 relative'>ZRP</span>
                <span className="text-xs px-2 py-1 mx-2 hidden md:flex rounded-xl bg-black text-white tracking-tighter">Ctrl + Z</span>
                <span className={`absolute right-0 top-0 transform-gpu translate-x-0 h-3 translate-y-1 w-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-orange-400'}`}></span>
              </div>
            </button>
            <button onClick={() => openView(Shortcuts['P'])} className='px-3 h-full flex text-center border-l border-l-gray-50 items-center justify-center hover:bg-orange-500 hover:text-black'>
              Progresso <span className="text-xs px-2 py-1 mx-2 hidden md:flex rounded-xl bg-black text-white tracking-tighter">Ctrl + P</span>
            </button>
            <button onClick={() => openView(Shortcuts['M'])} className='px-3 h-full flex text-center border-l border-l-gray-50 items-center justify-center hover:bg-yellow-500 hover:text-black'>
              Mapa <span className="text-xs px-2 py-1 mx-2 hidden md:flex rounded-xl bg-black text-white tracking-tighter">Ctrl + M</span>
            </button>
            <button onClick={() => openView(Shortcuts[','])} className='px-3 h-full flex text-center border-l border-l-gray-50 items-center justify-center hover:bg-purple-300 hover:text-black'>
              Configurações <span className="text-xs px-2 py-1 mx-2 hidden md:flex rounded-xl bg-black text-white tracking-tighter">Ctrl + ,</span>
            </button>
          </div>
        </nav>

        <div id="terminal" className='p-4 min-h-full flex-grow relative'>
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
        </div>

        {worldQueue.length > 0 && rendering ? <div ref={typingRef} className='text-xs ml-4 mb-2 bg-gray-900 text-gray-100 rounded-md w-24 text-left p-1 px-2 '>Digitando<span></span></div> : <></>}


        <div className={`flex items-top transition-all fixed p-4 rounded-xl bg-red-500 w-2/5 top-16 right-4 ${error?.message == '' ? '-translate-y-40' : 'translate-y-0'}`}>
          <img src={alertSvg} className='w-6 h-6 mr-4' />
          <p className='text-sm'>{error?.message}</p>
        </div>

        <form onSubmit={handleSubmit} className='h-10 backdrop-blur-lg bg-gray-900 border-t border-t-gray-100 sticky bottom-0 z-50 left-0 w-full flex align-items-center'>
          <input ref={promptInputRef} type="text" name="prompt" value={prompt} onChange={handleChange} disabled={worldQueue.length > 0} className="w-full bg-transparent font-mono text-sm p-2 text-white outline-none" />
          <button type="submit" className={`text-sm p-2 mx-4 ${prompt == '' ? 'opacity-50' : 'opacity-100'} transition-opacity`} disabled={prompt == ''}>
            <img src={sendSvg} className="h-full cursor-pointer" />
          </button>
        </form>


        <Modal open={qModalOpen} title={'ZRP > Easter23 > Pergunta #1'} onClose={() => setQModalOpen(false)}>
          <div className="p-4 flex-grow">
            <h1 className="text-2xl">Quem é considerada a primeira pessoa programadora da história?</h1>
            <ul>
              <li>
                <input type="checkbox" />
                <label>Ada Lovelace</label>
              </li>
              <li>
                <input type="checkbox" />
                <label>Alan Turing</label>
              </li>
            </ul>
          </div>

          <nav className='w-100 h-10 border-t border-t-gray-50'>
            <button className='flex h-full w-full text-center border-l border-l-gray-50 ml-auto items-center justify-center hover:bg-green-400 hover:text-black rounded-br'>
              <span className='text-sm font-medium'>Validar resposta</span>
            </button>
          </nav>
        </Modal>

        {
          shortcut?.mode ? (
            shortcut?.mode == 'Modal' ?
              <Modal open={modalOpen} onClose={() => setModalOpen(false)} {...shortcut.extraProps}>
                {shortcut.render({ socket, user, users })}
              </Modal>
              : <SideView open={sideViewOpen} onClose={() => setSideViewOpen(false)}>
                {shortcut.render({ socket, user, users })}
              </SideView>
          ) : <></>
        }
      </div>
    </div >
  </>
}

export default App
