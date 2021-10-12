import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Spin } from "antd";
import { create } from "ipfs-core";
import { io } from "socket.io-client";
import * as stacks from "@stacks/blockchain-api-client";
import { TITLE } from "./strings";
import Home from "./components/home/Home.js";
import PropertyInfo from "./components/propertyInfo/PropertyInfo";
import {
  handleContractEvents,
  socketUrl,
  deployedContractAddress,
} from "./helper";
import "./App.css";

function App() {
  const blockchainApiClient = useRef();
  const [ipfsClient, setIpfsClient] = useState();

  useEffect(async () => {
    initializeBlockchainApiClient();
    const client = await create();
    setIpfsClient(client);
  }, []);

  async function initializeBlockchainApiClient() {
    const socket = io(socketUrl, {
      query: {
        subscriptions: Array.from(
          new Set([`address-transaction:${deployedContractAddress}`])
        ).join(","),
      },
    });
    socket.on("address-transaction", (address, data) => {
      handleContractEvents(data.tx);
    });

    blockchainApiClient.current = new stacks.StacksApiSocketClient(socket);
  }

  return (
    <div className="App">
      <h1>{TITLE}</h1>
      {ipfsClient ? (
        <Router>
          <Switch>
            <Route path="/" exact>
              <Home ipfsClient={ipfsClient} />
            </Route>
            <Route path="/property-info" exact>
              <PropertyInfo />
            </Route>
          </Switch>
        </Router>
      ) : (
        <Spin className="centered" size="large" />
      )}
    </div>
  );
}

export default App;
