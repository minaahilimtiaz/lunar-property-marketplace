import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Card, Image, List, Modal} from "antd";
import "antd/dist/antd.css";
import { AppConfig, UserSession, showConnect } from "@stacks/connect";

import { appDetails, getFormattedPropertyData } from "../../helper";
import * as ContractCalls from "../../contractCalls/contractCall.js";
import * as CONSTANTS from "../../strings.js";
import { db } from "../../firebase/firebase";
import TokenExchange from "../tokenExchange/TokenExchange";
import BidForm from "../bidForm/BidForm";
import LandRegistrationForm from "../landRegistrationForm/landRegistrationForm";
import "./Home.css";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

function Home({ ipfsClient }) {
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [output, setOutput] = useState("");
  const [properties, setProperties] = useState([]);
  const [pendingFunds, setPendingFunds] = useState(0);
  const propertiesList = useRef([]);
  const userAddressRef = useRef("");
  const history = useHistory();

  useEffect(async () => {
    if (userSession.isUserSignedIn()) {
      saveUserData(userSession);
    }
  }, []);

  useEffect(async () => {
    fetchProperties();
  }, []);

  useEffect(async () => {
    if (userSession.isUserSignedIn()) {
      getPendingFunds();
    }
  });

  async function fetchProperties() {
    const data = await db.collection("properties").get();
    data.docs.forEach(async (item) => {
      const propertyInfo = await getFormattedPropertyData(ipfsClient, item);
      propertiesList.current = [...propertiesList.current, propertyInfo];
      setProperties(propertiesList.current);
    });
  }

  function getWrappedSTX(formValues) {
    ContractCalls.getWrappedSTX(
      userAddressRef.current,
      formValues.wrappedSTXAmount,
      showOutput
    );
  }

  function registerProperty(formValues) {
    ContractCalls.registerProperty(ipfsClient, formValues, showOutput);
  }

  function callBid(formValues) {
    ContractCalls.callBid(
      formValues.propertyId,
      formValues.bidPrice,
      userAddressRef.current,
      showOutput
    );
  }

  function claimPendingFunds() {
    ContractCalls.claimPendingFunds(userAddressRef.current, showOutput);
  }

  function redeemWrappedSTX(formValues) {
    ContractCalls.redeemWrappedSTX(
      formValues.wrappedSTXAmount,
      userAddressRef.current,
      showOutput
    );
  }

  async function getPendingFunds() {
    const funds = await ContractCalls.getPendingFundAmount(
      userAddressRef.current
    );
    setPendingFunds(funds);
  }

  function showOutput(output) {
    setOutput(output);
    setIsModalVisible(true);
  }
  function saveUserData(userSession) {
    userAddressRef.current =
      userSession.loadUserData().profile.stxAddress.testnet;
    if (userAddressRef.current !== "") {
      setIsUserSignedIn(true);
    } else {
      setIsUserSignedIn(false);
    }
  }

  async function showAuthenticationPopup() {
    showConnect({
      appDetails: appDetails,
      redirectTo: "/",
      onFinish: () => {
        saveUserData(userSession);
      },
      userSession: userSession,
    });
  }

  const handleImage = (file) => {
    return false;
  };

  function closeOutputModal() {
    setIsModalVisible(false);
  }

  function signOut() {
    userSession.signUserOut();
    setIsUserSignedIn(false);
  }
  function renderUserInformation() {
    return (
      <div className="HorizontalContainer">
        <h3>User Address: {userAddressRef.current}</h3>
        <Button
          onClick={signOut}
          type="primary"
          htmlType="button"
          style={{ width: "13%" }}
        >
          {CONSTANTS.SIGN_OUT}
        </Button>
      </div>
    );
  }

  function renderTokenExchangeSection() {
    return (
      <TokenExchange getWrappedSTXCallback={getWrappedSTX}  redeemWrappedSTXCallback={redeemWrappedSTX}/>
    );
  }

  function renderListedProperties() {
    return (
      <div>
        <h2>Listed Properties</h2>
        <List
          size="large"
          grid={{ column: 3 }}
          dataSource={properties}
          renderItem={renderPropertyItem}
        />
      </div>
    );
  }

  function renderMarketPlaceSection() {
    return (
      <div>
        <h2>{CONSTANTS.MARKETPLACE}</h2>
        <LandRegistrationForm onSubmitCallback={registerProperty} imageUpload={handleImage}/>
        <BidForm onSubmitCallback={callBid }/>
      </div>
    );
  }

  function renderPendingFundSection() {
    return (
      <div className="HorizontalContainer">
        <h3>Pending Balance: {pendingFunds}</h3>
        <Button
          type="primary"
          htmlType="submit"
          onClick={claimPendingFunds}
          style={{ width: "13%" }}
        >
          {CONSTANTS.CLAIM}
        </Button>
      </div>
    );
  }

  function showAuthenticationSection() {
    return (
      <div>
        <p>{CONSTANTS.MARKETPLACE_INFO}</p>
        <br />
        <Button
          className="center-button"
          type="primary"
          style={{ display: "flex", margin: "auto" }}
          onClick={showAuthenticationPopup}
          size="large"
        >
          Authenticate
        </Button>
      </div>
    );
  }

  function renderOutputModal() {
    return (
      <Modal
        title="Output"
        visible={isModalVisible}
        onOk={closeOutputModal}
        onCancel={closeOutputModal}
      >
        <p>{output}</p>
      </Modal>
    );
  }

  function renderPropertyItem(property) {
    return (
      <List.Item
        onClick={() => {
          history.push("/property-info", { property: property });
        }}
      >
        <Card
          hoverable
          title={property.id}
          style={{
            width: "100%",
            height: "50%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "5%",
            }}
          >
            <Image
              alt="example"
              style={{ width: "200px", height: "200px", resizeMode: "contain" }}
              src={property.imageUrl.toString()}
            />
          </div>
          <p>Address: {property.address}</p>
          <p>Area: {property.area}</p>
        </Card>
      </List.Item>
    );
  }

  return (
    <div>
      {isUserSignedIn ? (
        <div>
          {renderUserInformation()}
          {renderPendingFundSection()}
          {renderTokenExchangeSection()}
          {renderMarketPlaceSection()}
          {renderListedProperties()}
          {renderOutputModal()}
        </div>
      ) : (
        showAuthenticationSection()
      )}
    </div>
  );
}

export default Home;
