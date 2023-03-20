import { useEffect, useState } from "react";

import socket from '../services/socket';

export default function Progress(props) {
  const [data, setData] = useState({ score: 0, steps: 0 });

  useEffect(() => {
    const cancel$ = socket.onProgressChange((data) => setData(data));

    socket.io.emit('game:update-progress');

    return cancel$;
  }, [])

  return <div>
    <p className="mb-2">Score: {data?.score}</p>
    <p className="text-lg text-gray-400">Passos: {data?.steps}</p>
  </div>;
}
