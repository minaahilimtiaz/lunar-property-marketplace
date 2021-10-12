import { AppConfig, UserSession, openContractCall } from "@stacks/connect";
import {
  uintCV,
  callReadOnlyFunction,
  makeContractSTXPostCondition,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
  stringAsciiCV,
  cvToJSON,
  PostConditionMode,
  createAssetInfo,
  NonFungibleConditionCode,
  makeStandardFungiblePostCondition,
  makeStandardNonFungiblePostCondition,
  makeContractFungiblePostCondition,
} from "@stacks/transactions";
import BN from "bn.js";
import {
  appDetails,
  assetName,
  deployerAddress,
  explorerBaseUrl,
  marketplaceContractName,
  network,
  propertyTokenContractName,
  nftAssetName,
  tokenContractName,
  uploadDataOnServer,
} from "../helper";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });
const CONVERSION_RATE = 1000000;
const wrappedSTXAssetInfo = createAssetInfo(
  deployerAddress,
  tokenContractName,
  assetName
);

function createReadOnlyFunctionOption(
  functionName,
  contractName,
  senderAddress = deployerAddress,
  functionArgs = []
) {
  const options = {
    contractAddress: deployerAddress,
    contractName: contractName,
    functionName: functionName,
    functionArgs: functionArgs,
    network,
    senderAddress: senderAddress,
  };
  return options;
}

function createContractCallOptions(
  contractName,
  functionName,
  userSession,
  functionArguments = [],
  onSuccess
) {
  return {
    contractAddress: deployerAddress,
    contractName: contractName,
    functionName: functionName,
    functionArgs: functionArguments,
    appDetails: appDetails,
    userSession: userSession,
    network: network,
    onFinish: (data) => {
      onSuccess(explorerBaseUrl.concat(data.txId.toString()));
    },
    onCancel: () => {
      alert("You cancelled the request");
    },
  };
}

function createStandardFungibleAssetPostCondition(
  senderAddress,
  amount,
  conditionCode
) {
  const postConditionAmount = new BN(amount);
  const fungiblePostCondition = makeStandardFungiblePostCondition(
    senderAddress,
    conditionCode,
    postConditionAmount,
    wrappedSTXAssetInfo
  );
  return fungiblePostCondition;
}

function createContractFungibleAssetPostCondition(contractName, amount) {
  const postConditionAmount = new BN(amount);
  const contractFungiblePostCondition = makeContractFungiblePostCondition(
    deployerAddress,
    contractName,
    FungibleConditionCode.Equal,
    postConditionAmount,
    wrappedSTXAssetInfo
  );
  return contractFungiblePostCondition;
}

function createNonFungibleAssetPostCondition(ownerAddress, tokenId) {
  const nonFungibleAssetInfo = createAssetInfo(
    deployerAddress,
    propertyTokenContractName,
    nftAssetName
  );

  const standardNonFungiblePostCondition = makeStandardNonFungiblePostCondition(
    ownerAddress,
    NonFungibleConditionCode.DoesNotOwn,
    nonFungibleAssetInfo,
    uintCV(tokenId)
  );

  return standardNonFungiblePostCondition;
}

export async function getWrappedSTX(userAddress, amount, onFinishCallBack) {
  const options = createContractCallOptions(
    marketplaceContractName,
    "get-wrapped-stx",
    userSession,
    [uintCV(amount)],
    onFinishCallBack
  );
  const stxPostCondition = makeStandardSTXPostCondition(
    userAddress,
    FungibleConditionCode.Equal,
    amount * CONVERSION_RATE
  );
  options.postConditions = [stxPostCondition];
  await openContractCall(options);
}

export async function redeemWrappedSTX(amount, userAddress, onFinishCallBack) {
  const options = createContractCallOptions(
    marketplaceContractName,
    "redeem-wrapped-stx",
    userSession,
    [uintCV(amount)],
    onFinishCallBack
  );
  const stxPostCondition = makeContractSTXPostCondition(
    deployerAddress,
    tokenContractName,
    FungibleConditionCode.Equal,
    amount * CONVERSION_RATE
  );
  const fungibleAssetPostCondition = createStandardFungibleAssetPostCondition(
    userAddress,
    amount,
    FungibleConditionCode.Equal
  );
  options.postConditions = [stxPostCondition, fungibleAssetPostCondition];
  await openContractCall(options);
}

export async function registerProperty(
  ipfsClient,
  formValues,
  onFinishCallBack
) {
  const minimumBid = formValues.minimumBid;
  const tokenUri = await uploadDataOnServer(ipfsClient, formValues);
  const options = createContractCallOptions(
    marketplaceContractName,
    "register-property-for-sale",
    userSession,
    [uintCV(minimumBid), stringAsciiCV(tokenUri)],
    onFinishCallBack
  );
  await openContractCall(options);
}

export async function callBid(
  propertyId,
  bidPrice,
  userAddress,
  onFinishCallBack
) {
  const options = createContractCallOptions(
    marketplaceContractName,
    "make-a-bid",
    userSession,
    [uintCV(propertyId), uintCV(bidPrice)],
    onFinishCallBack
  );
  const wrappedSTXTransferCondition = createStandardFungibleAssetPostCondition(
    userAddress,
    bidPrice,
    FungibleConditionCode.Equal
  );
  options.postConditions = [wrappedSTXTransferCondition];
  await openContractCall(options);
}

export async function getPendingFundAmount(userAddress) {
  const callOptions = createReadOnlyFunctionOption(
    "get-pending-funds-amount",
    marketplaceContractName,
    userAddress,
    []
  );
  const result = await callReadOnlyFunction(callOptions);
  return result.value.toString();
}

export async function claimPendingFunds(userAddress, onFinishCallBack) {
  const options = createContractCallOptions(
    marketplaceContractName,
    "return-pending-funds",
    userSession,
    [],
    onFinishCallBack
  );
  const pendingFunds = await getPendingFundAmount(userAddress);
  const contractFungiblePostCondition =
    createContractFungibleAssetPostCondition(
      marketplaceContractName,
      pendingFunds
    );

  options.postConditions = [contractFungiblePostCondition];
  await openContractCall(options);
}

export async function getPropertyInformation(propertyId, userAddress) {
  const callOptions = createReadOnlyFunctionOption(
    "get-property-info",
    marketplaceContractName,
    userAddress,
    [uintCV(propertyId)]
  );
  const result = await callReadOnlyFunction(callOptions);
  const jsonResponse = cvToJSON(result);
  return jsonResponse;
}

export async function getPropertyOwner(propertyId, userAddress) {
  const callOptions = createReadOnlyFunctionOption(
    "get-owner",
    propertyTokenContractName,
    userAddress,
    [uintCV(propertyId)]
  );
  const result = await callReadOnlyFunction(callOptions);
  const jsonResponse = cvToJSON(result);
  return jsonResponse;
}

export async function getPropertyBids(propertyId, userAddress) {
  const callOptions = createReadOnlyFunctionOption(
    "get-bids-for-property",
    marketplaceContractName,
    userAddress,
    [uintCV(propertyId)]
  );
  const result = await callReadOnlyFunction(callOptions);
  return result;
}

export async function sellProperty(propertyId, userAddress, onFinishCallBack) {
  const options = createContractCallOptions(
    marketplaceContractName,
    "sell-out-property",
    userSession,
    [uintCV(propertyId)],
    onFinishCallBack
  );
  const nonFungibleAssetPostCondition = createNonFungibleAssetPostCondition(
    userAddress,
    propertyId
  );
  options.postConditionMode = PostConditionMode.Allow;
  options.postConditions = [nonFungibleAssetPostCondition];
  await openContractCall(options);
}

export async function getHighestBid(propertyId, userAddress) {
  const callOptions = createReadOnlyFunctionOption(
    "find-highest-offer",
    marketplaceContractName,
    userAddress,
    [uintCV(propertyId)]
  );
  const result = await callReadOnlyFunction(callOptions);
  return result;
}

export async function removePropertyFromListing(propertyId, onFinishCallBack) {
  const options = createContractCallOptions(
    marketplaceContractName,
    "remove-property-from-listing",
    userSession,
    [uintCV(propertyId)],
    onFinishCallBack
  );
  await openContractCall(options);
}

export async function cancelListing(propertyId, onFinishCallBack) {
  const options = createContractCallOptions(
    marketplaceContractName,
    "cancel-listing",
    userSession,
    [uintCV(propertyId)],
    onFinishCallBack
  );
  await openContractCall(options);
}
