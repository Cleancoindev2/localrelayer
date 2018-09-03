import React, {
  Component,
} from 'react';
import {
  coreMocks,
} from 'instex-core';
import styled from 'styled-components';
import ReactJson from 'react-json-view';

export default class GetOrderConfig extends Component {
  constructor() {
    super();
    this.state = {
      show: false,
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      show: !this.state.show,
    });
  }

  render() {
    return (
      <Wrapper>
        <Button onClick={this.toggle}>getOrderConfig</Button>
        {this.state.show
          ? <ReactJson src={coreMocks.getOrderConfig()} />
          : null}
      </Wrapper>
    );
  }
}

const Button = styled.button`
  background: #000;
  color: #fff;
  border:0;
  padding: 10px 30px;
  margin: 20px 0px;
`;

const Wrapper = styled.div`
  margin-left: 50px;
`;