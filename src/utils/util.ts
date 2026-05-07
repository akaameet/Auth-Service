export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateOtpHTML(otp: string): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>OTP Verification</title>
    </head>

    <body
      style="
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        font-family: Arial, Helvetica, sans-serif;
      "
    >
      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color: #f4f4f4; padding: 40px 0;"
      >
        <tr>
          <td align="center">
            <table
              width="500"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                background-color: #ffffff;
                border-radius: 10px;
                padding: 40px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.08);
              "
            >
              <tr>
                <td align="center">
                  <h1
                    style="
                      margin: 0;
                      font-size: 24px;
                      color: #111827;
                    "
                  >
                    Verify Your Email
                  </h1>

                  <p
                    style="
                      margin-top: 16px;
                      font-size: 16px;
                      color: #4b5563;
                      line-height: 1.6;
                    "
                  >
                    Use the OTP below to complete your verification process.
                  </p>

                  <div
                    style="
                      margin: 30px 0;
                      padding: 16px 24px;
                      background-color: #f3f4f6;
                      border-radius: 8px;
                      display: inline-block;
                      font-size: 32px;
                      font-weight: bold;
                      letter-spacing: 8px;
                      color: #111827;
                    "
                  >
                    ${otp}
                  </div>

                  <p
                    style="
                      margin-top: 10px;
                      font-size: 14px;
                      color: #6b7280;
                    "
                  >
                    This OTP will expire in 5 minutes.
                  </p>

                  <hr
                    style="
                      margin: 30px 0;
                      border: none;
                      border-top: 1px solid #e5e7eb;
                    "
                  />

                  <p
                    style="
                      font-size: 13px;
                      color: #9ca3af;
                      line-height: 1.5;
                    "
                  >
                    If you did not request this email, you can safely ignore it.
                  </p>

                  <p
                    style="
                      margin-top: 20px;
                      font-size: 13px;
                      color: #9ca3af;
                    "
                  >
                    © 2026 Auth Service. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}
