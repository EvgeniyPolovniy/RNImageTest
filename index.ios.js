/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ImageView from './src/ImageView'

const paddingApp = 20

class rnImage extends Component {
  render() {
    return (
      <View style={styles.container}>
        <StatusBar />
        <ImageView />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: paddingApp,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#F5FCFF',
  },
});

AppRegistry.registerComponent('rnImage', () => rnImage);
