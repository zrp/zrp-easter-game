import io from "socket.io-client";
import { of, fromEvent, from, throwError } from "rxjs";
import { bufferTime, filter, switchMap, tap, map, buffer } from "rxjs/operators";
import _ from "lodash";

const socket = io({ ackTimeout: 30000, autoConnect: true, reconnectionDelay: 5000, timeout: 15000, retries: 10 });

const INCOMING = {
  connect: "connect",
  disconnect: "disconnect",
  gameLoaded: "game:loaded",
  usersUpdated: "ui:user_list",
};

const onConnect = (cb = null) => {
  const handler = async () => {
    console.log(`connected socket id ${socket.id}`);
    await cb?.(socket);
  };

  socket.on(INCOMING.connect, handler);

  return () => socket.off(INCOMING.connect, handler);
};

const onDisconnect = (cb = null) => {
  const handler = async () => {
    console.log(`disconnected socket id ${socket.id}`);
    await cb?.(socket);
  };
  socket.on(INCOMING.disconnect, handler);

  return () => socket.off(INCOMING.disconnect, handler);
};

const onGameLoaded = (cb = null) => {
  const handler = async (data) => {
    console.log(`Game loaded with data`, data);

    await cb?.(data);
  };
  socket.on(INCOMING.gameLoaded, handler);

  return () => socket.off(INCOMING.gameLoaded, handler);
};

const onUsersUpdated = (cb = null) => {
  const handler = async (users) => {
    await cb?.(users);
  };
  socket.on(INCOMING.usersUpdated, handler);

  return () => socket.off(INCOMING.usersUpdated, handler);
};

const onGameEvent = (cb = () => { }) => {
  const sub$ = of(socket)
    .pipe(
      switchMap((socket) => fromEvent(socket, "game:response")),
      switchMap(([data, callback]) => {
        callback("ACK_GAME_RESPONSE");

        console.log(`Received data`, data);

        if (_.isArray(data)) {
          return of(...data.map(d => d.worldAdd))
        } else {
          return of(data?.worldAdd);
        }
      }),
      bufferTime(500),
      filter(d => d.length > 0),
    )
    .subscribe((data) => {

      cb?.(data);
    });

  return () => {
    sub$?.unsubscribe();
  };
};

const onGameError = (cb = null) => {
  const sub$ = of(socket)
    .pipe(
      switchMap(socket => fromEvent(socket, 'game:error')),
      switchMap(([data, callback]) => {
        callback("ACK_GAME_ERROR");

        return of(data.error);
      })
    ).subscribe(async (data) => {
      await cb?.(data);
    });

  return () => {
    sub$?.unsubscribe();
  }
}

const onLocationChange = (cb = null) => {
  const sub$ = of(socket)
    .pipe(
      switchMap((socket) => fromEvent(socket, "game:location-change")),
      switchMap(([data, callback]) => {
        callback("ACK_LOCATION_CHANGE");

        return of(data);
      }),
      bufferTime(500),
      filter((e) => e.length > 0),
    )
    .subscribe(async (add) => {
      await cb?.(add);
    });

  return () => {
    sub$?.unsubscribe();
  };
}

const onChallenge = (cb = null) => {
  const sub$ = of(socket)
    .pipe(
      switchMap((socket) => fromEvent(socket, "game:challenge")),
      switchMap(([data, callback]) => {
        callback("ACK_CHALLENGE");

        return of(data);
      }),
      filter(data => !!data),
    )
    .subscribe(async (add) => {
      await cb?.(add);
    });

  return () => {
    sub$?.unsubscribe();
  };
}

const onInventoryChange = (cb = null) => {
  const sub$ = of(socket)
    .pipe(
      switchMap((socket) => fromEvent(socket, "game:inventory-change")),
      filter((e) => e.length > 0),
    )
    .subscribe(async (add) => {
      await cb?.(add);
    });

  return () => {
    sub$?.unsubscribe();
  };
}

const onProgressChange = (cb = null) => {
  const sub$ = of(socket)
    .pipe(
      switchMap((socket) => fromEvent(socket, "game:progress-change")),
    )
    .subscribe(async (add) => {
      await cb?.(add);
    });

  return () => {
    sub$?.unsubscribe();
  };
}

const service = {
  // Incoming
  onConnect,
  onDisconnect,
  onGameLoaded,
  onUsersUpdated,
  onGameEvent,
  onGameError,
  onLocationChange,
  onInventoryChange,
  onProgressChange,
  onChallenge,
  io: socket,
};

export default service;
