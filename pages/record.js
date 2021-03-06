import React from 'react';
import * as superagent from 'superagent';
import styled from 'styled-components';
import Layout from '../components/MyLayout';
import Recorder from '../components/Recorder';
import RecordComponent from '../components/Record';

export default class extends React.Component {
  static async getInitialProps({ req }) {
    if (process.browser) {
      const list = await superagent.get('/api').then(res => res.body);
      return { list };
    }
    if (req && req.user) {
      const mongoose = require('mongoose');
      const Record = mongoose.model('record');
      const list = await Record.find({ user: req.user._id }).sort({
        createdAt: -1,
      });
      return { list };
    }
  }

  constructor() {
    super();
    this.state = {};
  }

  onUpload = data => {
    const state = this.state || {};
    const list = this.state.list || this.props.list || [];
    this.setState(
      Object.assign({}, state, {
        list: [data].concat(list),
      })
    );
  };

  remove = _id => ev => {
    superagent
      .del(`/api/${_id}`)
      .then(() => {
        const state = this.state || {};
        const list = this.state.list || this.props.list || [];
        this.setState(
          Object.assign({}, state, {
            list: list.filter(record => record._id !== _id),
          })
        );
      })
      .catch(error => console.error(error.stack));
  };

  render() {
    const list = this.state.list || this.props.list;
    return (
      <Layout>
        {this.props.user ? (
          <>
            <Recorder onUpload={this.onUpload} user={this.props.user} />
            <h1>Your records</h1>
            <div id="reading-list">
              <ul>
                {list &&
                  list.map(record => (
                    <RecordComponent
                      record={record}
                      onRemove={this.remove}
                      key={record._id}
                    />
                  ))}
              </ul>
            </div>
          </>
        ) : (
          <>
            <p>Please sign up or login first.</p>
          </>
        )}
      </Layout>
    );
  }
}
