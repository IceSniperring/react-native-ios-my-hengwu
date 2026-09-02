import type { ImageSourcePropType } from 'react-native';
import type { ProductKey } from './types';

export const PRODUCT_IMAGES: Record<ProductKey, ImageSourcePropType> = {
  macbook: require('../assets/products/macbook.jpg'),
  iphone: require('../assets/products/iphone.jpg'),
  watch: require('../assets/products/watch.jpg'),
  earbuds: require('../assets/products/earbuds.jpg'),
  headphones: require('../assets/products/headphones.jpg'),
  backpack: require('../assets/products/backpack.jpg'),
  speaker: require('../assets/products/speaker.jpg'),
  tablet: require('../assets/products/tablet.jpg'),
  controller: require('../assets/products/controller.jpg'),
  turntable: require('../assets/products/turntable.jpg'),
  motorcycle: require('../assets/products/motorcycle.jpg'),
  helmet: require('../assets/products/helmet.jpg'),
  sneaker: require('../assets/products/sneaker.jpg'),
  camera: require('../assets/products/camera.jpg'),
  gold: require('../assets/products/gold.jpg'),
  vr: require('../assets/products/vr.jpg'),
};
