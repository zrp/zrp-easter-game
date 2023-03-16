import { useEffect, useState } from "react";

export default function Players({ user, users }) {
  return <>
    <h1 className="text-sm mb-4">In-game ({users?.online}/{users?.total}):</h1>
    <ul>
      {users?.users?.map(u => {
        return <li key={u.id} className="text-lg font-bold flex items-center">
          <span className="relative flex w-6 h-6 mr-2">
            <span className={`animate-ping absolute rounded-3xl top-1 left-1 w-4 h-4 ${u.status == 'online' ? 'bg-green-400' : 'bg-orange-400'} opacity-25`}></span>
            <span className={`absolute rounded-3xl top-2 left-2 w-2 h-2 ${u.status == 'online' ? 'bg-green-400' : 'bg-orange-400'}`}></span>
          </span>
          <span>{u?.name?.givenName} {u?.id == user?.id ? '(você)' : ''}</span>
        </li>;
      })}
    </ul >
  </>
}
