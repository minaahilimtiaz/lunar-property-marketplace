import "antd/dist/antd.css";
import "./HeadingLabel.css";

function HeadingLabel({ heading, labelValue }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: "2.5%",
        marginTop: "2.5%",
      }}
    >
      <h3>{heading}</h3>
      <p>{labelValue}</p>
    </div>
  );
}

export default HeadingLabel;
