import { useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/storage';
import socket from '../services/socket';

export default function Settings({ user }) {
  const [dense, setDense] = useLocalStorage("layout:dense", false);
  const [fontSizeSm, setFontSizeSm] = useLocalStorage("layout:font-sm", false);
  const [typeSpeed, setTypeSpeed] = useLocalStorage('layout:typeSpeed', 50);

  const [showWindRoses, setWindRoses] = useLocalStorage('layout:windRoses', false);
  const [confirm, setConfirm] = useState(false);
  const [time, setTime] = useState(0);

  const restartGame = async () => {
    await socket.io.timeout(15000).emitWithAck('game:restart');
    setConfirm(false);
  }

  useEffect(() => {
    if (typeSpeed < 30) {
      setTypeSpeed(30);
    }
  }, [typeSpeed]);

  useEffect(() => {
    let t;
    let i;
    let time = 0;

    if (confirm) {
      setTime(5);
      t = setTimeout(() => {
        setConfirm(false);
        setTime(0);
      }, 5000);
      i = setInterval(() => {
        time += 1;
        setTime(Math.max(5 - time, 0))
      }, 1000);
    }

    return () => {
      if (t) clearTimeout(t);
      if (i) clearInterval(i);
    }
  }, [confirm])

  return <div className='flex flex-col w-100 items-start flex-grow justify-between h-full w-full'>
    <div>
      <div className='text-lg text-gray-50'>{user?.name?.givenName} {user?.name?.familyName}</div>
      <div className='text-sm text-gray-400'>{user?.username}</div>
      <h1 className="mt-8">Terminal</h1>
      {/* layout:dense */}
      <div className="relative flex w-full items-center cursor-pointer my-4">
        <input id="dense-checkbox" type="checkbox" checked={dense} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" onClick={(e) => setDense(!dense)}></div>
        <label htmlFor="dense-checkbox" className="ml-2 text-base text-gray-100 dark:text-gray-300">Compactar mensagens</label>
      </div>

      {/* layout:font-sm */}
      <div className="relative flex w-full items-center cursor-pointer my-4">
        <input id="font-sm-checkbox" type="checkbox" checked={fontSizeSm} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" onClick={(e) => setFontSizeSm(!fontSizeSm)}></div>
        <label htmlFor="font-sm-checkbox" className="ml-2 text-base text-gray-100 dark:text-gray-300">Fonte pequena</label>
      </div>

      <div className="relative flex- w-full items-center my-4">
        <label htmlFor="font-sm-checkbox" className="mb-2 text-base text-gray-100 dark:text-gray-300">Delay de escrita</label>
        <span className='text-xs text-gray-400 block'>É necessário recarregar o jogo para aplicar o novo delay de escrita</span>
        <input id="default-range" type="range" min={30} max={200} value={typeSpeed} onChange={e => setTypeSpeed(parseInt(e.target.value, 10))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
        <span className='text-xs text-gray-500'>({typeSpeed}ms/letra)</span>
      </div>
      <h1 className="mt-8">Jogo</h1>
      <div className="relative flex w-full items-center cursor-pointer my-4">
        <input id="dense-checkbox" type="checkbox" checked={showWindRoses} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" onClick={(e) => setWindRoses(!showWindRoses)}></div>
        <label htmlFor="dense-checkbox" className="ml-2 text-base text-gray-100 dark:text-gray-300">Mostrar bússola</label>
      </div>
    </div>
    <button type="button" className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800" onClick={(e) => confirm ? restartGame() : setConfirm(true)}>
      {!confirm ? <>Reiniciar o jogo<svg aria-hidden="true" className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg></> : `Certeza? (${time}s)`}

    </button>
  </div >
}
