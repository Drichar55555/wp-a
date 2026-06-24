import QRCode from "qrcode";

export async function generateQRCodeSVG(
  data: string,
  size = 300
): Promise<string> {
  return QRCode.toString(data, {
    type: "svg",
    width: size,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
}

export async function generateQRCodeDataURL(
  data: string,
  size = 300
): Promise<string> {
  return QRCode.toDataURL(data, {
    width: size,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
}
