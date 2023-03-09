export default function Settings({ user }) {
  return <>
    <>{user?.name?.givenName}</>
    <>{user?.username}</>
    <button>Sair</button>
  </>
}
