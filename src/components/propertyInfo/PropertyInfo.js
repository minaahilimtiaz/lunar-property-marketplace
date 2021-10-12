import React, { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { AppConfig, UserSession } from "@stacks/connect";
import { cvToJSON, ClarityType } from "@stacks/transactions";
import { Modal, Card, Image } from "antd";
import "antd/dist/antd.css";

import SingleInputForm from "../singleInputForm/SingleInputForm";
import HeadingButton from "../headingButton/HeadingButton";
import HeadingLabel from "../headingLabel/HeadingLabel";
import "./PropertyInfo.css";
import * as ContractCalls from "../../contractCalls/contractCall";
import { getFormattedBidList, getFormattedBid } from "../../helper";
import * as CONSTANTS from "../../strings.js";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });
const { Meta } = Card;

function PropertyInfo() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [output, setOutput] = useState("");
  const [owner, setOwner] = useState("");
  const [minimumPrice, setMinimumPrice] = useState("");
  const params = useLocation();
  const history = useHistory();
  const userAddressRef = useRef("");
  const propertyRef = useRef(params.state.property);

  useEffect(async () => {
    if (userSession.isUserSignedIn()) {
      saveUserData(userSession);
      getPropertyInformation();
    } else {
      history.goBack();
    }
  }, []);

  function showOutput(output) {
    setOutput(output);
    setIsModalVisible(true);
  }
  function saveUserData(userSession) {
    userAddressRef.current =
      userSession.loadUserData().profile.stxAddress.testnet;
  }

  async function getPropertyInformation() {
    const result = await ContractCalls.getPropertyInformation(
      propertyRef.current.id,
      userAddressRef.current
    );
    if (result.value) {
      setOwner(result.value.value["seller-address"].value.toString());
      setMinimumPrice(result.value.value["min-bid"].value.toString());
    } else {
      setOwner(CONSTANTS.NOT_AVAILABLE);
      setMinimumPrice(CONSTANTS.NOT_AVAILABLE);
    }
  }

  async function getPropertyBids() {
    const result = await ContractCalls.getPropertyBids(
      propertyRef.current.id,
      userAddressRef.current
    );
    const jsonResponse = cvToJSON(result);
    console.log(getFormattedBidList(jsonResponse.value.value));
    if (result.type == ClarityType.ResponseOk)
      showOutput(JSON.stringify(getFormattedBidList(jsonResponse.value.value)));
    else showOutput(CONSTANTS.NO_RECORD_FOUND);
  }

  async function sellProperty() {
    ContractCalls.sellProperty(
      propertyRef.current.id,
      userAddressRef.current,
      showOutput
    );
  }

  async function callBid(formValues) {
    ContractCalls.callBid(
      propertyRef.current.id,
      formValues.bidPrice,
      userAddressRef.current,
      showOutput
    );
  }

  async function getHighestBid() {
    const result = await ContractCalls.getHighestBid(
      propertyRef.current.id,
      userAddressRef.current
    );
    const jsonResponse = cvToJSON(result);
    if (result.type == ClarityType.ResponseOk)
      showOutput(JSON.stringify(getFormattedBid(jsonResponse.value.value)));
    else showOutput(CONSTANTS.NO_RECORD_FOUND);
  }

  function removePropertyFromListing() {
    ContractCalls.removePropertyFromListing(propertyRef.current.id, showOutput);
  }

  function cancelListing() {
    ContractCalls.cancelListing(propertyRef.current.id, showOutput);
  }

  function closeOutputModal() {
    setIsModalVisible(false);
  }

  function renderPropertyInformationSection() {
    return (
      <div>
        <h2>Property Information</h2>
        <Card
          style={{
            width: "60%",
            display: "flex",
            flexDirection: "column",
            marginLeft: "auto",
            marginRight: "auto",
            padding: "2%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Image
              alt="example"
              style={{ width: "200px", height: "200px", resizeMode: "contain" }}
              src={propertyRef.current.imageUrl.toString()}
            />
          </div>

          <HeadingLabel
            heading={CONSTANTS.PROPERTY_ID}
            labelValue={params.state.property.id}
          />
          <HeadingLabel
            heading={CONSTANTS.ADDRESS}
            labelValue={params.state.property.address}
          />
          <HeadingLabel
            heading={CONSTANTS.AREA}
            labelValue={params.state.property.area}
          />
          <HeadingLabel heading={CONSTANTS.OWNER} labelValue={owner} />
          <HeadingLabel
            heading={CONSTANTS.MIN_PRICE}
            labelValue={minimumPrice}
          />
        </Card>
      </div>
    );
  }

  function renderMarketPlaceSection() {
    return (
      <div>
        <h2>{CONSTANTS.MARKETPLACE}</h2>
        <HeadingButton
          heading={CONSTANTS.GET_BIDS_FOR_PROPERTY}
          buttonLabel={CONSTANTS.CHECK}
          onSubmit={getPropertyBids}
        />
        <HeadingButton
          heading={CONSTANTS.GET_HIGHEST_BID}
          buttonLabel={CONSTANTS.CHECK}
          onSubmit={getHighestBid}
        />
        <HeadingButton
          heading={CONSTANTS.SELL_PROPERTY}
          buttonLabel={CONSTANTS.SUBMIT}
          onSubmit={sellProperty}
        />
        <HeadingButton
          heading={CONSTANTS.REMOVE_PROPERTY_FROM_LISTING}
          buttonLabel={CONSTANTS.SUBMIT}
          onSubmit={removePropertyFromListing}
        />
        <HeadingButton
          heading={CONSTANTS.CANCEL_LISTING}
          buttonLabel={CONSTANTS.SUBMIT}
          onSubmit={cancelListing}
        />
        <SingleInputForm
          heading={CONSTANTS.CALL_A_BID}
          label={CONSTANTS.BID_PRICE}
          elementName={"bidPrice"}
          onSubmit={callBid}
        />
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

  return (
    <div>
      {renderPropertyInformationSection()}
      {renderMarketPlaceSection()}
      {renderOutputModal()}
    </div>
  );
}

export default PropertyInfo;
