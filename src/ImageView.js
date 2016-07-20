import React, { Component } from 'react'
import {
  CameraRoll,
  Image,
  ImageEditor,
  NativeModules,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  UIManager,
  View,
} from 'react-native'

import Thumbnails from './Thumbnails'

var PAGE_SIZE = 20;

type ImageOffset = {
  x: number;
  y: number;
};

type ImageSize = {
  width: number;
  height: number;
};

type ImageCropData = {
  offset: ImageOffset;
  size: ImageSize;
  displaySize?: ?ImageSize;
  resizeMode?: ?any;
};

export default class SquareImageCropper extends Component {
  state: any;
  _isMounted: boolean;
  _transformData: ImageCropData;

  constructor(props) {
    super(props);
    this._isMounted = true;
    this.state = {
      randomPhoto: require('image!boat'),
      measuredSize: null,
      croppedImageURI: [],
      cropError: null,
    };
  }

  _reset() {
    this.setState({
      randomPhoto: require('image!boat'),
      croppedImageURI: [],
      cropError: null,
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    if (!this.state.measuredSize) {
      return (
        <View
          style={styles.container}
          onLayout={(event) => {
            var measuredWidth = event.nativeEvent.layout.width;
            if (!measuredWidth) {
              return;
            }
            this.setState({
              measuredSize: {width: measuredWidth, height: measuredWidth},
            });
          }}
        />
      );
    }

    if (!this.state.randomPhoto) {
      return (
        <View style={styles.container} />
      );
    }
    var error = null;
    if (this.state.cropError) {
      error = (
        <Text style={styles.title}>{this.state.cropError.message}</Text>
      );
    }

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Drag the image within the square to crop:</Text>
        <ImageCropper
          image={this.state.randomPhoto}
          size={this.state.measuredSize}
          style={[styles.imageCropper, this.state.measuredSize]}
          onTransformDataChange={(data) => this._transformData = data}
        />
        <TouchableHighlight
          style={styles.cropButtonTouchable}
          onPress={this._crop.bind(this)}>
          <View style={styles.cropButton}>
            <Text style={styles.cropButtonLabel}>
              Crop
            </Text>
          </View>
        </TouchableHighlight>
        {error}
        <Thumbnails urls={this.state.croppedImageURI} measuredSize={this.state.measuredSize} />
      </ScrollView>
    );
  }

  _crop() {
    let croppedImageURITemp = this.state.croppedImageURI

    ImageEditor.cropImage(
      this.state.randomPhoto.uri,
      this._transformData,
      (croppedImageURI) => {
        croppedImageURITemp.push(croppedImageURI)
        this.setState({
          croppedImageURI: croppedImageURITemp
        })
      },
      (cropError) => this.setState({cropError})
    );
  }

}

class ImageCropper extends Component {
  _contentOffset: ImageOffset;
  _maximumZoomScale: number;
  _minimumZoomScale: number;
  _scaledImageSize: ImageSize;
  _horizontal: boolean;

  componentWillMount() {
    // Scale an image to the minimum size that is large enough to completely
    // fill the crop box.
    var widthRatio = this.props.image.width / this.props.size.width;
    var heightRatio = this.props.image.height / this.props.size.height;
    this._horizontal = widthRatio > heightRatio;
    if (this._horizontal) {
      this._scaledImageSize = {
        width: this.props.image.width / heightRatio,
        height: this.props.size.height,
      };
    } else {
      this._scaledImageSize = {
        width: this.props.size.width,
        height: this.props.image.height / widthRatio,
      };
      if (Platform.OS === 'android') {
        // hack to work around Android ScrollView a) not supporting zoom, and
        // b) not supporting vertical scrolling when nested inside another
        // vertical ScrollView (which it is, when displayed inside UIExplorer)
        this._scaledImageSize.width *= 2;
        this._scaledImageSize.height *= 2;
        this._horizontal = true;
      }
    }
    this._contentOffset = {
      x: (this._scaledImageSize.width - this.props.size.width) / 2,
      y: (this._scaledImageSize.height - this.props.size.height) / 2,
    };
    this._maximumZoomScale = Math.min(
      this.props.image.width / this._scaledImageSize.width,
      this.props.image.height / this._scaledImageSize.height
    );
    this._minimumZoomScale = Math.max(
      this.props.size.width / this._scaledImageSize.width,
      this.props.size.height / this._scaledImageSize.height
    );
    this._updateTransformData(
      this._contentOffset,
      this._scaledImageSize,
      this.props.size
    );
  }

  _onScroll(event) {
    this._updateTransformData(
      event.nativeEvent.contentOffset,
      event.nativeEvent.contentSize,
      event.nativeEvent.layoutMeasurement
    );
  }

  _updateTransformData(offset, scaledImageSize, croppedImageSize) {
    var offsetRatioX = offset.x / scaledImageSize.width;
    var offsetRatioY = offset.y / scaledImageSize.height;
    var sizeRatioX = croppedImageSize.width / scaledImageSize.width;
    var sizeRatioY = croppedImageSize.height / scaledImageSize.height;

    var cropData: ImageCropData = {
      offset: {
        x: this.props.image.width * offsetRatioX,
        y: this.props.image.height * offsetRatioY,
      },
      size: {
        width: this.props.image.width * sizeRatioX,
        height: this.props.image.height * sizeRatioY,
      },
    };
    this.props.onTransformDataChange && this.props.onTransformDataChange(cropData);
  }

  render() {
    return (
      <ScrollView
        alwaysBounceVertical={true}
        automaticallyAdjustContentInsets={false}
        contentOffset={this._contentOffset}
        decelerationRate="fast"
        horizontal={this._horizontal}
        maximumZoomScale={this._maximumZoomScale}
        minimumZoomScale={this._minimumZoomScale}
        onMomentumScrollEnd={this._onScroll.bind(this)}
        onScrollEndDrag={this._onScroll.bind(this)}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}>
        <Image source={this.props.image} style={this._scaledImageSize} />
      </ScrollView>
    );
  }

}

exports.framework = 'React';
exports.title = 'ImageEditor';
exports.description = 'Cropping and scaling with ImageEditor';
exports.examples = [{
  title: 'Image Cropping',
  render() {
    return <SquareImageCropper/>;
  }
}];

var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageCropper: {
    alignSelf: 'center',
    marginTop: 12,
  },
  cropButtonTouchable: {
    alignSelf: 'center',
    marginTop: 12,
  },
  cropButton: {
    padding: 12,
    backgroundColor: 'blue',
    borderRadius: 4,
  },
  cropButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
