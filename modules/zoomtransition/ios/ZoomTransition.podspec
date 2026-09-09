Pod::Spec.new do |s|
  s.name           = 'ZoomTransition'
  s.version        = '1.0.0'
  s.summary        = 'App-icon style zoom push/pop for react-native-screens'
  s.description    = 'Custom UIViewController zoom transition that keeps interactive swipe-back'
  s.license        = 'MIT'
  s.author         = 'Ice'
  s.homepage       = 'https://github.com/IceSniperring/react-native-ios-my-hengwu'
  s.platforms      = { :ios => '17.0' }
  s.source         = { :git => 'https://github.com/IceSniperring/react-native-ios-my-hengwu.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.{swift,h,m,mm}'
end
