Pod::Spec.new do |s|
  s.name           = 'ContextMenuKit'
  s.version        = '1.0.0'
  s.summary        = 'UIKit context menu with custom UIImage icons'
  s.description    = 'UIContextMenuInteraction + UIMenu supporting custom images (not only SF Symbols)'
  s.license        = 'MIT'
  s.author         = 'Ice'
  s.homepage       = 'https://github.com/IceSniperring/react-native-ios-my-hengwu'
  s.platforms      = { :ios => '17.0' }
  s.source         = { :git => 'https://github.com/IceSniperring/react-native-ios-my-hengwu.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
  s.resource_bundles = { 'ContextMenuKit' => ['Icons/*.png'] }
end
