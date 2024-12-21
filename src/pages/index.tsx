import React, { useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { useChat } from 'ai/react'
import { AiOutlineArrowUp, AiOutlineLoading } from "react-icons/ai";
import Head from "next/head";
import { Analytics } from '@vercel/analytics/react';

function chunkString(str: string): string[] {
  const words: string[] = str.split(" ");
  const chunks: string[] = [];

  for(let i = 0; i < words.length; i += 2) {
    const chunk = words.slice(i, i + 2);
    if (chunk.length === 2) {
      chunks.push(chunk.join(" ") + " ");
    }
  }

  return chunks;
}

export default function Home() {
  const { messages, input, handleInputChange, isLoading, handleSubmit } = useChat()

  const shouldAnimateLastMessage = isLoading && messages.length > 0 && messages[messages.length - 1].role !== "user"
  const lastMessage = messages[messages.length - 1]; // Get the last message

  const messageBodyRef = useRef<HTMLDivElement>(null); // Add type assertion to useRef

  useEffect(() => {
    if (messageBodyRef.current) {
      const { scrollHeight, clientHeight } = messageBodyRef.current;
      if (scrollHeight > clientHeight) {
        messageBodyRef.current.scrollTop = scrollHeight - clientHeight;
      }
    }
  }, [messages]); // Listen for changes in the messages array

  return (
    <>
      <Head>
        <title>Agent Trends</title>
        <meta name="description" content="AI enabled youtube video transcript summarizer." />
        <meta name="twitter:site" content="@QuentinoAI" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={"Quentino AI - youtube video transcript summarizer."} />
        <meta name="twitter:description" content="AI enabled youtube video transcript summarizer." />
        {/* <meta name="twitter:image" content="https://agentgpt.reworkd.ai/banner.png" /> */}
        {/* <meta name="twitter:image:width" content="1280" />
        <meta name="twitter:image:height" content="640" /> */}
        <meta property="og:title" content={"Quentino AI - youtube video transcript summarizer."} />
        <meta property="og:description" content="AI enabled youtube video transcript summarizer." />
        {/* <meta property="og:url" content="https://agentgpt.reworkd.ai/" /> */}
        {/* <meta property="og:image" content="https://agentgpt.reworkd.ai/banner.png" /> */}
        {/* <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="640" /> */}
        <meta property="og:type" content="website" />
        {/* <meta name="google-site-verification" content="sG4QDkC8g2oxKSopgJdIe2hQ_SaJDaEaBjwCXZNkNWA" /> */}
      </Head>
      <Analytics />

      <div className="bg-zinc-900 h-[100svh] w-screen flex items-center justify-center font-sans">
        <div
          className="max-w-screen-md flex-1 flex flex-col h-[100svh] items-center p-5 sm:p-7 gap-5 sm:gap-7 overflow-hidden">
          <div className="flex-1 w-full overflow-auto" ref={messageBodyRef}>
            <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 2, delay: 0.5 }}>
              {
                messages.length <= 0 && (
                  <div className="w-full flex items-center justify-center font-thin text-lg text-neutral-400 text-center">
                    Analyze social trends
                  </div>
                )
              }
            </motion.div>
            {
              // If loading, do not show the last message statically
              (shouldAnimateLastMessage ? messages.slice(0, messages.length - 1) : messages).map(m => {
                if (m.role === "user") return (
                  <div key={m.id} className="font-bold text-xl">{m.content}</div>
                )
                return (
                  <div key={m.id} className="mb-2 text-neutral-400">{m.content}</div>
                )
              })
            }
            {isLoading && shouldAnimateLastMessage && (
              // When loading, animate chunks of the latest message
              <div>
                {chunkString(messages[messages.length - 1].content).map((chunk, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.75 }}
                    className="mb-2 text-neutral-400"
                  >
                    {chunk}
                  </motion.span>
                ))}
              </div>
            )}
          </div>

          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 2, delay: 0.5 }} className="w-full">
            <form onSubmit={handleSubmit} className=" bg-white/5 p-1.5 text-lg rounded-full relative w-full">
              <input
                className="text-white w-full p-3 pl-5 pr-14 bg-transparent rounded-full border-[2px] border-white/5 hover:border-white/20 focus:border-blue-400 outline-0 transition-all duration-500"
                value={input}
                placeholder="Ask Quentino AI to summarize a youtube video..."
                onChange={handleInputChange}
              />
              <div
                className={`absolute right-4 top-3.5 bg-purple-500 hover:bg-purple-400 p-2 rounded-full transition-colors duration-500 cursor-pointer`}
                onClick={(e) => handleSubmit(e as any)}
              >
                {isLoading ? <AiOutlineLoading size={25} className="animate-spin" /> : <AiOutlineArrowUp size={25} />}
              </div>
            </form>
            <div className="w-full flex items-center justify-center">
              <a className="text-neutral-400 text-xs mt-2 hover:scale-110 transition-all duration-500 cursor-pointer"
                >
                Crafted with 💜 by TrendsAgent
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
