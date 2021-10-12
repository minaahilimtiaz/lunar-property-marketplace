import { Button, Form, Input } from "antd";
import "antd/dist/antd.css";
import styles from "./SingleInputForm.css";
import { EMPTY_FIELD_ERROR } from "../../strings.js";

function SingleInputForm({ heading, elementName, label, onSubmit }) {
  return (
    <div>
      <h3>{heading}</h3>
      <Form autoComplete="off" style={styles.formMargin} onFinish={onSubmit}>
        <Form.Item
          label={label}
          name={elementName}
          rules={[{ required: true, message: EMPTY_FIELD_ERROR }]}
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
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default SingleInputForm;
