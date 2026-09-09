import ExpoModulesCore
import UIKit

/// Attaches UIContextMenuInteraction to a real React Native view.
/// Long-press is handled by UIKit — custom UIImage icons work (not only SF).
public final class ContextMenuKitModule: Module {
  private var presenters: [Int: ContextMenuInteractionDelegate] = [:]

  public func definition() -> ModuleDefinition {
    Name("ContextMenuKit")

    Events("onSelect")

    OnCreate {
      NSLog("[ContextMenuKit] module created")
    }

    AsyncFunction("attachMenu") { (viewTag: Int, sections: [[Any]]) in
      NSLog("[ContextMenuKit] attachMenu tag=%d sections=%d", viewTag, sections.count)
      DispatchQueue.main.async { [weak self] in
        guard let self else { return }
        guard let view = self.appContext?.findView(withTag: viewTag, ofType: UIView.self) else {
          NSLog("[ContextMenuKit] no view for tag %d", viewTag)
          return
        }

        // Remove previous context menu from this view.
        for interaction in view.interactions {
          if interaction is UIContextMenuInteraction {
            view.removeInteraction(interaction)
          }
        }

        let parsed = sections.compactMap { raw -> [ContextMenuKitItem]? in
          let items = (raw as? [[String: Any]] ?? []).compactMap(ContextMenuKitItem.init(dict:))
          return items.isEmpty ? nil : items
        }
        NSLog("[ContextMenuKit] parsed groups=%d", parsed.count)

        let delegate = ContextMenuInteractionDelegate(sections: parsed) { [weak self] id in
          NSLog("[ContextMenuKit] selected %@ on tag %d", id, viewTag)
          self?.sendEvent("onSelect", ["id": id, "viewTag": viewTag])
        }
        let interaction = UIContextMenuInteraction(delegate: delegate)
        view.addInteraction(interaction)
        self.presenters[viewTag] = delegate
        NSLog("[ContextMenuKit] interaction attached to %d", viewTag)
      }
    }

    AsyncFunction("detachMenu") { (viewTag: Int) in
      DispatchQueue.main.async { [weak self] in
        guard let self else { return }
        if let view = self.appContext?.findView(withTag: viewTag, ofType: UIView.self) {
          for interaction in view.interactions where interaction is UIContextMenuInteraction {
            view.removeInteraction(interaction)
          }
        }
        self.presenters[viewTag] = nil
      }
    }
  }
}

final class ContextMenuInteractionDelegate: NSObject, UIContextMenuInteractionDelegate {
  private let sections: [[ContextMenuKitItem]]
  private let onSelect: (String) -> Void

  init(sections: [[ContextMenuKitItem]], onSelect: @escaping (String) -> Void) {
    self.sections = sections
    self.onSelect = onSelect
    super.init()
  }

  func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    configurationForMenuAtLocation location: CGPoint
  ) -> UIContextMenuConfiguration? {
    NSLog("[ContextMenuKit] configurationForMenuAtLocation")
    return UIContextMenuConfiguration(
      identifier: nil,
      previewProvider: nil
    ) { [weak self] _ in
      self?.buildMenu()
    }
  }

  private func buildMenu() -> UIKit.UIMenu {
    let groups: [UIKit.UIMenu] = sections.map { section in
      let actions: [UIAction] = section.map { item in
        var attributes: UIAction.Attributes = []
        if item.destructive {
          attributes.insert(.destructive)
        }
        return UIAction(
          title: item.title,
          image: item.loadImage(),
          attributes: attributes
        ) { [weak self] _ in
          self?.onSelect(item.id)
        }
      }
      return UIKit.UIMenu(title: "", options: .displayInline, children: actions)
    }
    return UIKit.UIMenu(children: groups)
  }
}

struct ContextMenuKitItem {
  let id: String
  let title: String
  let iconName: String?
  let imageUri: String?
  let destructive: Bool

  init?(dict: [String: Any]) {
    guard let id = dict["id"] as? String,
          let title = dict["title"] as? String else { return nil }
    self.id = id
    self.title = title
    self.iconName = dict["iconName"] as? String
    self.imageUri = dict["imageUri"] as? String
    self.destructive = (dict["destructive"] as? Bool) ?? false
  }

  func loadImage() -> UIImage? {
    var raw: UIImage?
    // 1) Bundled PNG in ContextMenuKit resource bundle (reliable in dev + prod).
    if let iconName,
       let bundle = Self.resourceBundle(),
       let url = bundle.url(forResource: iconName, withExtension: "png"),
       let image = UIImage(contentsOfFile: url.path) {
      NSLog("[ContextMenuKit] loaded bundled icon %@", iconName)
      raw = image
    }
    // 2) file:// path (release/dev file assets).
    if raw == nil, let imageUri {
      var path = imageUri
      if path.hasPrefix("file://"), let url = URL(string: path) {
        path = url.path
      }
      if let image = UIImage(contentsOfFile: path) {
        raw = image
      } else if path.hasPrefix("http"), let url = URL(string: path),
                let data = try? Data(contentsOf: url),
                let image = UIImage(data: data) {
        raw = image
      }
    }
    guard let raw else { return nil }
    return Self.scaledTemplate(raw, to: 20)
  }

  /// UIMenu leading icons are ~20pt. Downscale oversized bitmaps.
  private static func scaledTemplate(_ image: UIImage, to points: CGFloat) -> UIImage? {
    let target = CGSize(width: points, height: points)
    if image.size.width <= points + 1 && image.size.height <= points + 1 {
      return image.withRenderingMode(.alwaysTemplate)
    }
    let format = UIGraphicsImageRendererFormat()
    format.scale = UIScreen.main.scale
    format.opaque = false
    let renderer = UIGraphicsImageRenderer(size: target, format: format)
    let out = renderer.image { _ in
      image.draw(in: CGRect(origin: .zero, size: target))
    }
    return out.withRenderingMode(.alwaysTemplate)
  }

  private static func resourceBundle() -> Bundle? {
    let candidates = [
      Bundle(for: ContextMenuKitModule.self),
      Bundle.main,
    ]
    for base in candidates {
      if let url = base.url(forResource: "ContextMenuKit", withExtension: "bundle"),
         let bundle = Bundle(url: url) {
        return bundle
      }
    }
    return Bundle(for: ContextMenuKitModule.self)
  }
}
