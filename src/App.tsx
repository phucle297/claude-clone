import ChatInterface from "./components/chat";

export default function App() {
  return (
    <main className="pt-10">
      <div className={"w-full max-h-fit max-w-[800px] mx-auto"}>
        <div className="container">
          <div className="flex flex-col gap-2 items-center">
            <h1 className="text-4xl font-bold">Say Something</h1>
            <p>
              This is a simple chat interface that uses Claude 3.5 to generate.
              Try it out!
            </p>
          </div>
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
