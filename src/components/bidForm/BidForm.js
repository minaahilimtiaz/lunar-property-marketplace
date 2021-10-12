import { Button, Form, Input} from "antd";
import "antd/dist/antd.css";
import {CALL_A_BID, PROPERTY_ID, BID_PRICE, SUBMIT, EMPTY_FIELD_ERROR} from "../../strings"

function BidForm({ onSubmitCallback }) {
  return (
      <div>
        <h3>{CALL_A_BID}</h3>
        <Form
          name="callBidForm"
          initialValues={{ remember: true }}
          autoComplete="off"
          onFinish={onSubmitCallback}
        >
          <Form.Item
            label={PROPERTY_ID}
            name="propertyId"
            rules={[{ required: true, message: { EMPTY_FIELD_ERROR } }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={BID_PRICE}
            name="bidPrice"
            rules={[{ required: true, message: { EMPTY_FIELD_ERROR } }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Button
              style={{
                display: "flex",
                marginLeft: "auto",
              }}
              type="primary"
              htmlType="submit"
            >
              {SUBMIT}
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
}

export default BidForm;
