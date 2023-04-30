import React, { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import { setConnected, setPubKey } from "@/redux/rootReducer";

const Connect = () => {
  const [nodePubkey, setNodePubkey] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(`/api/peer/status?pubkey=${nodePubkey}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const res = await response.json();

      if (res?.data?.pub_key) {
        setMessage("Connected");
        setMessageType("success");

        dispatch(setConnected(true));

        dispatch(setPubKey(res.data.pub_key));
      } else {
        setMessage("Not connected");
        setMessageType("error");
      }
    } catch (error) {
      console.log(error);
      setMessage("An error occurred. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <main className={`flex flex-col items-center justify-start p-20 w-full`}>
      <form onSubmit={handleSubmit} className={`w-full`}>
        <VStack spacing={4}>
          <FormControl id="node-pubkey">
            <FormLabel>Node Pubkey</FormLabel>
            <Input
              type="text"
              value={nodePubkey}
              onChange={(e) => setNodePubkey(e.target.value)}
            />
          </FormControl>
          <Button type="submit" colorScheme="blue">
            Check connection status
          </Button>
          {message && (
            <Text
              fontWeight="bold"
              color={messageType === "success" ? "green.500" : "red.500"}
            >
              {message}
            </Text>
          )}
        </VStack>
      </form>
    </main>
  );
};

export default Connect;
