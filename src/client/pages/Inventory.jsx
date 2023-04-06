import { useEffect, useState } from "react";

import socket from '../services/socket';

export default function Inventory(props) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const cancel$ = socket.onInventoryChange((d) => setData(d));

    socket.io.emit('game:update-inventory');

    return cancel$;
  }, [])

  return <ul>{data?.map((item, index) => {
    return <li key={item.id} className="list-item list-outside list-disc ml-4">
      <p className="text-lg">{item.name} ({item.qty}x)</p>
      <p className="text-sm text-gray-400">{item.inside ? item.description : item.descriptionEmpty ?? item.description}</p>
    </li>
  })}</ul>;
}
