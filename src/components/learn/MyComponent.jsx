
import "./style.css"

const MyComponent = () => {

    // const myName = "iFanIT 1";
    // const myName = NaN;
    // const myName = [1, 2, 3];
    const myName = {
        name: "em nam",
        age: 21
    };

  return (
    <>
        <div style={{padding: 20, backgroundColor: "aqua", borderRadius: 10, boxShadow: "1px 2px 3px 0"}}>{JSON.stringify(myName)} & em Nam update</div>
        <div className="child">em name something</div>
    </>
  );
} 

export default MyComponent;  