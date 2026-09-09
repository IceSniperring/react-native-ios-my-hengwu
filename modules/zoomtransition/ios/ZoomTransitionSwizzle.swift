import UIKit
import ObjectiveC

/// Injects app-icon zoom into RNSScreenStackAnimator while keeping interactive pop.
@objc public class ZoomTransitionSwizzle: NSObject {
  private static var installed = false
  private static var inFlight: UIViewPropertyAnimator?

  @objc public static func install() {
    guard !installed else { return }
    installed = true

    guard let cls = NSClassFromString("RNSScreenStackAnimator") else {
      NSLog("[ZoomTransition] RNSScreenStackAnimator not found")
      return
    }

    let originalSel = NSSelectorFromString("animateTransition:")
    guard let original = class_getInstanceMethod(cls, originalSel) else {
      NSLog("[ZoomTransition] animateTransition not found")
      return
    }

    let originalIMP = method_getImplementation(original)
    typealias Fn = @convention(c) (AnyObject, Selector, UIViewControllerContextTransitioning) -> Void
    let originalFn = unsafeBitCast(originalIMP, to: Fn.self)

    let newIMP: @convention(block) (AnyObject, UIViewControllerContextTransitioning) -> Void = { obj, ctx in
      if !ZoomTransitionState.frame.isNull {
        ZoomTransitionSwizzle.runZoom(animator: obj, context: ctx)
      } else {
        originalFn(obj, originalSel, ctx)
      }
    }

    let imp = imp_implementationWithBlock(newIMP)
    class_replaceMethod(cls, originalSel, imp, method_getTypeEncoding(original))
    NSLog("[ZoomTransition] installed zoom on RNSScreenStackAnimator")
  }

  private static func runZoom(animator obj: AnyObject, context: UIViewControllerContextTransitioning) {
    guard
      let toVC = context.viewController(forKey: .to),
      let fromVC = context.viewController(forKey: .from)
    else {
      context.completeTransition(false)
      return
    }

    let container = context.containerView
    toVC.view.frame = context.finalFrame(for: toVC)

    // Push: toVC not yet in the container. Pop: fromVC is on top.
    let pushing = toVC.view.superview == nil

    let src = ZoomTransitionState.frame
    let bw = max(container.bounds.width, 1)
    let bh = max(container.bounds.height, 1)
    let s0 = max(src.width / bw, src.height / bh)
    let tx = src.midX - container.bounds.midX
    let ty = src.midY - container.bounds.midY
    let zoom = CGAffineTransform(translationX: tx, y: ty).scaledBy(x: s0, y: s0)
    let radius = ZoomTransitionState.radius

    // Apple app-open curve
    let timing = UICubicTimingParameters(animationCurve: .easeInOut)

    if pushing {
      toVC.view.transform = zoom
      toVC.view.layer.cornerRadius = radius
      toVC.view.layer.masksToBounds = true
      container.addSubview(toVC.view)

      let anim = UIViewPropertyAnimator(duration: 0.48, timingParameters: timing)
      anim.addAnimations {
        toVC.view.transform = .identity
        toVC.view.layer.cornerRadius = 0
      }
      anim.addCompletion { _ in
        toVC.view.transform = .identity
        toVC.view.layer.cornerRadius = 0
        toVC.view.layer.masksToBounds = false
        ZoomTransitionState.clear()
        context.completeTransition(!context.transitionWasCancelled)
      }
      inFlight = anim
      anim.startAnimation()
    } else {
      container.insertSubview(toVC.view, belowSubview: fromVC.view)
      fromVC.view.layer.cornerRadius = radius
      fromVC.view.layer.masksToBounds = true

      let apply = {
        fromVC.view.transform = zoom
        fromVC.view.layer.cornerRadius = radius
      }
      let finish: (UIViewAnimatingPosition) -> Void = { _ in
        fromVC.view.transform = .identity
        fromVC.view.layer.cornerRadius = 0
        fromVC.view.layer.masksToBounds = false
        ZoomTransitionState.clear()
        context.completeTransition(!context.transitionWasCancelled)
      }

      if context.isInteractive {
        // Interruptible animator for swipe-back.
        let anim = UIViewPropertyAnimator(duration: 0.38, curve: .linear, animations: apply)
        anim.addCompletion(finish)
        anim.isUserInteractionEnabled = true
        inFlight = anim
        // Do not start — system scrubs it during the gesture.
      } else {
        let anim = UIViewPropertyAnimator(duration: 0.38, timingParameters: timing)
        anim.addAnimations(apply)
        anim.addCompletion(finish)
        inFlight = anim
        anim.startAnimation()
      }
    }
  }
}
