export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="nes-container with-title is-centered">
        <p className="title">Welcome</p>
        <h1 className="text-2xl">Hello, Pokémon trainer!</h1>
        <div className="mt-8">
          <button type="button" className="nes-btn is-primary">Start Journey</button>
        </div>
      </div>
    </main>
  );
} 