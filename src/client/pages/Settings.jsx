import { useLocalStorage } from '../hooks/storage';
import socket from '../socket';

export default function Settings({ user }) {
  const [dense, setDense] = useLocalStorage("layout:dense", true);

  const restartGame = () => {
    // socket.timeout.emitWithAck('game:restart');
  }

  return <div className='flex flex-col w-100 items-start flex-grow justify-between h-full w-full'>
    <div>
      <div className='text-lg text-gray-50'>{user?.name?.givenName} {user?.name?.familyName}</div>
      <div className='text-sm text-gray-400'>{user?.username}</div>
      <h1 className="mt-8">Configurações</h1>
      <div className="relative inline-flex items-center cursor-pointer my-2">
        <input id="dense-checkbox" type="checkbox" checked={dense} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" onClick={(e) => setDense(!dense)}></div>
        <label htmlFor="dense-checkbox" className="ml-2 text-base text-gray-100 dark:text-gray-300">Compactar o terminal</label>
      </div>
    </div>
    <button type="button" className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800" onClick={(e) => restartGame()}>
      Reiniciar o jogo
      <svg aria-hidden="true" className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
    </button>
  </div >
}
