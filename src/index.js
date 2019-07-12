import React from "react";
import ReactDOM from "react-dom";
import Chart from './components/Chart'

class App extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Chart />
      </React.Fragment>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
