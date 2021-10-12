import { Button } from "antd";
import "antd/dist/antd.css";
import "./HeadingButton.css";

function HeadingButton({ heading, buttonLabel, onSubmit, buttonStyle }) {
  return (
    <div className="Horizontal">
      <h3>{heading}</h3>
      <Button
        onClick={onSubmit}
        type="primary"
        htmlType="button"
        style={buttonStyle}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}

export default HeadingButton;
