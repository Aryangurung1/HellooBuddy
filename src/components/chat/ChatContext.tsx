import { ReactNode, createContext, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { useToast } from "@/hooks/use-toast";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
};

export const ChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
  setMessage: () => {},
});

interface Props {
  fileId: string;
  children: ReactNode;
}

export const ChatContextProvider = ({ fileId, children }: Props) => {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const utils = trpc.useContext();

  const { toast } = useToast();

  const backupMessage = useRef("");

  const { mutate: sendMessage } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          fileId,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.body;
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message;
      setMessage("");

      // step 1
      await utils.getFileMessages.cancel();

      // step 2
      const previousMessages = utils.getFileMessages.getInfiniteData();

      // step 3
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          const newPages = [...old.pages];

          const latestPage = newPages[0]!;

          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
            },
            ...latestPage.messages,
          ];

          newPages[0] = latestPage;

          return {
            ...old,
            pages: newPages,
          };
        }
      );

      setIsLoading(true);

      return {
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) ?? [],
      };
    },
    onSuccess: async (stream) => {
      if (!stream) {
        return toast({
          title: "There was a problem sending this message",
          description: "Please refresh this page and try again",
          variant: "destructive",
        });
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // For accumulating chunks of the response
      const accumulatedChunks: string[] = [];

      // First while loop: Decode chunks of data
      while (!done) {
        setIsLoading(false);
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunkValue = decoder.decode(value);
          // Assuming the chunks are coming in a key-value format (e.g., "0: 'i'", "1: 'a'")
          accumulatedChunks.push(chunkValue);
        }
      }

      // Now you have all the chunks in `accumulatedChunks` array, e.g., ["0: 'i'", "1: 'a'"]

      // Second while loop: Process the accumulated chunks
      let finalResponse = "";
      let index = 0;

      while (index < accumulatedChunks.length) {
        const chunk = accumulatedChunks[index];
        const match = chunk.match(/:\s*['"]([^'"]+)['"]/); // This regex extracts the value inside quotes

        if (match && match[1]) {
          finalResponse += match[1]; // Append the decoded value
        }

        index++;
      }

      // Now `finalResponse` contains the fully constructed response based on the key-value pairs.
      console.log("Final response is:", finalResponse);

      // Update the UI or handle the final response as needed
      utils.getFileMessages.setInfiniteData(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) return { pages: [], pageParams: [] };

          const updatedPages = old.pages.map((page) => {
            if (page === old.pages[0]) {
              const updatedMessages = [
                {
                  createdAt: new Date().toISOString(),
                  id: "ai-response",
                  text: finalResponse, // Use the final constructed response here
                  isUserMessage: false,
                },
                ...page.messages,
              ];

              return { ...page, messages: updatedMessages };
            }

            return page;
          });

          return { ...old, pages: updatedPages };
        }
      );
    },

    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      utils.getFileMessages.setData(
        { fileId },
        { messages: context?.previousMessages ?? [] }
      );
    },
    onSettled: async () => {
      setIsLoading(false);

      await utils.getFileMessages.invalidate({ fileId });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const addMessage = () => sendMessage({ message });

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
        setMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
