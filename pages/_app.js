import React from "react"
import Page from '../components/Page'
import Header from '../components/Header'
import App from "next/app"

class MyApp extends App {

  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }
    if (ctx.req && ctx.req.session.passport) {
      pageProps.user = ctx.req.session.passport.user;
    }
    return { pageProps };
  }

  constructor(props) {
    super(props)
    this.state = {
      user: props.pageProps.user
    }
  }

  render() {
     const { Component, pageProps } = this.props
     const props = {
       ...pageProps,
       user: this.state.user,
     }

     return (
       <Page>
        <Header user={this.state.user} />
        <Component {...props} />
       </Page>
    )
  }
}

export default MyApp;
