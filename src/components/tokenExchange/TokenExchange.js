import "antd/dist/antd.css";
import * as CONSTANTS from "../../strings"
import SingleInputForm from "../singleInputForm/SingleInputForm";

function TokenExchange({ getWrappedSTXCallback, redeemWrappedSTXCallback}) {
  return (
      <div>
        <h2>{CONSTANTS.TOKEN_EXCHANGE_HEADING}</h2>
        <SingleInputForm
          heading={CONSTANTS.GET_WRAPPED_STX}
          label={CONSTANTS.TOKENS_AMOUNT}
          elementName={"wrappedSTXAmount"}
          onSubmit={getWrappedSTXCallback}
        />
        <SingleInputForm
          heading={CONSTANTS.REDEEM_WRAPPED_STX}
          label={CONSTANTS.TOKENS_AMOUNT}
          elementName={"wrappedSTXAmount"}
          onSubmit={redeemWrappedSTXCallback}
        />
      </div>
    );
}

export default TokenExchange;
