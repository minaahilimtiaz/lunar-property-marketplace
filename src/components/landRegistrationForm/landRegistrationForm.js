import { Button, Form, Input, Upload } from "antd";
import "antd/dist/antd.css";
import { UploadOutlined } from "@ant-design/icons";
import { REGISTER_LAND_HEADING, ADDRESS, AREA, MIN_PRICE, PICTURE, UPLOAD, SUBMIT, EMPTY_FIELD_ERROR } from "../../strings"

function LandRegistrationForm({ onSubmitCallback, imageUpload}) {
  return (
      <div>
        <h3>{REGISTER_LAND_HEADING}</h3>
        <Form
          name="landRegistration"
          autoComplete="off"
          onFinish={onSubmitCallback}
        >
          <Form.Item
            label={ADDRESS}
            name="address"
            rules={[{ required: true, message: { EMPTY_FIELD_ERROR } }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={AREA}
            name="area"
            rules={[{ required: true, message: { EMPTY_FIELD_ERROR } }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={MIN_PRICE}
            name="minimumBid"
            rules={[{ required: true, message: { EMPTY_FIELD_ERROR } }]}
          >
            <Input type="number" />
          </Form.Item>

          <Form.Item
            label={PICTURE}
            name="picture"
            rules={[{ required: true, message: { EMPTY_FIELD_ERROR } }]}
          >
            <Upload
              name="image"
              accept=".jpg, .jpeg, .png"
              beforeUpload={imageUpload}
            >
              <Button icon={<UploadOutlined />}>{UPLOAD}</Button>
            </Upload>
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

export default LandRegistrationForm;
