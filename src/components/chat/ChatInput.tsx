"use client"; // Only needed if using Next.js App Router
import "regenerator-runtime/runtime";
import { Send, Mic } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useContext, useRef, useEffect, useState } from "react";
import { ChatContext } from "./ChatContext";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

interface ChatInputProps {
  isDisabled?: boolean;
}

const ChatInput = ({ isDisabled }: ChatInputProps) => {
  const { addMessage, handleInputChange, isLoading, message, setMessage } =
    useContext(ChatContext);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lastTranscript, setLastTranscript] = useState(""); // Track the last processed transcript

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.error("Speech Recognition is not supported in this browser.");
    }
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    if (transcript && transcript !== lastTranscript) {
      const newText = transcript.replace(lastTranscript, ""); // Remove already processed transcript
      setMessage((prevMessage: string) => prevMessage + newText); // Append only new transcript
      setLastTranscript(transcript); // Update last transcript
    }
  }, [transcript, lastTranscript, setMessage]);

  const startListening = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true }); // Request microphone access
      resetTranscript(); // Clear previous transcript before starting new session
      setLastTranscript("");
      SpeechRecognition.startListening({
        continuous: true,
        interimResults: true,
      });
    } catch (error) {
      console.error("Microphone access denied:", error);
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setLastTranscript(""); // Clear last transcript when stopping

    if (message.trim() !== "") {
      addMessage(); // Send the message
      setMessage(""); // Clear input
      textareaRef.current?.focus(); // Refocus on the textarea
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addMessage();
      setMessage(""); // Clear input after sending
      textareaRef.current?.focus(); // Refocus on the textarea
    }
  };

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <div className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <div className="relative">
              <Textarea
                rows={1}
                ref={textareaRef}
                maxRows={4}
                autoFocus
                onChange={handleInputChange}
                value={message}
                onKeyDown={handleKeyDown}
                placeholder="Enter your question or press the mic..."
                className="resize-none pr-32 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch overflow-auto"
              />

              <div className="absolute bottom-1.5 right-[8px] flex space-x-2">
                <Button
                  disabled={
                    isLoading || isDisabled || !browserSupportsSpeechRecognition
                  }
                  className={`${listening ? "bg-red-500" : ""}`} // Change mic color to red when listening
                  aria-label="record message"
                  onMouseDown={startListening}
                  onMouseUp={stopListening}
                >
                  <Mic className="h-4 w-4" />
                </Button>

                <Button
                  disabled={isLoading || isDisabled}
                  aria-label="send message"
                  onClick={() => {
                    addMessage();
                    setMessage(""); // Clear message after sending
                    textareaRef.current?.focus();
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
