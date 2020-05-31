import React from "react";
import styled from "styled-components";

const PriceStyle = styled.span`
  white-space: nowrap;
  position: ${(props) => (props.small ? "absolute" : "relative")};
  margin: 0 0 0 1.2em;
  display: inline-block;
  border-radius: 0 0.3em 0.3em 0;
  padding: 0.25em 0.7em 0.2em 0.6em;
  background: #5cb85c;
  color: #fff;
  line-height: 1;
  top: ${(props) => (props.small ? "253px" : "-3px")};
  right: ${(props) => (props.small ? "6px" : "auto")};
  font-size: ${(props) => (props.small ? "80%" : "65%")};
  font-family: "Nobel-RM", sans-serif;

  &:before {
    position: absolute;
    content: "\\25CF";
    color: #fff;
    font-size: 50%;
    line-height: 0;
    text-indent: 1.3em;
    left: -1.4em;
    top: 0;
    width: 1px;
    height: 0;
    border-right: 1.4em solid #5cb85c;
    border-top: 1.4em solid transparent;
    border-bottom: 1.4em solid transparent;
  }

  & > sup {
    top: -0.4em;
    font-size: 60%;
    padding-right: 0.2em;
  }
`;

const PriceTag = ({ small, children }) => (
  <PriceStyle small={small}>
    <sup>$</sup>
    {children}
  </PriceStyle>
);
export default PriceTag;
