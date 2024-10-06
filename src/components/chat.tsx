import Anthropic from "@anthropic-ai/sdk";
import { MessageParam } from "@anthropic-ai/sdk/resources/messages.mjs";
import { ArrowUp, Copy, LoaderIcon } from "lucide-react"; // Importing icons used in the first component
import { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { cn } from "../utils";

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface IMessage {
  id: string;
  type: string;
  role: string;
  model: string;
  content: { type: string; text: string }[];
  stop_reason: string;
  stop_sequence: null;
  usage: { input_tokens: number; output_tokens: number };
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      // Handle file upload
      console.log(acceptedFiles);
      // You can implement file reading and add its content to the chat here
    },
  });

  const sendMessage = async () => {
    if (input.trim() === "") return;
    let formattedInput = input;
    if (formattedInput.endsWith("<p><br></p>")) {
      formattedInput = formattedInput.slice(0, -11);
    }

    const newMessages = [
      ...messages,
      {
        role: "user",
        content: [
          {
            type: "text",
            text: formattedInput,
          },
        ],
      },
    ] as IMessage[];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const msg = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 4096,
        temperature: 0,
        messages: newMessages.map((message) => ({
          role: message.role,
          content: message.content.map((content) => ({
            type: content.type,
            text: content.text,
          })),
        })) as MessageParam[],
      });
      // const msg = {
      //   id: "msg_01FynUWQVhowm1SidyD7WekG",
      //   type: "message",
      //   role: "assistant",
      //   model: "claude-3-sonnet-20240229",
      //   content: [
      //     {
      //       type: "text",
      //       text: "Sure, here's an example of an `eslint.config.ts` file for a React front-end project:\n\n```typescript\nimport { defineConfig } from 'eslint-define-config';\n\nexport default defineConfig({\n  root: true,\n  env: {\n    browser: true,\n    es2021: true,\n    node: true,\n  },\n  extends: [\n    'eslint:recommended',\n    'plugin:react/recommended',\n    'plugin:@typescript-eslint/recommended',\n    'plugin:prettier/recommended',\n  ],\n  parser: '@typescript-eslint/parser',\n  parserOptions: {\n    ecmaFeatures: {\n      jsx: true,\n    },\n    ecmaVersion: 'latest',\n    sourceType: 'module',\n  },\n  plugins: ['react', '@typescript-eslint', 'prettier'],\n  rules: {\n    'react/react-in-jsx-scope': 'off',\n    '@typescript-eslint/no-unused-vars': ['error'],\n    '@typescript-eslint/no-explicit-any': 'off',\n    'prettier/prettier': [\n      'error',\n      {\n        endOfLine: 'auto',\n      },\n    ],\n  },\n  settings: {\n    react: {\n      version: 'detect',\n    },\n  },\n});\n```\n\nHere's a breakdown of what this configuration does:\n\n1. **Imports**: It imports the `defineConfig` function from the `eslint-define-config` package, which allows you to define the ESLint configuration in a TypeScript file.\n\n2. **Environment**: It sets the `env` option to specify the environments where the code will run (`browser`, `es2021`, and `node`).\n\n3. **Extends**: It extends several popular ESLint configurations:\n   - `eslint:recommended`: Enables the recommended rules from ESLint.\n   - `plugin:react/recommended`: Enables the recommended rules for React from the `eslint-plugin-react` plugin.\n   - `plugin:@typescript-eslint/recommended`: Enables the recommended rules for TypeScript from the `@typescript-eslint/eslint-plugin` plugin.\n   - `plugin:prettier/recommended`: Enables the recommended rules for Prettier from the `eslint-plugin-prettier` plugin.\n\n4. **Parser**: It sets the `parser` option to `@typescript-eslint/parser`, which allows ESLint to parse TypeScript code.\n\n5. **Parser Options**: It configures the `parserOptions` to enable JSX support and set the ECMAScript version to the latest.\n\n6. **Plugins**: It specifies the plugins to be used: `react`, `@typescript-eslint`, and `prettier`.\n\n7. **Rules**: It overrides or adds specific rules:\n   - `react/react-in-jsx-scope`: Disables the rule that requires importing React in files with JSX.\n   - `@typescript-eslint/no-unused-vars`: Enables the rule that warns about unused variables.\n   - `@typescript-eslint/no-explicit-any`: Disables the rule that disallows the use of the `any` type.\n   - `prettier/prettier`: Enables the Prettier plugin and configures it to use the system's end-of-line character.\n\n8. **Settings**: It configures the `react` setting to automatically detect the React version.\n\nThis configuration sets up ESLint with recommended rules for React, TypeScript, and Prettier. It also disables a few rules that might conflict with your project's needs or preferences. You can further customize the rules according to your project's requirements.",
      //     },
      //   ],
      //   stop_reason: "end_turn",
      //   stop_sequence: null,
      //   usage: {
      //     input_tokens: 31,
      //     output_tokens: 852,
      //   },
      // };
      setMessages([...newMessages, msg] as IMessage[]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/);
    return parts.map((part: string, index: number) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const code = part.slice(3, -3).trim();
        const language = code.split("\n")[0];
        const codeContent = code.split("\n").slice(1).join("\n");
        return (
          <div key={index} className="relative my-4">
            <SyntaxHighlighter
              language={language}
              style={docco}
              className="rounded-lg p-4 !bg-orange-100/5 !text-white overflow-auto"
            >
              {codeContent}
            </SyntaxHighlighter>
            <button
              onClick={() => copyToClipboard(codeContent)}
              className="absolute -bottom-10 right-0 text-xs text-muted-foreground flex bg-sky-200/5 p-2 items-center gap-1"
            >
              <Copy size={12} /> Copy
            </button>
          </div>
        );
      } else if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <div key={index}>
            <strong>{part.slice(2, -2)}</strong>
          </div>
        );
      } else if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <div key={index}>
            <em>{part.slice(1, -1)}</em>
          </div>
        );
      } else {
        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{
              __html: part.replace(
                /https?:\/\/\S+/g,
                (url: string) =>
                  `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
              ),
            }}
          />
        );
      }
    });
  };

  const handleInputChange = (value: string) => {
    setInput(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto p-4">
      <div
        id="chat-container"
        className="flex flex-col pb-4 gap-2 overflow-y-auto max-h-full p-4 bg-slate-1000 rounded-xl my-4"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex flex-col p-4 shadow-sm whitespace-pre-wrap font-serif",
              message.role !== "user"
                ? "bg-accent dark:bg-white/5 text-accent-foreground dark:text-muted-foreground rounded-xl gap-4 w-full"
                : "bg-white dark:bg-amber-600/40 text-black dark:text-white rounded-xl gap-4 w-fit ml-auto"
            )}
          >
            {renderMessageContent(message.content[0].text)}
          </div>
        ))}
        <div ref={messagesEndRef} />
        {isLoading && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <LoaderIcon strokeWidth={2} className="animate-spin w-4 h-4" />
            <span>Generating...</span>
          </div>
        )}
      </div>
      <div className="sticky bottom-0 left-0 w-full bg-[#121212]">
        <div className="mb-4 relative">
          <ReactQuill
            className="w-full min-h-28 [&_>div]:min-h-28 [&_>div]:rounded-xl [&_>div]:!border-neutral-500 [&_div]:before:placeholder:!text-neutral-500 !text-white font-serif"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            modules={{
              toolbar: false,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="
            absolute right-2 bottom-2 p-2 m-2 rounded-xl bg-accent text-accent-foreground dark:bg-white dark:text-black hover:opacity-80 transition-opacity
            "
          >
            {isLoading ? (
              <LoaderIcon strokeWidth={2} className="animate-spin w-4 h-4" />
            ) : (
              <ArrowUp />
            )}
          </button>
        </div>
        <div
          {...getRootProps()}
          className={cn(
            "p-4 border-2 border-dashed rounded-lg text-center cursor-pointer",
            isDragActive
              ? "border-blue-500 bg-blue-100"
              : "border-gray-300 dark:border-neutral-700"
          )}
        >
          <input {...getInputProps()} />
          <p>Drag and drop some files here, or click to select files</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
