import ExpoModulesCore
import UIKit
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins

public class StickerizerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Stickerizer")

    AsyncFunction("stickerize") { (inputUri: String) -> [String: Any] in
      try Self.stickerize(inputUri: inputUri)
    }
  }

  private static let context = CIContext(options: nil)
  private static let outlineWidth: CGFloat = 14

  private static func stickerize(inputUri: String) throws -> [String: Any] {
    let url = normalizeFileURL(inputUri)
    guard let uiImage = UIImage(contentsOfFile: url.path),
          var ciImage = CIImage(image: uiImage) else {
      throw Exception(name: "DECODE_ERROR", description: "Unable to load image")
    }

    // Normalize orientation baked into pixel buffer
    if uiImage.imageOrientation != .up {
      ciImage = ciImage.oriented(forExifOrientation: Int32(uiImage.imageOrientation.exifOrientation))
    }

    let lifted = try liftSubject(from: ciImage)
    let sticker = applyWhiteOutline(to: lifted.image, mask: lifted.mask)
    let cropped = trimTransparent(sticker) ?? sticker

    let outURL = FileManager.default.temporaryDirectory
      .appendingPathComponent("sticker-\(UUID().uuidString).png")
    guard let cg = context.createCGImage(cropped, from: cropped.extent) else {
      throw Exception(name: "ENCODE_ERROR", description: "Unable to encode sticker")
    }
    let png = UIImage(cgImage: cg)
    guard let data = png.pngData() else {
      throw Exception(name: "ENCODE_ERROR", description: "Unable to write PNG")
    }
    try data.write(to: outURL, options: .atomic)

    return [
      "uri": outURL.absoluteString,
      "didLiftSubject": true,
      "contentType": "image/png",
    ]
  }

  private static func normalizeFileURL(_ input: String) -> URL {
    if input.hasPrefix("file://") {
      return URL(string: input) ?? URL(fileURLWithPath: input)
    }
    return URL(fileURLWithPath: input)
  }

  private static func liftSubject(from image: CIImage) throws -> (image: CIImage, mask: CIImage) {
    if #available(iOS 17.0, *) {
      let handler = VNImageRequestHandler(ciImage: image, options: [:])
      let request = VNGenerateForegroundInstanceMaskRequest()
      do {
        try handler.perform([request])
      } catch {
        throw Exception(name: "VISION_ERROR", description: error.localizedDescription)
      }
      guard let result = request.results?.first else {
        throw Exception(name: "PROCESS_ERROR", description: "No foreground subject found")
      }
      let maskBuffer = try result.generateScaledMaskForImage(
        forInstances: result.allInstances,
        from: handler
      )
      let mask = CIImage(cvPixelBuffer: maskBuffer)
      let cutout = applyMask(mask, to: image)
      return (cutout, mask)
    } else {
      throw Exception(name: "REQUIRES_IOS_17", description: "Subject lift needs iOS 17+")
    }
  }

  private static func applyMask(_ mask: CIImage, to image: CIImage) -> CIImage {
    let filter = CIFilter.blendWithMask()
    filter.inputImage = image
    filter.maskImage = mask
    filter.backgroundImage = CIImage.empty().cropped(to: image.extent)
    return filter.outputImage?.cropped(to: image.extent) ?? image
  }

  /// Dilate the mask into a white silhouette, then composite the cutout on top.
  private static func applyWhiteOutline(to cutout: CIImage, mask: CIImage) -> CIImage {
    let scaledMask = mask.transformed(
      by: CGAffineTransform(
        scaleX: cutout.extent.width / max(mask.extent.width, 1),
        y: cutout.extent.height / max(mask.extent.height, 1)
      )
    )

    // Expand mask for stroke
    let dilated = scaledMask
      .applyingFilter("CIMorphologyMaximum", parameters: [
        kCIInputRadiusKey: outlineWidth,
      ])
      .cropped(to: cutout.extent.insetBy(dx: -outlineWidth, dy: -outlineWidth))

    let white = CIImage(color: .white).cropped(to: dilated.extent)
    let silhouetteFilter = CIFilter.blendWithMask()
    silhouetteFilter.inputImage = white
    silhouetteFilter.maskImage = dilated
    silhouetteFilter.backgroundImage = CIImage.empty().cropped(to: dilated.extent)
    guard let silhouette = silhouetteFilter.outputImage else { return cutout }

    // Place cutout centered on silhouette extent
    let dx = dilated.extent.minX - cutout.extent.minX
    let dy = dilated.extent.minY - cutout.extent.minY
    let placed = cutout.transformed(by: CGAffineTransform(translationX: dx, y: dy))

    return placed.composited(over: silhouette).cropped(to: dilated.extent)
  }

  private static func trimTransparent(_ image: CIImage) -> CIImage? {
    guard let cg = context.createCGImage(image, from: image.extent) else { return nil }
    let w = cg.width
    let h = cg.height
    guard let data = cg.dataProvider?.data,
          let ptr = CFDataGetBytePtr(data) else { return nil }
    let bpp = 4
    var minX = w, minY = h, maxX = 0, maxY = 0
    var found = false
    for y in 0..<h {
      for x in 0..<w {
        let a = ptr[(y * w + x) * bpp + 3]
        if a > 16 {
          found = true
          minX = min(minX, x)
          minY = min(minY, y)
          maxX = max(maxX, x)
          maxY = max(maxY, y)
        }
      }
    }
    guard found else { return nil }
    let pad = Int(outlineWidth)
    minX = max(0, minX - pad)
    minY = max(0, minY - pad)
    maxX = min(w - 1, maxX + pad)
    maxY = min(h - 1, maxY + pad)
    // CG is top-left; CI extent is bottom-left
    let rect = CGRect(
      x: image.extent.minX + CGFloat(minX),
      y: image.extent.minY + CGFloat(h - 1 - maxY),
      width: CGFloat(maxX - minX + 1),
      height: CGFloat(maxY - minY + 1)
    )
    return image.cropped(to: rect).transformed(
      by: CGAffineTransform(translationX: -rect.minX, y: -rect.minY)
    )
  }
}

private extension UIImage.Orientation {
  var exifOrientation: Int32 {
    switch self {
    case .up: return 1
    case .down: return 3
    case .left: return 8
    case .right: return 6
    case .upMirrored: return 2
    case .downMirrored: return 4
    case .leftMirrored: return 5
    case .rightMirrored: return 7
    @unknown default: return 1
    }
  }
}
