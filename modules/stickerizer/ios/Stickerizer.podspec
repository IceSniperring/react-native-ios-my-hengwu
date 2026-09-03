Pod::Spec.new do |s|
  s.name           = 'Stickerizer'
  s.version        = '1.0.0'
  s.summary        = 'Lift subject into a white-outline sticker PNG'
  s.description    = 'Apple Vision subject lift + white stroke sticker'
  s.license        = 'MIT'
  s.author         = 'Ice'
  s.homepage       = 'https://github.com/IceSniperring/react-native-ios-my-hengwu'
  s.platforms      = { :ios => '17.0' }
  s.source         = { :git => 'https://github.com/IceSniperring/react-native-ios-my-hengwu.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
end
