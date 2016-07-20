import React, { Component } from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native'

import ImageRotate from 'react-native-image-rotate';

export default class Thumbnails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      angles: []
    }
  }

  rotateImg(deg, index) {
    // console.log('angle: ', angle);
    // console.log('image: ', image);

    // ImageRotate.rotateImage(
    //   image,
    //   angle,
    //   (uri) => {
    //     console.log(uri);
    //   },
    //   (error) => {
    //     console.error(error);
    //   }
    // )
    const temp = this.state.angles
    temp[index] = (this.state.angles[index] == 270 || this.state.angles[index] == -270) ? 0 : this.state.angles[index] + deg
    this.setState({
      angles: temp
    })
  }

  render() {
    const { urls, measuredSize } = this.props
    const title = urls.length != 0 ? <Text style={styles.title}>Thumbnails:</Text> : null

    return (
      <View>
        { title }

        { urls.map(function(uri, index) {
          if (!this.state.angles[index]) {
            const temp = this.state.angles
            temp[index] = 0
          }
          return (
            <View key={uri}>
              <View style={styles.btnWrapp}>
                <TouchableHighlight style={styles.button} onPress={() => this.rotateImg(90, index)} >
                  <Text style={styles.text}>ROTATE +90deg</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.button} onPress={() => this.rotateImg(-90, index)} >
                  <Text style={styles.text}>ROTATE -90deg</Text>
                </TouchableHighlight>
              </View>
              <Image source={{uri: uri}} style={[styles.imageCropper, measuredSize, {transform: [{rotate: this.state.angles[index] + 'deg'}]}]} />
            </View>
          )
        }.bind(this)) }
      </View>
    )
  }
}

var styles = StyleSheet.create({
  imageCropper: {
    alignSelf: 'center',
    marginTop: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  btnWrapp: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    alignSelf: 'center',
    backgroundColor: 'red',
    padding: 5,
    margin: 5,
    marginBottom: 0,
  },
  text: {
    color: 'white',
  },
});
