import { useEffect, useState } from "react";

export default function Players({ user, users }) {
  return <>
    <h1 className="text-xl mb-2">Scoreboard</h1>
    <h2 className="text-sm">In-game <span className="">({users?.online}/{users?.total})</span>:</h2>
    <ul className="mt-4">
      {users?.users?.map(u => {
        return <li key={u.id} className="text-lg font-bold flex items-center">
          <span className="relative flex w-6 h-6 mr-2">
            <span className={`animate-ping absolute rounded-3xl top-1 left-1 w-4 h-4 ${u.status == 'online' ? 'bg-green-400' : 'bg-orange-400'} opacity-25`}></span>
            <span className={`absolute rounded-3xl top-2 left-2 w-2 h-2 ${u.status == 'online' ? 'bg-green-400' : 'bg-orange-400'}`}></span>
          </span>
          {u?.id == user?.id ? <span className="text-orange-300">{u?.name?.givenName} (score: {u?.score})</span> : <span>{u?.name?.givenName} (score: {u?.score})</span>}
        </li>;
      })}
    </ul >
  </>
}
