import { fromEvent } from "rxjs";
import { tap, map, filter } from "rxjs/operators";

// Pages
import Players from "../pages/Players";
import Settings from "../pages/Settings";
import Progress from "../pages/Progress";
import Map from "../pages/Map";

const Shortcuts = {
  Z: {
    name: "ZRP",
    render: (props) => <Players {...props}></Players>,
    mode: "SideView",
    extraProps: {
      title: "",
    },
  },
  P: {
    name: "Progresso",
    render: (props) => <Progress {...props}></Progress>,
    mode: "SideView",
    extraProps: {
      title: "Progresso",
    },
  },
  M: {
    name: "Mapa",
    render: (props) => <Map {...props}></Map>,
    mode: "Modal",
    extraProps: {
      title: "Mapa",
    },
  },
  I: {
    name: "Inventário",
    render: (props) => <Map {...props}></Map>,
    mode: "SideView",
    extraProps: {
      title: "Inventário",
    },
  },
  ",": {
    name: "Configurações",
    render: (props) => <Settings {...props}></Settings>,
    mode: "SideView",
    extraProps: {
      title: "Configurações",
    },
  },
};

const onShortcutChange = (cb = null) => {
  const sub$ = fromEvent(window, "keydown")
    .pipe(
      map((e) => ({ key: e.key.toUpperCase(), ctrlKey: e.ctrlKey, event: e })),
      filter(({ key, ctrlKey }) => Object.keys(Shortcuts).includes(key) && ctrlKey),
      tap(({ event }) => event.preventDefault()),
      map(({ key }) => ({ key, shortcut: Shortcuts[key] })),
    )
    .subscribe(async (data) => {
      console.log(`Shortcut Ctrl + ${data.key} triggered, which translates to "${data.shortcut.name}"`)
      await cb?.(data);
    });

  return () => {
    sub$?.unsubscribe();
  };
};

const getShortcut = (key = "") => {
  const shortcut = Shortcuts[key];

  return shortcut ? shortcut : null;
}

const service = {
  onShortcutChange,
  getShortcut,
};

export default service;
