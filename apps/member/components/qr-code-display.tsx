"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui";

export function QRCodeDisplay({
  qrCode,
  memberNumber,
  gymName,
}: {
  qrCode: string;
  memberNumber: string;
  gymName: string;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(qrCode, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    }).then(setQrDataUrl);
  }, [qrCode]);

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="text-center">
        <CardTitle>Your Membership QR</CardTitle>
        <CardDescription>Show this at the gym entrance</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="Membership QR Code"
            className="rounded-lg shadow-lg"
          />
        ) : (
          <div className="h-64 w-64 animate-pulse rounded-lg bg-muted" />
        )}
        <div className="text-center">
          <p className="font-mono text-lg font-bold">{memberNumber}</p>
          <p className="text-sm text-muted-foreground">{gymName}</p>
        </div>
      </CardContent>
    </Card>
  );
}
