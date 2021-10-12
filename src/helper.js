import { StacksTestnet } from "@stacks/network";
import { cvToJSON, hexToCV } from "@stacks/transactions";
import { saveProperty, deleteProperty } from "./firebase/firebase";

export const socketUrl = "https://stacks-node-api.testnet.stacks.co/";
export const deployedContractAddress =
  "ST1ABV23F0DXCEAFBYBHAX9T2NM51MC19Q4K6JDY9.lunar-property-marketplace";
export const deployerAddress = "ST1ABV23F0DXCEAFBYBHAX9T2NM51MC19Q4K6JDY9";
export const marketplaceContractName = "lunar-property-marketplace";
export const propertyTokenContractName = "lunar-property-nft";
export const tokenContractName = "wrapped-stx-ft";
export const ipfsBaseUrl = "https://gateway.ipfs.io/ipfs/";
export const explorerBaseUrl = "https://explorer.stacks.co/txid/0x";
export const appDetails = {
  name: "Lunar Property Marketplace",
  icon: window.location.origin + "/marketplace.png",
};
export const network = new StacksTestnet();
export const assetName = "wrapped-stx";
export const nftAssetName = "luna-nft";

export async function uploadDataOnServer(ipfs, formValues) {
  const pictureUrl = await ipfs.add(formValues.picture.file);
  const tokenUri = {
    address: formValues.address.toString(),
    area: formValues.area.toString(),
    image: (ipfsBaseUrl + pictureUrl.cid).toString(),
  };
  const tokenUriUrl = await ipfs.add(JSON.stringify(tokenUri));
  return ipfsBaseUrl.concat(tokenUriUrl.cid);
}

export async function getFormattedPropertyData(ipfs, item) {
  const dataUrl = item.data().uri.toString();
  const stream = ipfs.cat(
    dataUrl.substring(ipfsBaseUrl.length, dataUrl.length)
  );
  let utf8decoder = new TextDecoder();
  let data = [];
  for await (const chunk of stream) {
    data.push(chunk);
  }
  const stringData = utf8decoder.decode(data[0]);
  const jsonResponse = JSON.parse(stringData);
  const propertyInfo = {
    id: item.id,
    address: jsonResponse.address,
    area: jsonResponse.area,
    imageUrl: jsonResponse.image,
  };
  return propertyInfo;
}

export function getFormattedBid(bid) {
  const result = { price: bid.price.value, principal: bid.buyer.value };
  return result;
}

export function getFormattedBidList(bidList) {
  const result = [];
  bidList.forEach((element) => {
    result.push(getFormattedBid(element.value));
  });
  return result;
}

function savePropertyInDb(transaction) {
  const idCV = hexToCV(transaction.tx_result.hex);
  const jsonValue = cvToJSON(idCV);
  const urlCV = hexToCV(transaction.contract_call.function_args[1].hex);
  const jsonUrl = cvToJSON(urlCV);
  saveProperty(jsonValue.value.value, jsonUrl.value);
}

export async function handleContractEvents(transaction) {
  if (
    transaction.tx_status == "success" &&
    transaction.tx_type == "contract_call"
  ) {
    if (
      transaction.contract_call.function_name == "register-property-for-sale"
    ) {
      savePropertyInDb(transaction);
    } else if (
      transaction.contract_call.function_name ==
        "remove-property-from-listing" ||
      transaction.contract_call.function_name == "sell-out-property" ||
      transaction.contract_call.function_name == "cancel-listing"
    ) {
      const idCV = hexToCV(transaction.contract_call.function_args[0].hex);
      const jsonId = cvToJSON(idCV);
      deleteProperty(jsonId.value);
    }
  }
}
