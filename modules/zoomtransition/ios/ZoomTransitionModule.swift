import ExpoModulesCore
import UIKit

/// Shared source frame for the next push/pop zoom (window coordinates).
@objc public class ZoomTransitionState: NSObject {
  @objc public static var frame: CGRect = .null
  @objc public static var radius: CGFloat = 18

  @objc public static func set(x: Double, y: Double, w: Double, h: Double, radius: Double) {
    frame = CGRect(x: x, y: y, width: w, height: h)
    self.radius = CGFloat(radius)
  }

  public static func consume() -> CGRect? {
    guard !frame.isNull else { return nil }
    return frame
  }

  @objc public static func clear() {
    frame = .null
  }
}

public final class ZoomTransitionModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ZoomTransition")

    OnCreate {
      ZoomTransitionSwizzle.install()
      NSLog("[ZoomTransition] swizzle installed")
    }

    Function("setSourceFrame") { (x: Double, y: Double, width: Double, height: Double, radius: Double) in
      ZoomTransitionState.set(x: x, y: y, w: width, h: height, radius: radius)
      NSLog("[ZoomTransition] frame (%.1f,%.1f,%.1f,%.1f)", x, y, width, height)
    }

    Function("clearSourceFrame") {
      ZoomTransitionState.clear()
    }
  }
}
