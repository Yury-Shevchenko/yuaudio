import React from 'react';
import * as superagent from 'superagent';
import styled from 'styled-components';
import Layout from '../components/MyLayout';
import Recorder from '../components/Recorder';
import RecordComponent from '../components/Record';

export default class extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <Layout>
        <h1>Audio recording app</h1>
        <p>Sign up and record your audio.</p>
      </Layout>
    );
  }
}
